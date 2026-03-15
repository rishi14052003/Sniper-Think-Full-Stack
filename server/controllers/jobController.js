const JobModel = require('../models/jobModel');
const ResultModel = require('../models/resultModel');
const FileModel = require('../models/fileModel');
const { cache } = require('../config/redis');

class JobController {
  // Get job status
  static async getJobStatus(req, res) {
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
      console.error('Get job status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get job result
  static async getJobResult(req, res) {
    try {
      const { jobId } = req.params;

      // Get job data
      const jobData = await JobModel.findById(jobId);
      if (!jobData) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if job is completed
      if (jobData.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Job is not completed yet',
          data: {
            jobId: jobData.id,
            status: jobData.status,
            progress: jobData.progress
          }
        });
      }

      // Get result data
      let resultData = await cache.get(`result:${jobId}`);
      
      if (!resultData) {
        resultData = await ResultModel.findByJobId(jobId);
        
        if (!resultData) {
          return res.status(404).json({
            success: false,
            message: 'Result not found'
          });
        }

        // Cache result
        await cache.set(`result:${jobId}`, resultData, 3600);
      }

      // Get file information
      const fileData = await FileModel.findById(jobData.file_id);

      res.json({
        success: true,
        data: {
          jobId: resultData.job_id,
          wordCount: resultData.word_count,
          paragraphCount: resultData.paragraph_count,
          topKeywords: resultData.keywords,
          processingTime: resultData.processing_time,
          file: fileData ? {
            id: fileData.id,
            originalName: fileData.original_name,
            fileType: fileData.file_type,
            fileSize: fileData.file_size
          } : null,
          createdAt: resultData.created_at
        }
      });

    } catch (error) {
      console.error('Get job result error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all jobs (admin only)
  static async getAllJobs(req, res) {
    try {
      const { status, limit = 20, offset = 0 } = req.query;

      let jobs;
      let total;

      if (status) {
        jobs = await JobModel.getByStatus(status, parseInt(limit), parseInt(offset));
        total = await JobModel.getCountByStatus(status);
      } else {
        jobs = await JobModel.getJobsWithDetails(parseInt(limit), parseInt(offset));
        total = await JobModel.getCount();
      }

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        }
      });

    } catch (error) {
      console.error('Get all jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get job statistics (admin only)
  static async getJobStats(req, res) {
    try {
      const totalJobs = await JobModel.getCount();
      const pendingJobs = await JobModel.getCountByStatus('pending');
      const processingJobs = await JobModel.getCountByStatus('processing');
      const completedJobs = await JobModel.getCountByStatus('completed');
      const failedJobs = await JobModel.getCountByStatus('failed');

      // Get result statistics
      const resultStats = await ResultModel.getStatistics();

      res.json({
        success: true,
        data: {
          total: totalJobs,
          pending: pendingJobs,
          processing: processingJobs,
          completed: completedJobs,
          failed: failedJobs,
          successRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
          avgProcessingTime: resultStats.avg_processing_time || 0,
          avgWordCount: Math.round(resultStats.avg_word_count || 0),
          avgParagraphCount: Math.round(resultStats.avg_paragraph_count || 0)
        }
      });

    } catch (error) {
      console.error('Get job stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Cancel job (admin only)
  static async cancelJob(req, res) {
    try {
      const { jobId } = req.params;

      const jobData = await JobModel.findById(jobId);
      if (!jobData) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Only allow cancellation of pending or processing jobs
      if (!['pending', 'processing'].includes(jobData.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel job that is already completed or failed'
        });
      }

      // Update job status to failed
      await JobModel.updateStatus(jobId, 'failed', null, 'Job cancelled by admin');

      // Clear cache
      await cache.del(`job:${jobId}`);

      res.json({
        success: true,
        message: 'Job cancelled successfully'
      });

    } catch (error) {
      console.error('Cancel job error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Retry failed job (admin only)
  static async retryJob(req, res) {
    try {
      const { jobId } = req.params;

      const jobData = await JobModel.findById(jobId);
      if (!jobData) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Only allow retry of failed jobs
      if (jobData.status !== 'failed') {
        return res.status(400).json({
          success: false,
          message: 'Can only retry failed jobs'
        });
      }

      // Reset job to pending
      await JobModel.updateStatus(jobId, 'pending', 0, null);

      // Clear cache
      await cache.del(`job:${jobId}`);

      // Re-add job to queue
      const { queueService } = require('../services/queueService');
      await queueService.addJob('file-processing', {
        jobId: jobData.id,
        fileId: jobData.file_id,
        retry: true
      });

      res.json({
        success: true,
        message: 'Job retry initiated successfully'
      });

    } catch (error) {
      console.error('Retry job error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = JobController;
