const UserModel = require('../models/userModel');
const FileModel = require('../models/fileModel');
const JobModel = require('../models/jobModel');
const { queueService } = require('../services/queueService');
const { cache } = require('../config/redis');
const path = require('path');
const fs = require('fs').promises;

class UploadController {
  // Upload file and create processing job
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { originalname, filename, path: filePath, size, mimetype } = req.file;
      const { email } = req.body;

      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain'];
      if (!allowedTypes.includes(mimetype)) {
        // Clean up uploaded file
        await fs.unlink(filePath);
        
        return res.status(400).json({
          success: false,
          message: 'Only PDF and TXT files are allowed'
        });
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (size > maxSize) {
        // Clean up uploaded file
        await fs.unlink(filePath);
        
        return res.status(400).json({
          success: false,
          message: 'File size must be less than 10MB'
        });
      }

      // Find or create user
      let user;
      if (email) {
        user = await UserModel.findByEmail(email);
        if (!user) {
          user = await UserModel.create({ 
            name: 'File Upload User', 
            email 
          });
        }
      } else {
        // Create anonymous user
        user = await UserModel.create({ 
          name: 'Anonymous User', 
          email: `anonymous_${Date.now()}@example.com` 
        });
      }

      // Create file record
      const fileRecord = await FileModel.create({
        user_id: user.id,
        file_path: filePath,
        original_name: originalname,
        file_size: size,
        file_type: mimetype
      });

      // Create job record
      const jobRecord = await JobModel.create({
        file_id: fileRecord.id,
        status: 'pending',
        progress: 0
      });

      // Add job to queue
      await queueService.addJob('file-processing', {
        jobId: jobRecord.id,
        fileId: fileRecord.id,
        filePath: filePath,
        fileType: mimetype
      });

      // Cache job info
      await cache.set(`job:${jobRecord.id}`, {
        id: jobRecord.id,
        file_id: fileRecord.id,
        status: 'pending',
        progress: 0,
        created_at: jobRecord.created_at
      }, 3600); // Cache for 1 hour

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully and processing started',
        data: {
          jobId: jobRecord.id,
          fileId: fileRecord.id,
          originalName: originalname,
          fileSize: size,
          fileType: mimetype,
          status: 'pending',
          user: {
            id: user.id,
            email: user.email
          }
        }
      });

    } catch (error) {
      console.error('File upload error:', error);
      
      // Clean up uploaded file if it exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get upload status
  static async getUploadStatus(req, res) {
    try {
      const { jobId } = req.params;

      // Try to get from cache first
      let jobData = await cache.get(`job:${jobId}`);

      if (!jobData) {
        // Get from database
        jobData = await JobModel.findById(jobId);
        
        if (!jobData) {
          return res.status(404).json({
            success: false,
            message: 'Job not found'
          });
        }

        // Update cache
        await cache.set(`job:${jobId}`, jobData, 3600);
      }

      res.json({
        success: true,
        data: {
          jobId: jobData.id,
          status: jobData.status,
          progress: jobData.progress,
          errorMessage: jobData.error_message,
          createdAt: jobData.created_at,
          updatedAt: jobData.updated_at
        }
      });

    } catch (error) {
      console.error('Get upload status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all uploads for a user
  static async getUserUploads(req, res) {
    try {
      const { email } = req.query;
      const { limit = 10, offset = 0 } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's files with job information
      const files = await FileModel.getFilesWithJobs(
        user.id, 
        parseInt(limit), 
        parseInt(offset)
      );

      const total = await FileModel.getCountByUserId(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          files,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        }
      });

    } catch (error) {
      console.error('Get user uploads error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete uploaded file
  static async deleteUpload(req, res) {
    try {
      const { fileId } = req.params;

      // Get file record
      const file = await FileModel.findById(fileId);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete physical file
      try {
        await fs.unlink(file.file_path);
      } catch (fileError) {
        console.error('Physical file deletion error:', fileError);
        // Continue even if physical file deletion fails
      }

      // Delete file record (this will cascade to jobs and results)
      await FileModel.delete(fileId);

      // Clear cache
      await cache.del(`file:${fileId}`);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      console.error('Delete upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = UploadController;
