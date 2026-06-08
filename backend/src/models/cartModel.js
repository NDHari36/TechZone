const db = require("../config/db");

class Cart {
  static async getCartByUserId(userId) {
    const [carts] = await db.query("SELECT id FROM carts WHERE user_id = ?", [
      userId,
    ]);

    return carts[0] || null;
  }

  static async createCart(userId) {
    const [result] = await db.query("INSERT INTO carts (user_id) VALUES (?)", [
      userId,
    ]);

    return result.insertId;
  }

  static async getCartItems(cartId) {
    const sql = `
      SELECT
        ci.id,
        ci.variant_id as variantId,
        ci.qty as quantity,
        ci.unit_price_snapshot as price,
        pv.color,
        pv.ram,
        pv.storage,
        p.id as productId,
        p.name as productName,
        i.quantity as stock,
        (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.id
          AND is_primary = 1
          LIMIT 1
        ) AS productImage
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN inventories i ON pv.id = i.variant_id
      WHERE ci.cart_id = ?
    `;

    const [items] = await db.query(sql, [cartId]);

    return items;
  }

  static async getVariantById(variantId) {
    const [rows] = await db.query(
      "SELECT * FROM product_variants WHERE id = ?",
      [variantId],
    );

    return rows[0] || null;
  }

  static async getCheapestVariant(productId) {
    const [rows] = await db.query(
      `
      SELECT id
      FROM product_variants
      WHERE product_id = ?
      ORDER BY price ASC
      LIMIT 1
      `,
      [productId],
    );

    return rows[0] || null;
  }

  static async getCartItem(cartId, variantId) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM cart_items
      WHERE cart_id = ?
      AND variant_id = ?
      `,
      [cartId, variantId],
    );

    return rows[0] || null;
  }

  static async insertCartItem(cartId, variantId, quantity, price) {
    await db.query(
      `
      INSERT INTO cart_items
      (
        cart_id,
        variant_id,
        qty,
        unit_price_snapshot
      )
      VALUES (?, ?, ?, ?)
      `,
      [cartId, variantId, quantity, price],
    );
  }

  static async updateCartItem(itemId, quantity, price) {
    await db.query(
      `
      UPDATE cart_items
      SET qty = qty + ?,
          unit_price_snapshot = ?
      WHERE id = ?
      `,
      [quantity, price, itemId],
    );
  }

  static async updateQuantity(cartId, variantId, quantity) {
    await db.query(
      `
      UPDATE cart_items
      SET qty = qty + ?,
      WHERE cart_id = ?
      AND variant_id = ?
      `,
      [quantity, cartId, variantId],
    );
  }

  static async removeItem(cartId, variantId) {
    await db.query(
      `
      DELETE FROM cart_items
      WHERE cart_id = ?
      AND variant_id = ?
      `,
      [cartId, variantId],
    );
  }
}

module.exports = Cart;
