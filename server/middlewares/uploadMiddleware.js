const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    try {
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'text/plain'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and TXT files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
});

// Middleware for single file upload
const uploadSingle = upload.single('file');

// Enhanced upload middleware with error handling
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one file is allowed'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
      
    } else if (err) {
      // Other errors
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // No error, continue
    next();
  });
};

// Middleware to validate uploaded file
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Additional validation
  const file = req.file;
  const allowedTypes = ['application/pdf', 'text/plain'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    // Clean up uploaded file
    fs.unlink(file.path).catch(console.error);
    
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only PDF and TXT files are allowed'
    });
  }

  if (file.size > 10 * 1024 * 1024) {
    // Clean up uploaded file
    fs.unlink(file.path).catch(console.error);
    
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 10MB'
    });
  }

  next();
};

// Middleware to add file metadata to request
const addFileMetadata = (req, res, next) => {
  if (req.file) {
    req.fileMetadata = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadTime: new Date().toISOString()
    };
  }
  
  next();
};

module.exports = {
  handleUpload,
  validateUploadedFile,
  addFileMetadata
};
