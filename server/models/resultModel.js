const { pool } = require('../config/db');

class ResultModel {
  // Create new result
  static async create(resultData) {
    const { 
      job_id, 
      word_count = 0, 
      paragraph_count = 0, 
      keywords = [], 
      processing_time = 0 
    } = resultData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO results (job_id, word_count, paragraph_count, keywords, processing_time) VALUES (?, ?, ?, ?, ?)',
        [job_id, word_count, paragraph_count, JSON.stringify(keywords), processing_time]
      );
      
      return {
        id: result.insertId,
        job_id,
        word_count,
        paragraph_count,
        keywords,
        processing_time,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Find result by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM results WHERE id = ?',
        [id]
      );
      
      if (rows[0]) {
        // Parse JSON keywords
        rows[0].keywords = JSON.parse(rows[0].keywords || '[]');
      }
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find result by job ID
  static async findByJobId(jobId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM results WHERE job_id = ?',
        [jobId]
      );
      
      if (rows[0]) {
        // Parse JSON keywords
        rows[0].keywords = JSON.parse(rows[0].keywords || '[]');
      }
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update result
  static async update(id, resultData) {
    const { word_count, paragraph_count, keywords, processing_time } = resultData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE results SET word_count = ?, paragraph_count = ?, keywords = ?, processing_time = ? WHERE id = ?',
        [word_count, paragraph_count, JSON.stringify(keywords), processing_time, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete result
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM results WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all results with pagination
  static async findAll(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM results ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      // Parse JSON keywords for each result
      return rows.map(row => ({
        ...row,
        keywords: JSON.parse(row.keywords || '[]')
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get result count
  static async getCount() {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM results'
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get results with job and file information
  static async getResultsWithDetails(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          r.*,
          j.status as job_status,
          j.progress as job_progress,
          f.original_name,
          f.file_type,
          u.name as user_name,
          u.email as user_email
        FROM results r
        JOIN jobs j ON r.job_id = j.id
        JOIN files f ON j.file_id = f.id
        JOIN users u ON f.user_id = u.id
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      // Parse JSON keywords for each result
      return rows.map(row => ({
        ...row,
        keywords: JSON.parse(row.keywords || '[]')
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          COUNT(*) as total_results,
          AVG(word_count) as avg_word_count,
          AVG(paragraph_count) as avg_paragraph_count,
          AVG(processing_time) as avg_processing_time
        FROM results
      `);
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get top keywords across all results
  static async getTopKeywords(limit = 10) {
    try {
      const [rows] = await pool.execute(`
        SELECT keywords FROM results
      `);
      
      // Aggregate all keywords
      const allKeywords = [];
      rows.forEach(row => {
        const keywords = JSON.parse(row.keywords || '[]');
        allKeywords.push(...keywords);
      });
      
      // Count keyword frequency
      const keywordCount = {};
      allKeywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
      
      // Sort by frequency and return top keywords
      return Object.entries(keywordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([keyword, count]) => ({ keyword, count }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ResultModel;
