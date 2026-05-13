const db = require("../config/db");

class Coupon {
  static async findValidCoupon(code, subtotal, userId) {
    const sql = `
      SELECT * FROM coupons 
      WHERE code = ? 
      AND is_active = 1 
      AND (start_at IS NULL OR start_at <= CURRENT_TIMESTAMP)
      AND (end_at IS NULL OR end_at >= CURRENT_TIMESTAMP)
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [code]);
    const coupon = rows[0];

    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại hoặc đã hết hạn.");
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      throw new Error("Mã giảm giá này đã hết lượt sử dụng.");
    }

    if (coupon.min_order !== null && subtotal < coupon.min_order) {
      const minOrderFormatted = new Intl.NumberFormat("vi-VN").format(
        coupon.min_order,
      );
      throw new Error(
        `Đơn hàng tối thiểu ${minOrderFormatted}đ để dùng mã này.`,
      );
    }
    if (userId) {
      const checkUsageSql = `
        SELECT oc.order_id 
        FROM order_coupons oc
        JOIN orders o ON oc.order_id = o.id
        WHERE o.user_id = ? 
        AND oc.coupon_id = ? 
        AND o.status != 'cancelled' 
        LIMIT 1
      `;
      const [usageRows] = await db.query(checkUsageSql, [userId, coupon.id]);

      if (usageRows.length > 0) {
        throw new Error(
          "Bạn đã sử dụng mã giảm giá này cho một đơn hàng khác rồi.",
        );
      }
    }

    return coupon;
  }

  static async getAllActiveCoupons(userId) {
    const sql = `
    SELECT c.*, 
      (SELECT COUNT(*) FROM order_coupons oc 
       JOIN orders o ON oc.order_id = o.id 
       WHERE oc.coupon_id = c.id AND o.user_id = ? AND o.status != 'cancelled') as is_used
    FROM coupons c
    WHERE c.is_active = 1 
    AND (c.end_at IS NULL OR c.end_at >= CURRENT_TIMESTAMP)
  `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }
}

module.exports = Coupon;
