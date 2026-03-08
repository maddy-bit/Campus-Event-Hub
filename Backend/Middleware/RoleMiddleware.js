// check if user has organizer/admin/superadmin role
const checkOrganizerRole = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user.role === 'organizer' || req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    return res.status(403).json({ success: false, message: "Access denied. Only organizers can update club information." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error checking user role", error: error.message });
  }
};

// check if user can only update their own profile
const checkProfileOwnership = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const profileUserId = req.params.userId || req.user._id.toString();
    
    if (req.user._id.toString() === profileUserId || 
        req.user.role === 'admin' || 
        req.user.role === 'superadmin') {
      return next();
    }

    return res.status(403).json({ success: false, message: "Access denied. You can only update your own profile." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error checking profile ownership", error: error.message });
  }
};

module.exports = {
  checkOrganizerRole,
  checkProfileOwnership
};
