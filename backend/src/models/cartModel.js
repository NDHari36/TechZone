const db = require("../config/db");

class Cart {
  static async getOrCreateCart(userId) {
    const [carts] = await db.query("SELECT id FROM carts WHERE user_id = ?", [
      userId,
    ]);
    if (carts.length > 0) return carts[0].id;

    const [result] = await db.query("INSERT INTO carts (user_id) VALUES (?)", [
      userId,
    ]);
    return result.insertId;
  }

  static async getCart(userId) {
    const cartId = await this.getOrCreateCart(userId);

    const sql = `
  SELECT 
    ci.id, ci.variant_id as variantId, ci.qty as quantity, ci.unit_price_snapshot as price,
    pv.color, pv.ram, pv.storage, p.id as productId, p.name as productName,
    i.quantity as stock, -- Dòng này cực kỳ quan trọng
    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 0 LIMIT 1) AS productImage
  FROM cart_items ci
  JOIN product_variants pv ON ci.variant_id = pv.id
  JOIN products p ON pv.product_id = p.id
  LEFT JOIN inventories i ON pv.id = i.variant_id
  WHERE ci.cart_id = ?
`;
    const [items] = await db.query(sql, [cartId]);

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    return { cart_id: cartId, total, items };
  }

  static async addItem(userId, productId, variantId, quantity) {
    const cartId = await this.getOrCreateCart(userId);

    let actualVariantId = variantId;
    if (!actualVariantId && productId) {
      const [variants] = await db.query(
        "SELECT id FROM product_variants WHERE product_id = ? ORDER BY price ASC LIMIT 1",
        [productId],
      );
      if (variants.length === 0)
        throw new Error("Sản phẩm này chưa có cấu hình để thêm vào giỏ");
      actualVariantId = variants[0].id;
    }

    const [variants] = await db.query(
      "SELECT price FROM product_variants WHERE id = ?",
      [actualVariantId],
    );
    if (variants.length === 0)
      throw new Error("Không tìm thấy thông tin cấu hình sản phẩm");
    const price = variants[0].price;

    const [existing] = await db.query(
      "SELECT id, qty FROM cart_items WHERE cart_id = ? AND variant_id = ?",
      [cartId, actualVariantId],
    );

    if (existing.length > 0) {
      const sql = `UPDATE cart_items SET qty = qty + ?, unit_price_snapshot = ? WHERE id = ?`;
      await db.query(sql, [quantity, price, existing[0].id]);
    } else {
      const sql = `INSERT INTO cart_items (cart_id, variant_id, qty, unit_price_snapshot) VALUES (?, ?, ?, ?)`;
      await db.query(sql, [cartId, actualVariantId, quantity, price]);
    }

    return await this.getCart(userId);
  }

  static async updateItemQty(userId, variantId, quantity) {
    const cartId = await this.getOrCreateCart(userId);
    if (quantity <= 0) {
      return await this.removeItem(userId, variantId);
    }

    await db.query(
      "UPDATE cart_items SET qty = ? WHERE cart_id = ? AND variant_id = ?",
      [quantity, cartId, variantId],
    );
    return await this.getCart(userId);
  }

  static async removeItem(userId, variantId) {
    const cartId = await this.getOrCreateCart(userId);
    await db.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?",
      [cartId, variantId],
    );
    return await this.getCart(userId);
  }
}

module.exports = Cart;
