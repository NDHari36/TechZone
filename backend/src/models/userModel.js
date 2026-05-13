const db = require("../config/db");

class User {
  static async create({
    username,
    email,
    password_hash,
    role_id = 2,
    full_name,
    phone,
  }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        `INSERT INTO users (username, email, password_hash, full_name, phone) 
       VALUES (?, ?, ?, ?, ?)`,
        [username, email, password_hash, full_name || null, phone || null],
      );

      const userId = userResult.insertId;

      await connection.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [userId, role_id],
      );

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByUsername(username) {
    const sql = `
      SELECT u.*, r.id AS role_id, r.name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [username]);
    return rows[0];
  }

  static async findByEmail(email) {
    const sql = `
      SELECT u.*, r.id AS role_id, r.name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [email]);
    return rows[0];
  }

  static async getProfile(userId) {
    const sql = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.full_name,
      u.phone,
      u.created_at,
      u.is_active,
      r.name AS role_name
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id = ?
    LIMIT 1
  `;
    const [rows] = await db.query(sql, [userId]);
    return rows[0];
  }

  static async updateProfile(userId, { full_name, email, phone }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE users 
       SET email = ?, full_name = ?, phone = ?
       WHERE id = ?`,
        [email, full_name, phone, userId],
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updatePassword(userId, newPasswordHash) {
    const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
    await db.query(sql, [newPasswordHash, userId]);
  }
  static async updateStatus(userId, isActive) {
    const sql = `UPDATE users SET is_active = ? WHERE id = ?`;
    await db.query(sql, [isActive, userId]);
  }

  static async getAll() {
    const sql = `
      SELECT 
        u.id, u.username, u.email, u.is_active, u.created_at,
        u.full_name, u.phone, /* Đổi từ ua.full_name, ua.phone thành u.full_name, u.phone */
        ur.role_id, r.name AS role_name
      FROM users u
      /* ĐÃ XÓA DÒNG: LEFT JOIN user_addresses ua ON u.id = ua.user_id */
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async updateAdmin(userId, data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      if (data.is_active !== undefined) {
        await connection.query("UPDATE users SET is_active = ? WHERE id = ?", [
          data.is_active,
          userId,
        ]);
      }

      if (data.role_id !== undefined) {
        await connection.query(
          "UPDATE user_roles SET role_id = ? WHERE user_id = ?",
          [data.role_id, userId],
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(userId) {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.query(
        "UPDATE users SET is_active = 0 WHERE id = ?",
        [userId],
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;
