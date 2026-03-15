const express = require('express');
const InterestController = require('../controllers/interestController');

const router = express.Router();

// POST /api/interest - Submit interest form
router.post('/', InterestController.submitInterest);

// GET /api/interest - Get all interest submissions (admin only)
router.get('/', InterestController.getInterests);

// GET /api/interest/stats - Get interest statistics (admin only)
router.get('/stats', InterestController.getInterestStats);

module.exports = router;
