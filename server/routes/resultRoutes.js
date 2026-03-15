const express = require('express');
const JobController = require('../controllers/jobController');

const router = express.Router();

// GET /api/result/:jobId - Get job result
router.get('/:jobId', JobController.getJobResult);

module.exports = router;
