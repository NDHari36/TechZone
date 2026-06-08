const db = require("../config/db");

class Coupon {
  static async findByCode(code) {
    const sql = `
      SELECT *
      FROM coupons
      WHERE code = ?
      AND is_active = 1
      AND (start_at IS NULL OR start_at <= CURRENT_TIMESTAMP)
      AND (end_at IS NULL OR end_at >= CURRENT_TIMESTAMP)
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [code]);

    return rows[0] || null;
  }

  static async checkUserUsedCoupon(userId, couponId) {
    const sql = `
      SELECT oc.order_id
      FROM order_coupons oc
      JOIN orders o ON oc.order_id = o.id
      WHERE o.user_id = ?
      AND oc.coupon_id = ?
      AND o.status != 'cancelled'
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [userId, couponId]);

    return rows.length > 0;
  }

  static async getAllActiveCoupons(userId) {
    const sql = `
      SELECT c.*,
      (
        SELECT COUNT(*)
        FROM order_coupons oc
        JOIN orders o ON oc.order_id = o.id
        WHERE oc.coupon_id = c.id
        AND o.user_id = ?
        AND o.status != 'cancelled'
      ) as is_used
      FROM coupons c
      WHERE c.is_active = 1
      AND (
        c.end_at IS NULL
        OR c.end_at >= CURRENT_TIMESTAMP
      )
    `;

    const [rows] = await db.query(sql, [userId]);

    return rows;
  }
}

module.exports = Coupon;
