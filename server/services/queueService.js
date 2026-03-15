const { Queue, Worker } = require('bullmq');
const { redis } = require('../config/redis');

class QueueService {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
  }

  // Create or get a queue
  getQueue(name) {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: redis,
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 50,      // Keep last 50 failed jobs
          attempts: 3,           // Retry failed jobs 3 times
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      });
      
      this.queues.set(name, queue);
    }
    
    return this.queues.get(name);
  }

  // Add job to queue
  async addJob(queueName, jobData, options = {}) {
    try {
      const queue = this.getQueue(queueName);
      
      const job = await queue.add(
        queueName,
        jobData,
        {
          priority: options.priority || 0,
          delay: options.delay || 0,
          ...options
        }
      );

      console.log(`✅ Job added to queue '${queueName}': ${job.id}`);
      
      return {
        id: job.id,
        name: job.name,
        data: job.data,
        opts: job.opts,
        queueName
      };
      
    } catch (error) {
      console.error(`❌ Failed to add job to queue '${queueName}':`, error.message);
      throw error;
    }
  }

  // Create worker for queue
  createWorker(queueName, processor, options = {}) {
    if (this.workers.has(queueName)) {
      console.warn(`⚠️ Worker for queue '${queueName}' already exists`);
      return this.workers.get(queueName);
    }

    const worker = new Worker(
      queueName,
      processor,
      {
        connection: redis,
        concurrency: options.concurrency || 1,
        ...options
      }
    );

    // Worker event handlers
    worker.on('completed', (job) => {
      console.log(`✅ Job completed in queue '${queueName}': ${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ Job failed in queue '${queueName}': ${job.id}`, err.message);
    });

    worker.on('error', (err) => {
      console.error(`❌ Worker error in queue '${queueName}':`, err);
    });

    worker.on('stalled', (job) => {
      console.warn(`⚠️ Job stalled in queue '${queueName}': ${job.id}`);
    });

    this.workers.set(queueName, worker);
    
    console.log(`👷 Worker created for queue '${queueName}'`);
    
    return worker;
  }

  // Get queue statistics
  async getQueueStats(queueName) {
    try {
      const queue = this.getQueue(queueName);
      
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed()
      ]);

      return {
        queueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length
      };
      
    } catch (error) {
      console.error(`❌ Failed to get stats for queue '${queueName}':`, error.message);
      throw error;
    }
  }

  // Get all queues statistics
  async getAllQueueStats() {
    const stats = {};
    
    for (const queueName of this.queues.keys()) {
      try {
        stats[queueName] = await this.getQueueStats(queueName);
      } catch (error) {
        stats[queueName] = { error: error.message };
      }
    }
    
    return stats;
  }

  // Pause queue
  async pauseQueue(queueName) {
    try {
      const queue = this.getQueue(queueName);
      await queue.pause();
      console.log(`⏸️ Queue '${queueName}' paused`);
    } catch (error) {
      console.error(`❌ Failed to pause queue '${queueName}':`, error.message);
      throw error;
    }
  }

  // Resume queue
  async resumeQueue(queueName) {
    try {
      const queue = this.getQueue(queueName);
      await queue.resume();
      console.log(`▶️ Queue '${queueName}' resumed`);
    } catch (error) {
      console.error(`❌ Failed to resume queue '${queueName}':`, error.message);
      throw error;
    }
  }

  // Clear queue
  async clearQueue(queueName) {
    try {
      const queue = this.getQueue(queueName);
      await queue.drain();
      console.log(`🧹 Queue '${queueName}' cleared`);
    } catch (error) {
      console.error(`❌ Failed to clear queue '${queueName}':`, error.message);
      throw error;
    }
  }

  // Close all queues and workers
  async close() {
    console.log('🔄 Closing queue service...');
    
    // Close workers
    for (const [queueName, worker] of this.workers) {
      try {
        await worker.close();
        console.log(`✅ Worker for queue '${queueName}' closed`);
      } catch (error) {
        console.error(`❌ Failed to close worker for queue '${queueName}':`, error.message);
      }
    }

    // Close queues
    for (const [queueName, queue] of this.queues) {
      try {
        await queue.close();
        console.log(`✅ Queue '${queueName}' closed`);
      } catch (error) {
        console.error(`❌ Failed to close queue '${queueName}':`, error.message);
      }
    }

    this.queues.clear();
    this.workers.clear();
    
    console.log('✅ Queue service closed');
  }
}

// Create singleton instance
const queueService = new QueueService();

module.exports = { queueService, QueueService };
