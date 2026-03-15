const express = require('express');
const UploadController = require('../controllers/uploadController');

const router = express.Router();

// POST /api/upload - Upload file
router.post('/', UploadController.uploadFile);

// GET /api/upload/status/:jobId - Get upload status
router.get('/status/:jobId', UploadController.getUploadStatus);

// GET /api/uploads - Get user uploads
router.get('/', UploadController.getUserUploads);

// DELETE /api/upload/:fileId - Delete uploaded file
router.delete('/:fileId', UploadController.deleteUpload);

module.exports = router;
