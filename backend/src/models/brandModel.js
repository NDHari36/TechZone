const db = require("../config/db");

class Brand {
  static async getAllActive() {
    try {
      const sql = `SELECT DISTINCT name FROM brands ORDER BY name ASC`;
      const [rows] = await db.query(sql);

      return rows.map((row) => row.name);
    } catch (error) {
      console.error("LỖI SQL TẠI BRAND MODEL:", error.message);
      throw error;
    }
  }
}

module.exports = Brand;
