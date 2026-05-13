const db = require("../config/db");

class Address {
  static async getAddressesByUserId(userId) {
    const sql = `
      SELECT 
        id, 
        full_name, 
        phone, 
        line1, 
        ward, 
        district, 
        city, 
        is_default
      FROM user_addresses 
      WHERE user_id = ? 
      ORDER BY is_default DESC, created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }

  static async addAddress(userId, data) {
    const { full_name, phone, line1, ward, district, city, is_default } = data;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      if (is_default) {
        await connection.query(
          "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
          [userId],
        );
      }

      const sql = `
        INSERT INTO user_addresses 
        (user_id, full_name, phone, line1, ward, district, city, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.query(sql, [
        userId,
        full_name,
        phone,
        line1,
        ward || null,
        district || null,
        city || null,
        is_default ? 1 : 0,
      ]);

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateDefault(userId, addressId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
        [userId],
      );

      const [result] = await connection.query(
        "UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
        [addressId, userId],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteAddress(userId, addressId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [addr] = await connection.query(
        "SELECT is_default FROM user_addresses WHERE id = ? AND user_id = ?",
        [addressId, userId],
      );

      await connection.query(
        "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
        [addressId, userId],
      );

      if (addr[0]?.is_default) {
        await connection.query(
          `UPDATE user_addresses 
         SET is_default = 1 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
          [userId],
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
}

module.exports = Address;
