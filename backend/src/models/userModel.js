const db = require("../config/db");

class User {
  // CREATE USER
  static async createUser(connection, data) {
    const { username, email, password_hash, full_name, phone } = data;

    const [result] = await connection.query(
      `INSERT INTO users (username,email,password_hash,full_name,phone)
       VALUES (?,?,?,?,?)`,
      [username, email, password_hash, full_name || null, phone || null],
    );

    return result.insertId;
  }

  static async createUserRole(connection, userId, roleId) {
    await connection.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?,?)`,
      [userId, roleId],
    );
  }

  static async create(data) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const userId = await this.createUser(conn, data);
      await this.createUserRole(conn, userId, data.role_id || 2);

      await conn.commit();
      return userId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      id,
    ]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await db.query(
      `SELECT u.*, r.id AS role_id, r.name AS role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.username = ? LIMIT 1`,
      [username],
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT u.*, r.id AS role_id, r.name AS role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = ? LIMIT 1`,
      [email],
    );
    return rows[0];
  }

  static async getProfile(userId) {
    const [rows] = await db.query(
      `SELECT u.id,u.username,u.email,u.full_name,u.phone,
              u.created_at,u.is_active,r.name AS role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ? LIMIT 1`,
      [userId],
    );
    return rows[0];
  }

  static async updateProfile(userId, data) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE users SET email=?, full_name=?, phone=? WHERE id=?`,
        [data.email, data.full_name, data.phone, userId],
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async updatePassword(userId, hash) {
    await db.query("UPDATE users SET password_hash=? WHERE id=?", [
      hash,
      userId,
    ]);
  }

  static async updateAdmin(userId, data) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      if (data.is_active !== undefined) {
        await conn.query("UPDATE users SET is_active=? WHERE id=?", [
          data.is_active,
          userId,
        ]);
      }

      if (data.role_id !== undefined) {
        await conn.query("UPDATE user_roles SET role_id=? WHERE user_id=?", [
          data.role_id,
          userId,
        ]);
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async delete(userId) {
    const [res] = await db.query("UPDATE users SET is_active=0 WHERE id=?", [
      userId,
    ]);
    return res.affectedRows > 0;
  }

  static async getAll() {
    const [rows] = await db.query(
      `SELECT u.id,u.username,u.email,u.is_active,u.created_at,
              u.full_name,u.phone,
              ur.role_id,r.name AS role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id=ur.user_id
       LEFT JOIN roles r ON ur.role_id=r.id
       ORDER BY u.id DESC`,
    );
    return rows;
  }
}

module.exports = User;
