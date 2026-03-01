const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateBasicProfile,
  updateClubInfo,
  uploadProfilePicture,
  uploadClubLogo,
  deleteProfilePicture,
  deleteClubLogo
} = require('../Controllers/ProfileController');
const { verifyToken } = require('../Middleware/AuthMiddleware');
const { checkOrganizerRole, checkProfileOwnership } = require('../Middleware/RoleMiddleware');
const upload = require('../utils/uploadConfig');

// Get profile (own or specific user)
router.get('/:userId?', verifyToken, getProfile);

// Update basic profile information (all users)
router.put('/basic', verifyToken, checkProfileOwnership, updateBasicProfile);

// Update club information (organizers only)
router.put('/club', verifyToken, checkOrganizerRole, updateClubInfo);

// Upload profile picture (all users)
router.post('/upload/profile-picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);

// Upload club logo (organizers only)
router.post('/upload/club-logo', verifyToken, checkOrganizerRole, upload.single('clubLogo'), uploadClubLogo);

// Delete profile picture (all users)
router.delete('/profile-picture', verifyToken, deleteProfilePicture);

// Delete club logo (organizers only)
router.delete('/club-logo', verifyToken, checkOrganizerRole, deleteClubLogo);

module.exports = router;
