const { ConnectionModel } = require("../Models/Connection");
const { ChatMessageModel } = require("../Models/ChatMessage");
const { EventModel } = require("../Models/event");
const { ERegistrationModel } = require("../Models/ERegistration");

const networkingSocket = (io) => {
  // Map to track active users. Structure: userId -> { socketId, eventId, profile: { fullName, interests, ... } }
  const activeUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`[Socket] Peer connected: ${socket.id}`);

    // --- 1. Join Event Networking Room ---
    socket.on("joinEventRoom", async (payload, callback) => {
      try {
        const { userId, eventId, userProfile } = payload;
        
        // Basic validation
        if (!userId || !eventId || !userProfile) {
          return callback({ success: false, message: "Missing required payload data." });
        }

        // Leave previous rooms if any
        Array.from(socket.rooms).forEach(room => {
          if (room !== socket.id) socket.leave(room);
        });

        // Join the Socket.io room for this specific event
        const roomName = `event_${eventId}`;
        socket.join(roomName);

        // Save active user info to memory
        activeUsers.set(userId, {
          socketId: socket.id,
          eventId,
          profile: userProfile,
        });

        // Send back success
        if (callback) callback({ success: true, room: roomName });

        // Broadcast updated online peers to everyone in this event room
        emitActivePeers(eventId);
      } catch (err) {
        console.error("[Socket] joinEventRoom error:", err);
        if (callback) callback({ success: false, message: "Internal server error." });
      }
    });

    // --- 1.5. Join Chat Session (Reconnect logic) ---
    socket.on("joinChatSession", async (payload, callback) => {
      try {
        const { connectionId, userId } = payload;
        
        const connection = await ConnectionModel.findById(connectionId);
        if (!connection || connection.status !== "Accepted") {
          return callback({ success: false, message: "Chat session invalid or expired." });
        }

        // Just map their socket ID to userId so they can receive direct messages
        activeUsers.set(userId, {
          socketId: socket.id,
          eventId: connection.eventId,
          profile: {} // We don't need full profile for chat, just identification
        });

        // Determine peer ID
        const peerId = connection.requesterId.toString() === userId 
          ? connection.recipientId.toString() 
          : connection.requesterId.toString();

        if (callback) callback({ 
          success: true, 
          chatExpiresAt: connection.chatExpiresAt,
          peerId
        });
      } catch (err) {
        console.error("[Socket] joinChatSession error:", err);
        if (callback) callback({ success: false, message: "Internal server error." });
      }
    });

    // --- 1.6. Leave Chat (Manual Exit) ---
    socket.on("leaveChat", async (payload) => {
        const { connectionId, userId } = payload;
        const connection = await ConnectionModel.findById(connectionId);
        if (!connection) return;

        const peerId = connection.requesterId.toString() === userId 
          ? connection.recipientId.toString() 
          : connection.requesterId.toString();

        const peer = activeUsers.get(peerId);
        if (peer) {
            io.to(peer.socketId).emit("peerLeftChat", { connectionId });
        }
    });

    // --- 2. Request Connection (Send Connect Signal) ---
    socket.on("sendConnectRequest", async (payload, callback) => {
      try {
        const { requesterId, recipientId, eventId } = payload;

        // Ensure recipient is online
        const recipient = activeUsers.get(recipientId);
        if (!recipient || recipient.eventId !== eventId) {
          if (callback) callback({ success: false, message: "User is no longer online in this room." });
          return;
        }

        const requester = activeUsers.get(requesterId);

        // Check if there's already an active connection
        const existingConn = await ConnectionModel.findOne({
          requesterId: { $in: [requesterId, recipientId] },
          recipientId: { $in: [requesterId, recipientId] },
          status: { $in: ["Pending", "Accepted"] }
        });

        if (existingConn) {
          if (callback) callback({ success: false, message: "Connection request already sent or active." });
          return;
        }

        // Create a Pending connection record
        const newConnection = await ConnectionModel.create({
          eventId,
          requesterId,
          recipientId,
          status: "Pending"
        });

        // Notify recipient immediately
        io.to(recipient.socketId).emit("incomingConnectRequest", {
          connectionId: newConnection._id,
          requester: requester.profile
        });

        if (callback) callback({ success: true, connectionId: newConnection._id });
      } catch (err) {
        console.error("[Socket] sendConnectRequest error:", err);
        if (callback) callback({ success: false, message: "Could not send request." });
      }
    });

    // --- 3. Respond to Connection Request ---
    socket.on("respondConnectRequest", async (payload, callback) => {
      try {
        const { connectionId, action, responderId } = payload; // action: 'Accept' | 'Reject'

        const connection = await ConnectionModel.findById(connectionId);
        if (!connection || connection.status !== "Pending") {
          return callback({ success: false, message: "Connection request expired or invalid." });
        }

        if (action === "Accept") {
          connection.status = "Accepted";
          // set TTL to 10 minutes from now
          connection.chatExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
          await connection.save();

          // Notify requester that it was accepted
          const requester = activeUsers.get(connection.requesterId.toString());
          if (requester) {
            io.to(requester.socketId).emit("connectRequestAccepted", {
              connectionId,
              recipientId: responderId,
              chatExpiresAt: connection.chatExpiresAt
            });
          }
          if (callback) callback({ success: true, chatExpiresAt: connection.chatExpiresAt });
        } else {
          connection.status = "Rejected";
          await connection.save();

          // Notify requester that it was rejected
          const requester = activeUsers.get(connection.requesterId.toString());
          if (requester) {
            io.to(requester.socketId).emit("connectRequestRejected", { connectionId });
          }
          if (callback) callback({ success: true });
        }
      } catch (err) {
        console.error("[Socket] respondConnectRequest error:", err);
        if (callback) callback({ success: false, message: "Internal server error." });
      }
    });

    // --- 4. Send Message ---
    socket.on("sendMessage", async (payload, callback) => {
      try {
        const { connectionId, senderId, text } = payload;

        const connection = await ConnectionModel.findById(connectionId);
        if (!connection || connection.status !== "Accepted") {
          return callback({ success: false, message: "Not authorized or chat expired." });
        }

        const now = new Date();
        if (now > connection.chatExpiresAt) {
           connection.status = "Ended";
           await connection.save();
           return callback({ success: false, message: "Chat session has expired." });
        }

        // Save message to DB
        const msg = await ChatMessageModel.create({
          connectionId,
          senderId,
          content: text
        });

        // Figure out recipient ID
        const recipientId = connection.requesterId.toString() === senderId 
            ? connection.recipientId.toString() 
            : connection.requesterId.toString();

        const recipient = activeUsers.get(recipientId);

        if (recipient) {
          io.to(recipient.socketId).emit("receiveMessage", {
            _id: msg._id,
            connectionId,
            senderId,
            content: text,
            createdAt: msg.createdAt
          });
        }

        if (callback) callback({ success: true, message: msg });
      } catch (err) {
        console.error("[Socket] sendMessage error:", err);
      }
    });

    // --- Disconnect Handler ---
    socket.on("disconnect", () => {
      // Find the user who disconnected
      let disconnectedUserId = null;
      let eventId = null;

      for (const [uid, data] of activeUsers.entries()) {
        if (data.socketId === socket.id) {
          disconnectedUserId = uid;
          eventId = data.eventId;
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`[Socket] User ${disconnectedUserId} disconnected.`);
        activeUsers.delete(disconnectedUserId);

        // Notify potential chat peers if they were in a chat
        // We can search active connections for this user
        // But simpler: just emit to the event room that users list changed
        if (eventId) {
          emitActivePeers(eventId);
        }
        
        // Broadcast "peerDisconnected" to any direct active sockets that might be chatting with them
        // This is a bit brute force but ensures notification if they just closed the tab
        io.emit("peerDisconnected", { userId: disconnectedUserId });
      }
    });
  });

  // Helper function to emit the active peers list back to the room
  const emitActivePeers = (eventId) => {
    const peersInRoom = [];
    for (const [userId, data] of activeUsers.entries()) {
      if (data.eventId === eventId) {
        peersInRoom.push({ userId, profile: data.profile });
      }
    }
    // Broadcast the full list to everybody strictly in this event's room
    io.to(`event_${eventId}`).emit("activeUsersUpdate", peersInRoom);
  };
};

module.exports = networkingSocket;
