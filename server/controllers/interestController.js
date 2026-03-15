const UserModel = require('../models/userModel');
const { cache } = require('../config/redis');

class InterestController {
  // Submit interest form
  static async submitInterest(req, res) {
    try {
      const { name, email, selectedStep } = req.body;

      // Validate input
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check if user already exists
      let user = await UserModel.findByEmail(email);
      
      if (!user) {
        // Create new user
        user = await UserModel.create({ name, email });
      }

      // Cache the interest submission
      const cacheKey = `interest:${user.id}:${Date.now()}`;
      await cache.set(cacheKey, {
        name,
        email,
        selectedStep,
        timestamp: new Date().toISOString()
      }, 86400); // Cache for 24 hours

      res.status(201).json({
        success: true,
        message: 'Interest submitted successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          selectedStep
        }
      });

    } catch (error) {
      console.error('Interest submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all interest submissions (admin only)
  static async getInterests(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      // Get all users (representing interest submissions)
      const users = await UserModel.findAll(parseInt(limit), parseInt(offset));
      const total = await UserModel.getCount();

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        }
      });

    } catch (error) {
      console.error('Get interests error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get interest statistics (admin only)
  static async getInterestStats(req, res) {
    try {
      const totalUsers = await UserModel.getCount();
      
      // Get recent submissions (last 7 days)
      const recentUsers = await UserModel.findAll(100, 0);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCount = recentUsers.filter(user => 
        new Date(user.created_at) >= sevenDaysAgo
      ).length;

      res.json({
        success: true,
        data: {
          totalSubmissions: totalUsers,
          recentSubmissions: recentCount,
          averagePerDay: Math.round(totalUsers / 30) // Assuming 30 days
        }
      });

    } catch (error) {
      console.error('Get interest stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = InterestController;
