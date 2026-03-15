const express = require('express');
const JobController = require('../controllers/jobController');

const router = express.Router();

// GET /api/job/:jobId - Get job status
router.get('/:jobId', JobController.getJobStatus);

// GET /api/jobs - Get all jobs (admin only)
router.get('/', JobController.getAllJobs);

// GET /api/jobs/stats - Get job statistics (admin only)
router.get('/stats', JobController.getJobStats);

// POST /api/job/:jobId/cancel - Cancel job (admin only)
router.post('/:jobId/cancel', JobController.cancelJob);

// POST /api/job/:jobId/retry - Retry failed job (admin only)
router.post('/:jobId/retry', JobController.retryJob);

module.exports = router;
