const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const { keywordService } = require('./keywordService');
const JobModel = require('../models/jobModel');
const ResultModel = require('../models/resultModel');
const { cache } = require('../config/redis');

class FileProcessingService {
  // Process uploaded file
  static async processFile(jobData) {
    const { jobId, fileId, filePath, fileType } = jobData;
    
    try {
      console.log(`🔄 Processing file for job ${jobId}`);
      
      // Update job status to processing
      await JobModel.updateStatus(jobId, 'processing', 0);
      await cache.set(`job:${jobId}`, { id: jobId, status: 'processing', progress: 0 }, 3600);

      // Extract text from file
      const text = await this.extractText(filePath, fileType, jobId);
      
      // Update progress
      await JobModel.updateProgress(jobId, 50);
      await cache.set(`job:${jobId}`, { id: jobId, status: 'processing', progress: 50 }, 3600);

      // Analyze text
      const analysis = await this.analyzeText(text, jobId);
      
      // Update progress
      await JobModel.updateProgress(jobId, 90);
      await cache.set(`job:${jobId}`, { id: jobId, status: 'processing', progress: 90 }, 3600);

      // Save results
      await ResultModel.create({
        job_id: jobId,
        word_count: analysis.wordCount,
        paragraph_count: analysis.paragraphCount,
        keywords: analysis.topKeywords,
        processing_time: analysis.processingTime
      });

      // Update job to completed
      await JobModel.updateStatus(jobId, 'completed', 100);
      await cache.set(`job:${jobId}`, { id: jobId, status: 'completed', progress: 100 }, 3600);

      // Cache result
      await cache.set(`result:${jobId}`, {
        job_id: jobId,
        word_count: analysis.wordCount,
        paragraph_count: analysis.paragraphCount,
        keywords: analysis.topKeywords,
        processing_time: analysis.processingTime
      }, 3600);

      console.log(`✅ File processing completed for job ${jobId}`);
      
      return {
        success: true,
        jobId,
        analysis
      };

    } catch (error) {
      console.error(`❌ File processing failed for job ${jobId}:`, error.message);
      
      // Update job to failed
      await JobModel.updateStatus(jobId, 'failed', null, error.message);
      await cache.set(`job:${jobId}`, { 
        id: jobId, 
        status: 'failed', 
        progress: 0, 
        error_message: error.message 
      }, 3600);

      throw error;
    }
  }

  // Extract text from file
  static async extractText(filePath, fileType, jobId) {
    const startTime = Date.now();
    
    try {
      let text = '';

      if (fileType === 'text/plain') {
        // Read text file
        text = await fs.readFile(filePath, 'utf-8');
      } else if (fileType === 'application/pdf') {
        // Read PDF file
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        text = pdfData.text;
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Clean and normalize text
      text = this.cleanText(text);
      
      const processingTime = Date.now() - startTime;
      console.log(`📄 Text extraction completed for job ${jobId} (${text.length} chars, ${processingTime}ms)`);
      
      return text;

    } catch (error) {
      console.error(`❌ Text extraction failed for job ${jobId}:`, error.message);
      throw error;
    }
  }

  // Clean and normalize text
  static cleanText(text) {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters but keep basic punctuation
      .replace(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\"\'\/\\]/g, '')
      // Trim
      .trim();
  }

  // Analyze text content
  static async analyzeText(text, jobId) {
    const startTime = Date.now();
    
    try {
      // Count words
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;

      // Count paragraphs
      const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
      const paragraphCount = paragraphs.length;

      // Extract keywords
      const topKeywords = await keywordService.extractKeywords(text, 10);

      const processingTime = Date.now() - startTime;
      
      console.log(`📊 Text analysis completed for job ${jobId}: ${wordCount} words, ${paragraphCount} paragraphs, ${processingTime}ms`);
      
      return {
        wordCount,
        paragraphCount,
        topKeywords,
        processingTime
      };

    } catch (error) {
      console.error(`❌ Text analysis failed for job ${jobId}:`, error.message);
      throw error;
    }
  }

  // Validate file before processing
  static async validateFile(filePath, fileType) {
    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Get file stats
      const stats = await fs.stat(filePath);
      
      // Check file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (stats.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }
      
      // Check file type
      const allowedTypes = ['text/plain', 'application/pdf'];
      if (!allowedTypes.includes(fileType)) {
        throw new Error('Unsupported file type');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ File validation failed:', error.message);
      throw error;
    }
  }

  // Get file processing statistics
  static async getProcessingStats() {
    try {
      const stats = await ResultModel.getStatistics();
      const topKeywords = await ResultModel.getTopKeywords(10);
      
      return {
        ...stats,
        topKeywords
      };
      
    } catch (error) {
      console.error('❌ Failed to get processing stats:', error.message);
      throw error;
    }
  }

  // Clean up temporary files
  static async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ File cleaned up: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to cleanup file ${filePath}:`, error.message);
      // Don't throw error, just log it
    }
  }
}

module.exports = { FileProcessingService };
