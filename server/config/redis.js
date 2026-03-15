const Redis = require('ioredis');
require('dotenv').config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};

// Create Redis client
const redis = new Redis(redisConfig);

// Test connection
const testConnection = async () => {
  try {
    await redis.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    process.exit(1);
  }
};

// Handle connection events
redis.on('connect', () => {
  console.log('🔗 Redis client connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis client ready');
});

redis.on('error', (error) => {
  console.error('❌ Redis client error:', error.message);
});

redis.on('close', () => {
  console.log('🔌 Redis client connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Utility functions
const cache = {
  // Set cache with expiration
  set: async (key, value, ttl = 3600) => {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },

  // Get cache value
  get: async (key) => {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },

  // Delete cache key
  del: async (key) => {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },

  // Clear all cache
  clear: async () => {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error.message);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  }
};

module.exports = {
  redis,
  testConnection,
  cache
};
