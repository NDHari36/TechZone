const db = require("../config/db");

class Product {
  static async findAll({
    limit = 50,
    offset = 0,
    keyword = "",
    brand = "",
    minPrice = 0,
    maxPrice = 999999999,
  }) {
    limit = Number(limit);
    offset = Number(offset);
    minPrice = Number(minPrice);
    maxPrice = Number(maxPrice);

    let sql = `
      SELECT 
          p.id,
          p.name,
          p.category_id,
          b.name AS brand_name,
          c.name AS category_name,

          (
            SELECT image_url
            FROM product_images
            WHERE product_id = p.id
            ORDER BY is_primary DESC, sort_order ASC, id ASC
            LIMIT 1
          ) AS image_url,

          (
            SELECT MIN(price)
            FROM product_variants
            WHERE product_id = p.id
          ) AS min_price,

          (
            SELECT SUM(i.quantity)
            FROM inventories i
            JOIN product_variants v ON i.variant_id = v.id
            WHERE v.product_id = p.id
          ) AS total_stock

      FROM products p
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id

      WHERE p.is_active = 1
    `;

    const params = [];

    if (keyword?.trim()) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?) `;
      const searchKey = `%${keyword}%`;
      params.push(searchKey, searchKey);
    }

    if (brand?.trim()) {
      sql += ` AND b.name = ? `;
      params.push(brand);
    }

    if (minPrice > 0) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
          AND pv.price >= ?
        )
      `;
      params.push(minPrice);
    }

    if (maxPrice < 999999999) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM product_variants pv
          WHERE pv.product_id = p.id
          AND pv.price <= ?
        )
      `;
      params.push(maxPrice);
    }

    sql += `
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await db.query(sql, params);

    return rows;
  }

  static async getSuggestions(keyword) {
    const sql = `
      SELECT id, name
      FROM products
      WHERE name LIKE ?
      AND is_active = 1
      LIMIT 5
    `;

    const [rows] = await db.query(sql, [`%${keyword}%`]);

    return rows;
  }

  static async getDetail(id) {
    try {
      const productSql = `
        SELECT
          p.*,
          b.name AS brand_name,
          c.name AS category_name,

          (
            SELECT SUM(i.quantity)
            FROM inventories i
            JOIN product_variants v ON i.variant_id = v.id
            WHERE v.product_id = p.id
          ) AS total_stock,

          (
            SELECT COUNT(id)
            FROM reviews
            WHERE product_id = p.id
          ) AS review_count,

          (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE product_id = p.id
          ) AS average_rating

        FROM products p
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id

        WHERE p.id = ?
        AND p.is_active = 1
      `;

      const [products] = await db.query(productSql, [id]);

      if (products.length === 0) return null;

      const imagesSql = `
        SELECT id, image_url, is_primary
        FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order ASC
      `;

      const [images] = await db.query(imagesSql, [id]);

      const variantsSql = `
        SELECT
          pv.*,
          i.quantity,
          i.safety_stock
        FROM product_variants pv
        LEFT JOIN inventories i ON pv.id = i.variant_id
        WHERE pv.product_id = ?
      `;

      const [variants] = await db.query(variantsSql, [id]);

      const specsSql = `
        SELECT
          variant_id,
          group_name,
          name,
          value_text,
          unit
        FROM product_variant_specs
        WHERE variant_id IN (
          SELECT id
          FROM product_variants
          WHERE product_id = ?
        )
        ORDER BY sort_order ASC
      `;

      const [allSpecs] = await db.query(specsSql, [id]);

      // OPTIMIZED O(n)
      const specMap = new Map();

      allSpecs.forEach((spec) => {
        if (!specMap.has(spec.variant_id)) {
          specMap.set(spec.variant_id, []);
        }

        specMap.get(spec.variant_id).push(spec);
      });

      const variantsWithSpecs = variants.map((variant) => ({
        ...variant,
        product_variant_specs: specMap.get(variant.id) || [],
      }));

      return {
        ...products[0],
        images,
        variants: variantsWithSpecs,
        specs: [],
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(productData) {
    const connection = await db.getConnection();

    await connection.beginTransaction();

    try {
      const { brand_id, category_id, name, description, variants, images } =
        productData;

      const [resProduct] = await connection.query(
        `
        INSERT INTO products (
          brand_id,
          category_id,
          name,
          description
        )
        VALUES (?, ?, ?, ?)
        `,
        [brand_id, category_id, name, description],
      );

      const productId = resProduct.insertId;

      if (images?.length > 0) {
        const imageValues = images.map((img, idx) => [
          productId,
          typeof img === "string" ? img : img.image_url,
          img.is_primary !== undefined ? img.is_primary : idx === 0 ? 1 : 0,
          img.sort_order !== undefined ? img.sort_order : idx,
        ]);

        await connection.query(
          `
          INSERT INTO product_images (
            product_id,
            image_url,
            is_primary,
            sort_order
          )
          VALUES ?
          `,
          [imageValues],
        );
      }

      if (variants?.length > 0) {
        for (const variant of variants) {
          const [resVariant] = await connection.query(
            `
            INSERT INTO product_variants (
              product_id,
              sku,
              ram,
              storage,
              color,
              price
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              productId,
              variant.sku,
              variant.ram || null,
              variant.storage || null,
              variant.color || null,
              variant.price || 0,
            ],
          );

          const variantId = resVariant.insertId;

          await connection.query(
            `
            INSERT INTO inventories (
              variant_id,
              quantity
            )
            VALUES (?, ?)
            `,
            [variantId, variant.total_stock || 0],
          );

          const variantSpecs = variant.product_variant_specs || [];

          if (variantSpecs.length > 0) {
            const specValues = variantSpecs.map((s, idx) => [
              variantId,
              s.group_name || "Thông số chung",
              s.name,
              s.value_text || s.value || "",
              s.unit || null,
              s.is_filterable !== undefined ? s.is_filterable : 0,
              idx,
            ]);

            await connection.query(
              `
              INSERT INTO product_variant_specs (
                variant_id,
                group_name,
                name,
                value_text,
                unit,
                is_filterable,
                sort_order
              )
              VALUES ?
              `,
              [specValues],
            );
          }
        }
      }

      await connection.commit();

      return {
        id: productId,
        ...productData,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, productData) {
    const connection = await db.getConnection();

    await connection.beginTransaction();

    try {
      const { brand_id, category_id, name, description, is_active, variants } =
        productData;

      await connection.query(
        `
        UPDATE products
        SET
          brand_id = ?,
          category_id = ?,
          name = ?,
          description = ?,
          is_active = ?
        WHERE id = ?
        `,
        [
          brand_id,
          category_id,
          name,
          description,
          is_active !== undefined ? is_active : 1,
          id,
        ],
      );

      if (variants?.length > 0) {
        const incomingIds = variants.map((v) => v.id).filter(Boolean);

        if (incomingIds.length > 0) {
          try {
            await connection.query(
              `
              DELETE FROM product_variants
              WHERE product_id = ?
              AND id NOT IN (?)
              `,
              [id, incomingIds],
            );
          } catch (e) {
            throw new Error(
              "Không thể xóa bớt phiên bản vì khách hàng đang thêm nó vào giỏ. Vui lòng chỉ đổi SKU hoặc chỉnh tồn kho về 0.",
            );
          }
        }

        for (const variant of variants) {
          let variantId = variant.id;

          if (variantId) {
            await connection.query(
              `
              UPDATE product_variants
              SET
                sku = ?,
                ram = ?,
                storage = ?,
                color = ?,
                price = ?
              WHERE id = ?
              `,
              [
                variant.sku,
                variant.ram || null,
                variant.storage || null,
                variant.color || null,
                variant.price || 0,
                variantId,
              ],
            );

            await connection.query(
              `
              UPDATE inventories
              SET quantity = ?
              WHERE variant_id = ?
              `,
              [variant.total_stock || 0, variantId],
            );
          } else {
            const [resVariant] = await connection.query(
              `
              INSERT INTO product_variants (
                product_id,
                sku,
                ram,
                storage,
                color,
                price
              )
              VALUES (?, ?, ?, ?, ?, ?)
              `,
              [
                id,
                variant.sku,
                variant.ram || null,
                variant.storage || null,
                variant.color || null,
                variant.price || 0,
              ],
            );

            variantId = resVariant.insertId;

            await connection.query(
              `
              INSERT INTO inventories (
                variant_id,
                quantity
              )
              VALUES (?, ?)
              `,
              [variantId, variant.total_stock || 0],
            );
          }

          await connection.query(
            `
            DELETE FROM product_variant_specs
            WHERE variant_id = ?
            `,
            [variantId],
          );

          const variantSpecs = variant.product_variant_specs || [];

          if (variantSpecs.length > 0) {
            const specValues = variantSpecs.map((s, idx) => [
              variantId,
              s.group_name || "Thông số chung",
              s.name,
              s.value_text || s.value || "",
              s.unit || null,
              s.is_filterable !== undefined ? s.is_filterable : 0,
              idx,
            ]);

            await connection.query(
              `
              INSERT INTO product_variant_specs (
                variant_id,
                group_name,
                name,
                value_text,
                unit,
                is_filterable,
                sort_order
              )
              VALUES ?
              `,
              [specValues],
            );
          }
        }
      } else {
        await connection.query(
          `
          DELETE FROM product_variants
          WHERE product_id = ?
          `,
          [id],
        );
      }

      await connection.commit();

      return {
        id,
        ...productData,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const sql = `
      UPDATE products
      SET is_active = 0
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [id]);

    return result.affectedRows > 0;
  }

  static async getTopSaleProduct() {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,

        (
          SELECT MIN(price)
          FROM product_variants
          WHERE product_id = p.id
        ) AS originalPrice,

        COALESCE((
          SELECT SUM(oi.qty)
          FROM order_items oi
          JOIN product_variants pv ON oi.variant_id = pv.id
          WHERE pv.product_id = p.id
        ), 0) AS sold_count,

        (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.id
          ORDER BY is_primary DESC, sort_order ASC
          LIMIT 1
        ) AS image

      FROM products p
      WHERE p.is_active = 1
      ORDER BY sold_count DESC
      LIMIT 3
    `;

    const [rows] = await db.query(sql);

    return rows;
  }

  static async getReviews(productId) {
    const sql = `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.username AS display_name,
        u.full_name,
        MAX(oi.variant_snapshot) AS variant_bought

      FROM reviews r

      JOIN users u ON r.user_id = u.id

      LEFT JOIN order_items oi
        ON r.order_id = oi.order_id

      LEFT JOIN product_variants pv
        ON oi.variant_id = pv.id
        AND pv.product_id = r.product_id

      WHERE r.product_id = ?

      GROUP BY
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.username,
        u.full_name

      ORDER BY r.created_at DESC
    `;

    const [rows] = await db.query(sql, [productId]);

    return rows;
  }

  static async checkUserCanReview(userId, orderId, productId) {
    if (orderId && orderId !== 0 && orderId !== "null") {
      const sql = `
        SELECT 
          EXISTS(
            SELECT 1
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN product_variants pv ON oi.variant_id = pv.id
            WHERE o.id = ?
            AND o.user_id = ?
            AND pv.product_id = ?
            AND LOWER(TRIM(o.status)) = 'completed'
          ) AS has_order,

          EXISTS(
            SELECT 1
            FROM reviews
            WHERE user_id = ?
            AND order_id = ?
            AND product_id = ?
          ) AS has_review
      `;

      const [rows] = await db.query(sql, [
        orderId,
        userId,
        productId,
        userId,
        orderId,
        productId,
      ]);

      return rows[0].has_order === 1 && rows[0].has_review === 0
        ? orderId
        : null;
    } else {
      const sql = `
        SELECT o.id AS order_id
        FROM orders o

        JOIN order_items oi
          ON o.id = oi.order_id

        JOIN product_variants pv
          ON oi.variant_id = pv.id

        WHERE o.user_id = ?
        AND pv.product_id = ?
        AND LOWER(TRIM(o.status)) = 'completed'

        AND NOT EXISTS (
          SELECT 1
          FROM reviews r
          WHERE r.user_id = o.user_id
          AND r.order_id = o.id
          AND r.product_id = pv.product_id
        )

        LIMIT 1
      `;

      const [rows] = await db.query(sql, [userId, productId]);

      return rows.length > 0 ? rows[0].order_id : null;
    }
  }

  static async createReview(userId, orderId, productId, rating, comment) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const insertSql = `
      INSERT INTO reviews (
        product_id,
        order_id,
        user_id,
        rating,
        comment
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(insertSql, [
      productId,
      orderId,
      userId,
      rating,
      comment,
    ]);

    const getSql = `
      SELECT
        r.*,
        u.username AS display_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;

    const [rows] = await db.query(getSql, [result.insertId]);

    return rows[0];
  }

  static async addImage(productId, imageUrl, isPrimary = 0, sortOrder = 0) {
    const sql = `
      INSERT INTO product_images (
        product_id,
        image_url,
        is_primary,
        sort_order
      )
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      productId,
      imageUrl,
      isPrimary,
      sortOrder,
    ]);

    return result.insertId;
  }

  static async removeImage(imageId) {
    const sql = `
      DELETE FROM product_images
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [imageId]);

    return result.affectedRows > 0;
  }

  static async setPrimaryImage(productId, imageId) {
    const connection = await db.getConnection();

    await connection.beginTransaction();

    try {
      await connection.query(
        `
        UPDATE product_images
        SET is_primary = 0
        WHERE product_id = ?
        `,
        [productId],
      );

      await connection.query(
        `
        UPDATE product_images
        SET is_primary = 1
        WHERE id = ?
        AND product_id = ?
        `,
        [imageId, productId],
      );

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

module.exports = Product;
