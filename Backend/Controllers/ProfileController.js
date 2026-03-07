const { UserModel } = require("../Models/users");
const { ClubModel } = require("../Models/club");
const bcrypt = require("bcryptjs");
const cloudinary = require("../Config/cloudinary");

// Helper: upload buffer to Cloudinary using upload_stream
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

// Helper: extract Cloudinary public_id from a URL for deletion
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary")) return null;
  try {
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/filename.ext
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1].replace(/^v\d+\//, ""); // remove version
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ""); // remove extension
    return publicId;
  } catch {
    return null;
  }
};

// get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const user = await UserModel.findById(userId)
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate("collegeId", "name location logo")
      .populate("clubId", "name category description logo socialLinks");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
  }
};

// update basic profile info
const updateBasicProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phoneNumber, department, yearOfStudy } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (department) updateData.department = department;
    if (yearOfStudy) updateData.yearOfStudy = yearOfStudy;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate("collegeId", "name location logo")
      .populate("clubId", "name category description logo socialLinks");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
  }
};

// update club info (organizers only, updates Club collection)
const updateClubInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, category, description, socialLinks } = req.body;

    const user = await UserModel.findById(userId);
    if (!user || !user.clubId) {
      return res.status(400).json({ success: false, message: "No club linked to this user" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (socialLinks) updateData.socialLinks = socialLinks;

    const updatedClub = await ClubModel.findByIdAndUpdate(
      user.clubId,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Club information updated successfully",
      data: updatedClub
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating club information", error: error.message });
  }
};

// upload profile picture (to Cloudinary, no local files)
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    // Delete old image from Cloudinary if it exists
    const oldPublicId = getPublicIdFromUrl(user.profilePicture);
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (err) {
        console.error("Failed to delete old profile picture from Cloudinary:", err);
      }
    }

    // Upload new image buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "campuseventhub/profiles",
      transformation: [
        { width: 400, height: 400, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    user.profilePicture = result.secure_url;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: { profilePicture: result.secure_url }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error uploading profile picture", error: error.message });
  }
};

// upload club logo (to Cloudinary, no local files)
const uploadClubLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user.clubId) {
      return res.status(400).json({ success: false, message: "No club linked to this user" });
    }

    const club = await ClubModel.findById(user.clubId);

    // Delete old logo from Cloudinary if it exists
    const oldPublicId = getPublicIdFromUrl(club.logo);
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (err) {
        console.error("Failed to delete old club logo from Cloudinary:", err);
      }
    }

    // Upload new logo buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "campuseventhub/clubs",
      transformation: [
        { width: 400, height: 400, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    club.logo = result.secure_url;
    await club.save();

    return res.status(200).json({
      success: true,
      message: "Club logo uploaded successfully",
      data: { clubLogo: result.secure_url }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error uploading club logo", error: error.message });
  }
};

// delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user.profilePicture) {
      return res.status(404).json({ success: false, message: "No profile picture to delete" });
    }

    // Delete from Cloudinary
    const publicId = getPublicIdFromUrl(user.profilePicture);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Failed to delete profile picture from Cloudinary:", err);
      }
    }

    user.profilePicture = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Profile picture deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting profile picture", error: error.message });
  }
};

// delete club logo
const deleteClubLogo = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user.clubId) {
      return res.status(400).json({ success: false, message: "No club linked to this user" });
    }

    const club = await ClubModel.findById(user.clubId);

    if (!club.logo) {
      return res.status(404).json({ success: false, message: "No club logo to delete" });
    }

    // Delete from Cloudinary
    const publicId = getPublicIdFromUrl(club.logo);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Failed to delete club logo from Cloudinary:", err);
      }
    }

    club.logo = null;
    await club.save();

    return res.status(200).json({ success: true, message: "Club logo deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting club logo", error: error.message });
  }
};

// change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await UserModel.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error changing password", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateBasicProfile,
  updateClubInfo,
  uploadProfilePicture,
  uploadClubLogo,
  deleteProfilePicture,
  deleteClubLogo,
  changePassword
};
