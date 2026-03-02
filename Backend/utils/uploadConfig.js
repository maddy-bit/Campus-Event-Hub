const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/profiles', 'uploads/clubs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      cb(null, 'uploads/profiles/');
    } else if (file.fieldname === 'clubLogo') {
      cb(null, 'uploads/clubs/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp, svg) are allowed!'));
};

// Upload configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

module.exports = upload;
