const db = require("../config/db");

class Product {
  static normalizeVariant(variant) {
    return {
      sku: variant.sku,
      ram: variant.ram || null,
      storage: variant.storage || null,
      color: variant.color || null,
      price: Number(variant.price || 0),
      total_stock: Number(variant.total_stock || 0),
      specs: variant.product_variant_specs || [],
    };
  }

  static buildSpecsMap(specs) {
    const map = {};

    for (const spec of specs) {
      if (!map[spec.variant_id]) {
        map[spec.variant_id] = [];
      }

      map[spec.variant_id].push(spec);
    }

    return map;
  }

  static async findAll({
    limit = 50,
    offset = 0,
    keyword = "",
    brand = "",
    minPrice = 0,
    maxPrice = 999999999,
  }) {
    let sql = `
      SELECT
        p.id,
        p.name,
        p.category_id,
        p.created_at,

        b.name AS brand_name,
        c.name AS category_name,

        pi.image_url,

        pv_stats.min_price,

        COALESCE(stock.total_stock, 0) AS total_stock

      FROM products p

      JOIN brands b
        ON p.brand_id = b.id

      JOIN categories c
        ON p.category_id = c.id

      LEFT JOIN (
        SELECT
          product_id,
          MIN(price) AS min_price
        FROM product_variants
        GROUP BY product_id
      ) pv_stats
        ON pv_stats.product_id = p.id

      LEFT JOIN (
        SELECT
          pv.product_id,
          SUM(i.quantity) AS total_stock
        FROM inventories i
        JOIN product_variants pv
          ON i.variant_id = pv.id
        GROUP BY pv.product_id
      ) stock
        ON stock.product_id = p.id

      LEFT JOIN product_images pi
        ON pi.product_id = p.id
        AND pi.is_primary = 1

      WHERE p.is_active = 1
    `;

    const params = [];

    if (keyword?.trim()) {
      sql += `
        AND (
          p.name LIKE ?
          OR p.description LIKE ?
        )
      `;

      const search = `%${keyword}%`;

      params.push(search, search);
    }

    if (brand?.trim()) {
      sql += ` AND b.name = ? `;
      params.push(brand);
    }

    sql += `
      AND pv_stats.min_price BETWEEN ? AND ?
    `;

    params.push(Number(minPrice), Number(maxPrice));

    sql += `
      ORDER BY p.created_at DESC
      LIMIT ?
      OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

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
    const connection = await db.getConnection();

    try {
      const productSql = `
        SELECT
          p.id,
          p.brand_id,
          p.category_id,
          p.name,
          p.description,
          p.is_active,
          p.created_at,

          b.name AS brand_name,
          c.name AS category_name,

          COALESCE(stock.total_stock, 0) AS total_stock,

          COALESCE(rv.review_count, 0) AS review_count,
          COALESCE(rv.average_rating, 0) AS average_rating

        FROM products p

        JOIN brands b
          ON p.brand_id = b.id

        JOIN categories c
          ON p.category_id = c.id

        LEFT JOIN (
          SELECT
            pv.product_id,
            SUM(i.quantity) AS total_stock
          FROM inventories i
          JOIN product_variants pv
            ON i.variant_id = pv.id
          GROUP BY pv.product_id
        ) stock
          ON stock.product_id = p.id

        LEFT JOIN (
          SELECT
            product_id,
            COUNT(id) AS review_count,
            AVG(rating) AS average_rating
          FROM reviews
          GROUP BY product_id
        ) rv
          ON rv.product_id = p.id

        WHERE p.id = ?
        AND p.is_active = 1
      `;

      const imagesSql = `
        SELECT
          id,
          image_url,
          is_primary,
          sort_order
        FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order ASC
      `;

      const variantsSql = `
        SELECT
          pv.id,
          pv.product_id,
          pv.sku,
          pv.ram,
          pv.storage,
          pv.color,
          pv.price,

          COALESCE(i.quantity, 0) AS quantity,
          COALESCE(i.safety_stock, 0) AS safety_stock

        FROM product_variants pv

        LEFT JOIN inventories i
          ON pv.id = i.variant_id

        WHERE pv.product_id = ?
      `;

      const specsSql = `
        SELECT
          variant_id,
          group_name,
          name,
          value_text,
          unit,
          is_filterable,
          sort_order

        FROM product_variant_specs

        WHERE variant_id IN (
          SELECT id
          FROM product_variants
          WHERE product_id = ?
        )

        ORDER BY sort_order ASC
      `;

      const [[products], [images], [variants], [allSpecs]] = await Promise.all([
        connection.query(productSql, [id]),
        connection.query(imagesSql, [id]),
        connection.query(variantsSql, [id]),
        connection.query(specsSql, [id]),
      ]);

      if (products.length === 0) {
        return null;
      }

      const specsMap = this.buildSpecsMap(allSpecs);

      const variantsWithSpecs = variants.map((variant) => ({
        ...variant,
        product_variant_specs: specsMap[variant.id] || [],
      }));

      return {
        ...products[0],
        images,
        variants: variantsWithSpecs,
      };
    } finally {
      connection.release();
    }
  }

  static async create(productData) {
    const connection = await db.getConnection();

    await connection.beginTransaction();

    try {
      const {
        brand_id,
        category_id,
        name,
        description,
        variants = [],
        images = [],
      } = productData;

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

      if (images.length > 0) {
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

      for (const rawVariant of variants) {
        const variant = this.normalizeVariant(rawVariant);

        const [variantRes] = await connection.query(
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
            variant.ram,
            variant.storage,
            variant.color,
            variant.price,
          ],
        );

        const variantId = variantRes.insertId;

        await connection.query(
          `
            INSERT INTO inventories (
              variant_id,
              quantity
            )
            VALUES (?, ?)
          `,
          [variantId, variant.total_stock],
        );

        if (variant.specs.length > 0) {
          const specValues = variant.specs.map((s, idx) => [
            variantId,
            s.group_name || "Thông số chung",
            s.name,
            s.value_text || s.value || "",
            s.unit || null,
            s.is_filterable ? 1 : 0,
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
      const {
        brand_id,
        category_id,
        name,
        description,
        is_active = 1,
        variants = [],
      } = productData;

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
        [brand_id, category_id, name, description, is_active, id],
      );

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
        } catch (error) {
          throw new Error("Không thể xóa phiên bản đang được sử dụng.");
        }
      }

      for (const rawVariant of variants) {
        const variant = this.normalizeVariant(rawVariant);

        let variantId = rawVariant.id;

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
              variant.ram,
              variant.storage,
              variant.color,
              variant.price,
              variantId,
            ],
          );

          await connection.query(
            `
              UPDATE inventories
              SET quantity = ?
              WHERE variant_id = ?
            `,
            [variant.total_stock, variantId],
          );
        } else {
          const [variantRes] = await connection.query(
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
              variant.ram,
              variant.storage,
              variant.color,
              variant.price,
            ],
          );

          variantId = variantRes.insertId;

          await connection.query(
            `
              INSERT INTO inventories (
                variant_id,
                quantity
              )
              VALUES (?, ?)
            `,
            [variantId, variant.total_stock],
          );
        }

        await connection.query(
          `
            DELETE FROM product_variant_specs
            WHERE variant_id = ?
          `,
          [variantId],
        );

        if (variant.specs.length > 0) {
          const specValues = variant.specs.map((s, idx) => [
            variantId,
            s.group_name || "Thông số chung",
            s.name,
            s.value_text || s.value || "",
            s.unit || null,
            s.is_filterable ? 1 : 0,
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

        pv_stats.min_price AS originalPrice,

        COALESCE(sales.sold_count, 0) AS sold_count,

        pi.image_url AS image

      FROM products p

      LEFT JOIN (
        SELECT
          product_id,
          MIN(price) AS min_price
        FROM product_variants
        GROUP BY product_id
      ) pv_stats
        ON pv_stats.product_id = p.id

      LEFT JOIN (
        SELECT
          pv.product_id,
          SUM(oi.qty) AS sold_count
        FROM order_items oi
        JOIN product_variants pv
          ON oi.variant_id = pv.id
        GROUP BY pv.product_id
      ) sales
        ON sales.product_id = p.id

      LEFT JOIN product_images pi
        ON pi.product_id = p.id
        AND pi.is_primary = 1

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

      JOIN users u
        ON r.user_id = u.id

      LEFT JOIN order_items oi
        ON r.order_id = oi.order_id

      LEFT JOIN product_variants pv
        ON oi.variant_id = pv.id
        AND pv.product_id = r.product_id

      WHERE r.product_id = ?

      GROUP BY
        r.id,
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
            JOIN order_items oi
              ON o.id = oi.order_id
            JOIN product_variants pv
              ON oi.variant_id = pv.id
            WHERE
              o.id = ?
              AND o.user_id = ?
              AND pv.product_id = ?
              AND LOWER(TRIM(o.status)) = 'completed'
          ) AS has_order,

          EXISTS(
            SELECT 1
            FROM reviews
            WHERE
              user_id = ?
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
    }

    const sql = `
      SELECT o.id AS order_id

      FROM orders o

      JOIN order_items oi
        ON o.id = oi.order_id

      JOIN product_variants pv
        ON oi.variant_id = pv.id

      WHERE
        o.user_id = ?
        AND pv.product_id = ?
        AND LOWER(TRIM(o.status)) = 'completed'

        AND NOT EXISTS (
          SELECT 1
          FROM reviews r
          WHERE
            r.user_id = o.user_id
            AND r.order_id = o.id
            AND r.product_id = pv.product_id
        )

      LIMIT 1
    `;

    const [rows] = await db.query(sql, [userId, productId]);

    return rows.length > 0 ? rows[0].order_id : null;
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
      JOIN users u
        ON r.user_id = u.id
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
