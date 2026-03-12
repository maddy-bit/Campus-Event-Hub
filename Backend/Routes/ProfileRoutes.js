const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateBasicProfile,
  updateClubInfo,
  uploadProfilePicture,
  uploadClubLogo,
  deleteProfilePicture,
  deleteClubLogo,
  changePassword,
  getCollegeClubs,
} = require('../Controllers/ProfileController');
const { verifyToken } = require('../Middleware/AuthMiddleware');
const { checkOrganizerRole, checkProfileOwnership } = require('../Middleware/RoleMiddleware');
const upload = require('../utils/uploadConfig');

router.get('/college-clubs', verifyToken, getCollegeClubs);

router.put('/basic', verifyToken, checkProfileOwnership, updateBasicProfile);
router.put('/club', verifyToken, checkOrganizerRole, updateClubInfo);
router.post('/upload/profile-picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);
router.post('/upload/club-logo', verifyToken, checkOrganizerRole, upload.single('clubLogo'), uploadClubLogo);
router.delete('/profile-picture', verifyToken, deleteProfilePicture);
router.delete('/club-logo', verifyToken, checkOrganizerRole, deleteClubLogo);
router.put('/change-password', verifyToken, changePassword);

router.get('/:userId?', verifyToken, getProfile);

module.exports = router;
