const db = require("../config/db");

const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  SHIPPED: "shipped",
};

const ORDER_CONFIG = {
  CODE_PREFIX: "ORD",
  DEFAULT_SHIPPING_FEE: 0,
};

const HAS_REVIEWED_SUBQUERY = `
  IF(
    EXISTS(
      SELECT 1 
      FROM reviews r 
      WHERE r.user_id = o.user_id 
        AND r.product_id = pv.product_id 
        AND r.order_id = o.id
    ), 1, 0
  ) AS hasReviewed
`;

class Order {
  static get STATUS() {
    return ORDER_STATUS;
  }

  static get CONFIG() {
    return ORDER_CONFIG;
  }

  static async getConnection() {
    return await db.getConnection();
  }

  static async withTransaction(callback) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAddress(connection, addressId, userId) {
    const [rows] = await connection.query(
      `SELECT
        full_name AS receiver_name,
        phone AS receiver_phone,
        line1 AS ship_line1,
        ward AS ship_ward,
        district AS ship_district,
        city AS ship_city
      FROM user_addresses
      WHERE id = ? AND user_id = ?`,
      [addressId, userId],
    );

    return rows[0];
  }

  static async lockInventories(connection, variantIds) {
    if (!variantIds || variantIds.length === 0) return [];

    const sortedUniqueIds = [...new Set(variantIds)].sort((a, b) => a - b);
    const placeholders = sortedUniqueIds.map(() => "?").join(",");

    const [rows] = await connection.query(
      `SELECT variant_id, quantity AS stock
       FROM inventories
       WHERE variant_id IN (${placeholders}) FOR UPDATE`,
      sortedUniqueIds,
    );
    return rows;
  }

  static async getCartItems(connection, cartItemIds) {
    const placeholders = cartItemIds.map(() => "?").join(",");

    const [rows] = await connection.query(
      `SELECT
        ci.id AS cart_item_id,
        ci.variant_id,
        ci.qty,
        pv.price,
        p.name AS product_name,
        pv.sku
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.id IN (${placeholders})`,
      cartItemIds,
    );

    return rows;
  }

  static async getCoupon(connection, couponId) {
    const [rows] = await connection.query(
      `SELECT id, discount_value, is_active, end_at
       FROM coupons
       WHERE id = ? FOR UPDATE`,
      [couponId],
    );

    return rows[0];
  }

  static async insertOrder(connection, data) {
    const [result] = await connection.query(
      `INSERT INTO orders (
        user_id,
        code,
        status,
        subtotal,
        discount_total,
        shipping_fee,
        total,
        receiver_name,
        receiver_phone,
        ship_line1,
        ship_ward,
        ship_district,
        ship_city 
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        data.code,
        data.status,
        data.subtotal,
        data.discountTotal,
        data.shippingFee,
        data.total,
        data.receiver_name,
        data.receiver_phone,
        data.ship_line1,
        data.ship_ward,
        data.ship_district,
        data.ship_city || data.ship_city_snapshot || data.city || "",
      ],
    );

    return result.insertId;
  }

  static async createOrderItemsBatch(connection, items) {
    if (!items || items.length === 0) return;

    const values = items.map((item) => [
      item.orderId,
      item.variant_id,
      item.product_name,
      item.sku,
      item.price,
      item.qty,
      item.lineTotal,
    ]);

    await connection.query(
      `INSERT INTO order_items (
        order_id,
        variant_id,
        product_name_snapshot,
        variant_snapshot,
        unit_price_snapshot,
        qty,
        line_total
      )
      VALUES ?`,
      [values],
    );
  }

  static async updateInventory(connection, variantId, qty) {
    const [result] = await connection.query(
      `UPDATE inventories
       SET quantity = quantity - ?
       WHERE variant_id = ? AND quantity >= ?`,
      [qty, variantId, qty],
    );
    return result.affectedRows;
  }

  static async incrementInventory(connection, variantId, qty) {
    await connection.query(
      `UPDATE inventories
       SET quantity = quantity + ?
       WHERE variant_id = ?`,
      [qty, variantId],
    );
  }

  static async deleteCartItems(connection, cartItemIds) {
    const placeholders = cartItemIds.map(() => "?").join(",");

    await connection.query(
      `DELETE FROM cart_items
       WHERE id IN (${placeholders})`,
      cartItemIds,
    );
  }

  static async saveCoupon(connection, orderId, couponId, discount) {
    await connection.query(
      `INSERT INTO order_coupons
      (order_id, coupon_id, discount_applied)
      VALUES (?, ?, ?)`,
      [orderId, couponId, discount],
    );
  }

  static async getOrderByIdAdmin(orderId) {
    const [rows] = await db.execute(
      ` SELECT o.*,
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

        ${HAS_REVIEWED_SUBQUERY}

        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE o.id = ?`,
      [orderId],
    );
    return rows;
  }

  static async getOrdersByUserId(userId) {
    const [rows] = await db.execute(
      `
    SELECT
      o.id AS orderId,
      o.code,
      o.status,
      o.total,
      o.created_at AS orderDate,

      oi.id AS orderItemId,
      oi.variant_id AS variantId,

      pv.product_id AS productId,

      oi.product_name_snapshot AS productName,
      oi.unit_price_snapshot AS price,
      oi.qty AS quantity,

      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = pv.product_id
        ORDER BY pi.is_primary DESC, pi.id ASC
        LIMIT 1
      ) AS productImage,

      ${HAS_REVIEWED_SUBQUERY}

    FROM orders o
    INNER JOIN order_items oi
      ON o.id = oi.order_id

    INNER JOIN product_variants pv
      ON oi.variant_id = pv.id

    WHERE o.user_id = ?

    ORDER BY
      o.created_at DESC,
      o.id DESC,
      oi.id ASC
    `,
      [userId],
    );

    return rows;
  }

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

  static async getOrderItemsByOrderId(connection, orderId) {
    const [rows] = await connection.query(
      `SELECT variant_id, qty FROM order_items WHERE order_id = ?`,
      [orderId],
    );
    return rows;
  }

  static async getOrderById(orderId, userId) {
    const [rows] = await db.execute(
      `
    SELECT  
      o.id,  
      o.code,  
      o.status,  
      o.subtotal,  
      o.discount_total,  
      o.shipping_fee,  
      o.total,  
      o.receiver_name,  
      o.receiver_phone,  
      o.ship_line1,  
      o.ship_ward,  
      o.ship_district,  
      o.ship_city,  
      o.created_at,  
      o.paid_at,  

      oi.product_name_snapshot,  
      oi.variant_snapshot,  
      oi.unit_price_snapshot,  
      oi.qty,
      oi.line_total,  
      p.image_url AS product_image_snapshot,
      p.product_id AS productId,

      ${HAS_REVIEWED_SUBQUERY}

    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN product_images p 
      ON pv.product_id = p.product_id AND p.is_primary = 1
    WHERE o.id = ? AND o.user_id = ?
    `,
      [orderId, userId],
    );

    return rows;
  }

  static async cancelOrderWithConnection(connection, orderId, userId) {
    const [result] = await connection.query(
      `UPDATE orders
       SET status = ?
       WHERE id = ? AND user_id = ? AND status = ?`,
      [ORDER_STATUS.CANCELLED, orderId, userId, ORDER_STATUS.PENDING],
    );
    return result.affectedRows;
  }

  static async updateOrderStatusWithConnection(connection, orderId, status) {
    const [result] = await connection.query(
      `UPDATE orders
       SET status = ?
       WHERE id = ?`,
      [status, orderId],
    );
    return result.affectedRows;
  }
}

module.exports = Order;
