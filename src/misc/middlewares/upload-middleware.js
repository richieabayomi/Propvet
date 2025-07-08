const multer = require('multer');
const path = require('path');
const ApiResponse = require('../services/api-response');
const BadRequestError = require('../errors/BadRequestError');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter for basic type validation (e.g., PDF, images)
function fileFilter(req, file, cb) {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new BadRequestError('Only PDF, JPEG, and PNG files are allowed.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Error handling middleware for multer
function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return ApiResponse.error(res, new BadRequestError(err.message));
  } else if (err) {
    // Custom or unknown errors
    return ApiResponse.error(res, err instanceof BadRequestError ? err : new BadRequestError(err.message));
  }
  next();
}

module.exports = upload;
module.exports.uploadErrorHandler = uploadErrorHandler;
