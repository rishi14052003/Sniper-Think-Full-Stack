const { FileProcessingService } = require('../services/fileProcessingService');

// File processing worker
const fileProcessor = async (job) => {
  const { jobId, fileId, filePath, fileType, retry = false } = job.data;
  
  console.log(`🔄 Starting file processing job: ${job.id}`);
  
  try {
    // Validate file if not a retry
    if (!retry) {
      await FileProcessingService.validateFile(filePath, fileType);
    }
    
    // Process the file
    const result = await FileProcessingService.processFile({
      jobId,
      fileId,
      filePath,
      fileType
    });
    
    console.log(`✅ File processing job completed: ${job.id}`);
    return result;
    
  } catch (error) {
    console.error(`❌ File processing job failed: ${job.id}`, error.message);
    
    // Clean up file on final failure
    if (job.attemptsMade >= job.opts.attempts) {
      await FileProcessingService.cleanupFile(filePath);
    }
    
    throw error;
  }
};

module.exports = { fileProcessor };
