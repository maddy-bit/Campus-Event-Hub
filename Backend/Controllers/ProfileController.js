const { UserModel } = require("../Models/users");
const fs = require('fs');
const path = require('path');

// get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const user = await UserModel.findById(userId).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

// update basic profile information (available to all users)
const updateBasicProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phoneNumber, collegeName, department, yearOfStudy } = req.body;

    console.log('Update request body:', req.body);
    console.log('User ID:', userId);

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (collegeName) updateData.collegeName = collegeName;
    if (department) updateData.department = department;
    if (yearOfStudy) updateData.yearOfStudy = yearOfStudy;

    console.log('Update data:', updateData);

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    console.log('Updated user:', updatedUser);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};

// update club information (only for organizers)
const updateClubInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { clubName, clubCategory, clubDescription, socialLinks } = req.body;

    // Check if user is organizer
    if (req.user.role !== 'organizer' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Only organizers can update club information"
      });
    }

    const updateData = {};
    if (clubName) updateData.clubName = clubName;
    if (clubCategory) updateData.clubCategory = clubCategory;
    if (clubDescription) updateData.clubDescription = clubDescription;
    if (socialLinks) updateData.socialLinks = socialLinks;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    return res.status(200).json({
      success: true,
      message: "Club information updated successfully",
      data: updatedUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating club information",
      error: error.message
    });
  }
};

// upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // pending uploading to cloud strg
    const profilePicturePath = `uploads/profiles/${req.file.filename}`;
    user.profilePicture = profilePicturePath;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: profilePicturePath
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error: error.message
    });
  }
};

// upload club logo (only for organizers)
const uploadClubLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (user.role !== 'organizer' && user.role !== 'admin' && user.role !== 'superadmin') {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: "Only organizers can upload club logo"
      });
    }

    if (user.clubLogo) {
      const oldPath = path.join(__dirname, '..', user.clubLogo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const clubLogoPath = `uploads/clubs/${req.file.filename}`;
    user.clubLogo = clubLogoPath;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Club logo uploaded successfully",
      data: {
        clubLogo: clubLogoPath
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error uploading club logo",
      error: error.message
    });
  }
};

//pending 
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user.profilePicture) {
      return res.status(404).json({
        success: false,
        message: "No profile picture to delete"
      });
    }

    const filePath = path.join(__dirname, '..', user.profilePicture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.profilePicture = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting profile picture",
      error: error.message
    });
  }
};

//pending
// delete club logo 
const deleteClubLogo = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (user.role !== 'organizer' && user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: "Only organizers can delete club logo"
      });
    }

    if (!user.clubLogo) {
      return res.status(404).json({
        success: false,
        message: "No club logo to delete"
      });
    }

    const filePath = path.join(__dirname, '..', user.clubLogo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.clubLogo = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Club logo deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting club logo",
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateBasicProfile,
  updateClubInfo,
  uploadProfilePicture,
  uploadClubLogo,
  deleteProfilePicture,
  deleteClubLogo
};
