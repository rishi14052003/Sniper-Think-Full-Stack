const { pool } = require('../config/db');

class UserModel {
  // Create new user
  static async create(userData) {
    const { name, email } = userData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      );
      
      return {
        id: result.insertId,
        name,
        email
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        // User already exists, return existing user
        const existingUser = await this.findByEmail(email);
        return existingUser;
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    const { name, email } = userData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all users with pagination
  static async findAll(limit = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user count
  static async getCount() {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM users'
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel;
