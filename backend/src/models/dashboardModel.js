const db = require("../config/db");

class Dashboard {
  static getDateFilter(startDate, endDate, tableAlias = "") {
    let whereClause = "WHERE 1=1";
    let params = [];
    const prefix = tableAlias ? `${tableAlias}.` : "";

    if (startDate && endDate) {
      whereClause = `WHERE DATE(${prefix}created_at) BETWEEN ? AND ?`;
      params = [startDate, endDate];
    } else {
      whereClause = `WHERE ${prefix}created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
    }
    return { whereClause, params };
  }

  static async getOverviewStats(startDate, endDate) {
    const { whereClause, params } = this.getDateFilter(startDate, endDate);
    const sql = `
      SELECT 
        (SELECT COALESCE(SUM(total), 0) FROM orders ${whereClause} AND status = 'completed') AS totalRevenue,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE DATE(created_at) = CURDATE() AND status = 'completed') AS todayRevenue,
        (SELECT COUNT(id) FROM orders ${whereClause}) AS totalOrders,
        (SELECT COUNT(id) FROM users ${whereClause}) AS totalCustomers,
        (SELECT COUNT(id) FROM inventories WHERE quantity <= 10) AS lowStock
    `;
    const [rows] = await db.query(sql, [...params, ...params, ...params]);
    return rows[0];
  }

  static async getRevenueChart(startDate, endDate) {
    const { whereClause, params } = this.getDateFilter(startDate, endDate);

    const sql = `
    SELECT
      order_date,
      DATE_FORMAT(order_date, '%d/%m') AS name,
      total
    FROM (
      SELECT
        DATE(created_at) AS order_date,
        SUM(total) AS total
      FROM orders
      ${whereClause} AND status = 'completed'
      GROUP BY DATE(created_at)
    ) AS grouped_revenue
    ORDER BY order_date ASC
  `;

    const [rows] = await db.query(sql, params);
    return rows;
  }
  static async getOrdersChart(startDate, endDate) {
    const { whereClause, params } = this.getDateFilter(startDate, endDate);

    const sql = `
    SELECT
      order_date,
      DATE_FORMAT(order_date, '%d/%m') AS name,
      completed,
      pending,
      cancelled
    FROM (
      SELECT 
        DATE(created_at) AS order_date,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
      FROM orders
      ${whereClause}
      GROUP BY DATE(created_at)
    ) AS grouped_orders
    ORDER BY order_date ASC
  `;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getRecentOrders(startDate, endDate) {
    const { whereClause, params } = this.getDateFilter(startDate, endDate, "o");
    const sql = `
      SELECT 
        o.code AS id, o.receiver_name AS customer, 
        (SELECT product_name_snapshot FROM order_items WHERE order_id = o.id LIMIT 1) AS product, 
        o.total, o.status, DATE_FORMAT(o.created_at, '%d/%m/%Y') AS date 
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC LIMIT 10
    `;
    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = Dashboard;
