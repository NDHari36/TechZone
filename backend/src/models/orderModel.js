const db = require("../config/db");

class Order {
  static async getAll() {
    const sql = `
      SELECT 
        o.id, o.code, o.status, o.total AS total_amount, 
        o.receiver_name AS full_name, o.receiver_phone AS phone, 
        o.created_at, o.paid_at,
        u.username, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async createOrder(userId, { addressId, note, cartItemIds, couponId }) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [addressRows] = await connection.query(
        `SELECT full_name as receiver_name, phone as receiver_phone, line1 as ship_line1, 
                ward as ship_ward, district as ship_district, city as ship_city 
         FROM user_addresses 
         WHERE id = ? AND user_id = ?`,
        [addressId, userId],
      );

      if (addressRows.length === 0)
        throw new Error("Địa chỉ giao hàng không hợp lệ.");
      const address = addressRows[0];

      const placeholders = cartItemIds.map(() => "?").join(",");
      const [items] = await connection.query(
        `SELECT ci.id as cart_item_id, ci.variant_id, ci.qty, pv.price, p.name as product_name, pv.sku, i.quantity as stock
         FROM cart_items ci
         JOIN product_variants pv ON ci.variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         JOIN inventories i ON pv.id = i.variant_id
         WHERE ci.id IN (${placeholders})`,
        [...cartItemIds],
      );

      if (items.length === 0) throw new Error("Sản phẩm không hợp lệ.");

      for (const item of items) {
        if (item.qty > item.stock) {
          throw new Error(
            `Sản phẩm ${item.product_name} chỉ còn ${item.stock} máy trong kho.`,
          );
        }
      }

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      );
      let discountTotal = 0;

      if (couponId) {
        const [couponRows] = await connection.query(
          `SELECT * FROM coupons WHERE id = ? AND is_active = 1 AND (end_at IS NULL OR end_at > NOW())`,
          [couponId],
        );
        if (couponRows.length > 0) {
          const cp = couponRows[0];
          if (subtotal >= (cp.min_order || 0)) {
            discountTotal =
              cp.type === "percent" ? (subtotal * cp.value) / 100 : cp.value;
          }
        }
      }

      const shippingFee = subtotal > 500000 ? 0 : 30000;
      const totalAmount = subtotal + shippingFee - discountTotal;
      const orderCode =
        "ORD-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 8).toUpperCase();
      const [orderResult] = await connection.query(
        `INSERT INTO orders (
          user_id, code, status, subtotal, discount_total, shipping_fee, total, 
          receiver_name, receiver_phone, ship_line1, ship_ward, ship_district, ship_city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          orderCode,
          "Pending",
          subtotal,
          discountTotal,
          shippingFee,
          totalAmount,
          address.receiver_name,
          address.receiver_phone,
          address.ship_line1,
          address.ship_ward,
          address.ship_district,
          address.ship_city,
        ],
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (order_id, variant_id, product_name_snapshot, variant_snapshot, unit_price_snapshot, qty, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.variant_id,
            item.product_name,
            item.sku,
            item.price,
            item.qty,
            item.price * item.qty,
          ],
        );

