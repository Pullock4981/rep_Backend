const multer = require('multer');
const path = require('path');
const fs = require('fs');
const constants = require('../config/constants');
const AppError = require('../exceptions/AppError');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    // Create subdirectories based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadDir, 'images');
    } else if (file.mimetype.startsWith('application/')) {
      uploadPath = path.join(uploadDir, 'documents');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...constants.ALLOWED_IMAGE_TYPES,
    ...constants.ALLOWED_DOCUMENT_TYPES,
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: constants.MAX_FILE_SIZE,
  },
  fileFilter,
});

// Export upload middleware
exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);

