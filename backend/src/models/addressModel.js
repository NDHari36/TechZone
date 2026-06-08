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

  static async create(connection, data) {
    const sql = `
      INSERT INTO user_addresses
      (
        user_id,
        full_name,
        phone,
        line1,
        ward,
        district,
        city,
        is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sql, [
      data.user_id,
      data.full_name,
      data.phone,
      data.line1,
      data.ward,
      data.district,
      data.city,
      data.is_default,
    ]);

    return result.insertId;
  }

  static async clearDefaultByUserId(connection, userId) {
    await connection.query(
      "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
      [userId],
    );
  }

  static async setDefault(connection, userId, addressId) {
    const [result] = await connection.query(
      "UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [addressId, userId],
    );

    return result.affectedRows > 0;
  }

  static async getAddressById(connection, userId, addressId) {
    const [rows] = await connection.query(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId],
    );

    return rows[0] || null;
  }

  static async delete(connection, userId, addressId) {
    await connection.query(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId],
    );
  }

  static async setLatestAddressAsDefault(connection, userId) {
    await connection.query(
      `
      UPDATE user_addresses
      SET is_default = 1
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId],
    );
  }
}

module.exports = Address;