        await connection.query(
          `UPDATE inventories SET quantity = quantity - ? WHERE variant_id = ?`,
          [item.qty, item.variant_id],
        );
      }

      await connection.query(
        `DELETE FROM cart_items WHERE id IN (${placeholders})`,
        [...cartItemIds],
      );

      if (couponId && discountTotal > 0) {
        await connection.query(
          `INSERT INTO order_coupons (order_id, coupon_id, discount_applied) VALUES (?, ?, ?)`,
          [orderId, couponId, discountTotal],
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  static async getOrderByIdAdmin(orderId) {
    const sql = `
    SELECT o.*,

    oi.variant_id,
    pv.product_id AS productId,   
    oi.product_name_snapshot AS productName,
    oi.unit_price_snapshot AS price,
    oi.qty AS quantity,
    oi.line_total,

    (SELECT image_url 
     FROM product_images 
     WHERE product_id = pv.product_id 
     ORDER BY is_primary DESC 
     LIMIT 1) AS productImage,

    IF(
      (
        SELECT COUNT(*) 
        FROM reviews r 
        WHERE r.user_id = o.user_id 
          AND r.product_id = pv.product_id
          AND r.order_id = o.id -- THÊM DÒNG NÀY
      ) > 0,
      1,
      0
    ) AS hasReviewed

    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    WHERE o.id = ?
  `;

    const [rows] = await db.query(sql, [orderId]);

    if (rows.length === 0) return null;

    return {
      ...rows[0],
      items: rows
        .filter((r) => r.variant_id)
        .map((r) => ({
          productId: r.productId,
          variantId: r.variant_id,
          productName: r.productName,
          productImage: r.productImage,
          quantity: r.quantity,
          price: r.price,
          line_total: r.line_total,
          hasReviewed: !!r.hasReviewed,
        })),
    };
  }

  static async getOrdersByUserId(userId) {
    const sql = `
SELECT 
  o.id AS orderId,
  o.code,
  o.total,
  o.status,
  o.created_at,

  oi.variant_id,
  pv.product_id AS productId,

  oi.qty AS quantity,
  oi.unit_price_snapshot AS price,
  oi.product_name_snapshot AS productName,

  (SELECT image_url 
   FROM product_images 
   WHERE product_id = pv.product_id 
   ORDER BY is_primary DESC 
   LIMIT 1) AS productImage,

  IF(
    EXISTS (
      SELECT 1 
      FROM reviews r 
      WHERE r.user_id = o.user_id 
        AND r.product_id = pv.product_id
        AND r.order_id = o.id  -- THÊM DÒNG NÀY: Kiểm tra đúng đơn hàng đang xét
    ),
    1,
    0
  ) AS hasReviewed

FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN product_variants pv ON oi.variant_id = pv.id

WHERE o.user_id = ?
ORDER BY o.created_at DESC
`;
    const [rows] = await db.query(sql, [userId]);

    const ordersMap = {};
    rows.forEach((row) => {
      if (!ordersMap[row.orderId]) {
        ordersMap[row.orderId] = {
          id: row.orderId,
          code: row.code,
          total: row.total,
          status: row.status,
          created_at: row.created_at,
          items: [],
        };
      }
      if (row.variant_id) {
        ordersMap[row.orderId].items.push({
          productId: row.productId,
          variantId: row.variant_id,
          productName: row.productName,
          productImage: row.productImage,
          hasReviewed: !!row.hasReviewed,
          quantity: row.quantity,
          price: row.price,
        });
      }
    });
    return Object.values(ordersMap);
  }

  static async getOrderById(orderId, userId) {
    const sql = `
      SELECT  o.*,

      oi.variant_id,
      pv.product_id AS productId,   
      oi.product_name_snapshot AS productName,
      oi.unit_price_snapshot AS price,
      oi.qty AS quantity,
      oi.line_total,

      (SELECT image_url 
       FROM product_images 
       WHERE product_id = pv.product_id 
       ORDER BY is_primary DESC 
       LIMIT 1) AS productImage,

      -- THÊM CỤM NÀY ĐỂ CHECK HAS_REVIEWED CHO TRANG CHI TIẾT
      IF(
        EXISTS (
          SELECT 1 
          FROM reviews r 
          WHERE r.user_id = o.user_id 
            AND r.product_id = pv.product_id
            AND r.order_id = o.id
        ),
        1,
        0
      ) AS hasReviewed

    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    WHERE o.id = ? AND o.user_id = ?
    `;
    const [rows] = await db.query(sql, [orderId, userId]);
    if (rows.length === 0) return null;

    return {
      ...rows[0],
      items: rows
        .filter((r) => r.variant_id)
        .map((r) => ({
          productId: r.productId,
          variantId: r.variant_id,
          productName: r.productName,
          productImage: r.productImage,
          quantity: r.quantity,
          price: r.price,
          line_total: r.line_total,
          hasReviewed: !!r.hasReviewed,
        })),
    };
  }

  static async cancelOrder(orderId, userId) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [orders] = await connection.query(
        `SELECT id 
       FROM orders
       WHERE id = ? 
         AND user_id = ? 
         AND status = 'Pending'`,
        [orderId, userId],
      );

      if (orders.length === 0) {
        throw new Error("Không thể hủy đơn hàng");
      }

      const [items] = await connection.query(
        `SELECT variant_id, qty
       FROM order_items
       WHERE order_id = ?`,
        [orderId],
      );

      await connection.query(
        `UPDATE orders
       SET status = 'Cancelled'
       WHERE id = ?`,
        [orderId],
      );

      for (const item of items) {
        await connection.query(
          `UPDATE inventories
         SET quantity = quantity + ?
         WHERE variant_id = ?`,
          [item.qty, item.variant_id],
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
  static async updateOrderStatus(orderId, newStatus) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [orders] = await connection.query(
        `SELECT status FROM orders WHERE id = ?`,
        [orderId],
      );

      if (orders.length === 0) {
        throw new Error("Đơn hàng không tồn tại");
      }

      const currentStatus = orders[0].status;

      const [result] = await connection.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [newStatus, orderId],
      );

      if (
        newStatus.toLowerCase() === "cancelled" &&
        currentStatus.toLowerCase() !== "cancelled"
      ) {
        const [items] = await connection.query(
          `SELECT variant_id, qty
         FROM order_items
         WHERE order_id = ?`,
          [orderId],
        );

        for (const item of items) {
          await connection.query(
            `UPDATE inventories
           SET quantity = quantity + ?
           WHERE variant_id = ?`,
            [item.qty, item.variant_id],
          );
        }
      }

      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Order;
