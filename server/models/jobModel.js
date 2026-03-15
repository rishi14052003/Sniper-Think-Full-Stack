const { pool } = require('../config/db');

class JobModel {
  // Create new job
  static async create(jobData) {
    const { file_id, status = 'pending', progress = 0 } = jobData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO jobs (file_id, status, progress) VALUES (?, ?, ?)',
        [file_id, status, progress]
      );
      
      return {
        id: result.insertId,
        file_id,
        status,
        progress,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Find job by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM jobs WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find jobs by file ID
  static async findByFileId(fileId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM jobs WHERE file_id = ? ORDER BY created_at DESC',
        [fileId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update job status and progress
  static async updateStatus(id, status, progress = null, errorMessage = null) {
    try {
      let query = 'UPDATE jobs SET status = ?';
      const params = [status];

      if (progress !== null) {
        query += ', progress = ?';
        params.push(progress);
      }

      if (errorMessage !== null) {
        query += ', error_message = ?';
        params.push(errorMessage);
      }

      query += ' WHERE id = ?';
      params.push(id);

      const [result] = await pool.execute(query, params);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update job progress
  static async updateProgress(id, progress) {
    try {
      const [result] = await pool.execute(
        'UPDATE jobs SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [progress, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get pending jobs
  static async getPendingJobs(limit = 10) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM jobs WHERE status = ? ORDER BY created_at ASC LIMIT ?',
        ['pending', limit]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get processing jobs
  static async getProcessingJobs() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM jobs WHERE status = ? ORDER BY created_at ASC',
        ['processing']
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get jobs by status
  static async getByStatus(status, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [status, limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all jobs with pagination
  static async findAll(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM jobs ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get job count
  static async getCount() {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM jobs'
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get job count by status
  static async getCountByStatus(status) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM jobs WHERE status = ?',
        [status]
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Delete job
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM jobs WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get jobs with file and user information
  static async getJobsWithDetails(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          j.*,
          f.original_name,
          f.file_type,
          f.file_size,
          u.name as user_name,
          u.email as user_email
        FROM jobs j
        JOIN files f ON j.file_id = f.id
        JOIN users u ON f.user_id = u.id
        ORDER BY j.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = JobModel;
