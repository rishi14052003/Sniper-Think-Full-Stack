const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { testConnection, initializeDatabase } = require('./config/db');
const { testConnection: testRedisConnection } = require('./config/redis');
const { queueService } = require('./services/queueService');
const { fileProcessor } = require('./workers/fileWorker');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middlewares/errorMiddleware');

// Import routes
const interestRoutes = require('./routes/interestRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Upload rate limiting (stricter)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Too many upload requests, please try again later.'
  }
});

app.use('/api/upload', uploadLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Health check endpoint
app.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  // Check database connection
  try {
    const { pool } = require('./config/db');
    await pool.execute('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'ERROR';
  }

  // Check Redis connection
  try {
    const { redis } = require('./config/redis');
    await redis.ping();
    health.redis = 'connected';
  } catch (error) {
    health.redis = 'disconnected';
    health.status = 'ERROR';
  }

  // Check queue status
  try {
    const queueStats = await queueService.getAllQueueStats();
    health.queues = queueStats;
  } catch (error) {
    health.queues = 'error';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
}));

// API routes
app.use('/api/interest', interestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/result', resultRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  const apiDocs = {
    title: 'SniperThink API',
    version: '1.0.0',
    description: 'API for SniperThink FullStack Assignment',
    endpoints: {
      interest: {
        'POST /api/interest': 'Submit interest form',
        'GET /api/interest': 'Get all interest submissions (admin)',
        'GET /api/interest/stats': 'Get interest statistics (admin)'
      },
      upload: {
        'POST /api/upload': 'Upload file for processing',
        'GET /api/upload/status/:jobId': 'Get upload status',
        'GET /api/uploads': 'Get user uploads',
        'DELETE /api/upload/:fileId': 'Delete uploaded file'
      },
      job: {
        'GET /api/job/:jobId': 'Get job status',
        'GET /api/jobs': 'Get all jobs (admin)',
        'GET /api/jobs/stats': 'Get job statistics (admin)',
        'POST /api/job/:jobId/cancel': 'Cancel job (admin)',
        'POST /api/job/:jobId/retry': 'Retry failed job (admin)'
      },
      result: {
        'GET /api/result/:jobId': 'Get job result'
      },
      health: {
        'GET /health': 'Health check endpoint'
      }
    }
  };

  res.json(apiDocs);
});

// Static files (for uploads if needed)
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Initialize server
const initializeServer = async () => {
  try {
    console.log('🚀 Initializing server...');

    // Test database connection
    await testConnection();
    
    // Initialize database tables
    await initializeDatabase();
    
    // Test Redis connection (non-blocking - server works without it)
    const redisConnected = await testRedisConnection();
    
    // Set Redis availability in queue service
    queueService.setRedisAvailable(redisConnected);
    
    // Create file processing worker only if Redis is available
    if (redisConnected) {
      queueService.createWorker('file-processing', fileProcessor, {
        concurrency: 3 // Process 3 files concurrently
      });
    }
    
    console.log('✅ Server initialized successfully');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close queue service
    await queueService.close();
    
    // Close database connections
    const { pool } = require('./config/db');
    await pool.end();
    
    // Close Redis connection
    const { redis } = require('./config/redis');
    await redis.quit();
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = { app, initializeServer };
