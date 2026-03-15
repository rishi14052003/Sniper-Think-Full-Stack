const { pool } = require('../config/db');

class FileModel {
  // Create new file record
  static async create(fileData) {
    const { user_id, file_path, original_name, file_size, file_type } = fileData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO files (user_id, file_path, original_name, file_size, file_type) VALUES (?, ?, ?, ?, ?)',
        [user_id, file_path, original_name, file_size, file_type]
      );
      
      return {
        id: result.insertId,
        user_id,
        file_path,
        original_name,
        file_size,
        file_type,
        uploaded_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Find file by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM files WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find files by user ID
  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM files WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update file
  static async update(id, fileData) {
    const { file_path, original_name, file_size, file_type } = fileData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE files SET file_path = ?, original_name = ?, file_size = ?, file_type = ? WHERE id = ?',
        [file_path, original_name, file_size, file_type, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete file
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM files WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all files with pagination
  static async findAll(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM files ORDER BY uploaded_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get file count
  static async getCount() {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM files'
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get file count by user
  static async getCountByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM files WHERE user_id = ?',
        [userId]
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get files with job information
  static async getFilesWithJobs(userId, limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          f.*,
          j.id as job_id,
          j.status as job_status,
          j.progress as job_progress,
          j.created_at as job_created_at
        FROM files f
        LEFT JOIN jobs j ON f.id = j.file_id
        WHERE f.user_id = ?
        ORDER BY f.uploaded_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FileModel;
