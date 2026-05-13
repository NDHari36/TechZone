const Product = require("../models/productModel");

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        keyword,
        brand,
        minPrice,
        maxPrice,
      } = req.query;

      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const limitNumber = Math.max(parseInt(limit) || 12, 1);

      const offset = (pageNumber - 1) * limitNumber;

      const products = await Product.findAll({
        limit: limitNumber,
        offset: offset,
        keyword,
        brand,
        minPrice,
        maxPrice,
      });

      res.json({
        success: true,
        result: products,
        data: products,
      });
    } catch (error) {
      console.error("Lỗi getAllProducts:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getDetail(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Sản phẩm không tồn tại hoặc đã bị ẩn",
        });
      }

      res.json({ success: true, result: product });
    } catch (error) {
      console.error("Lỗi getProductById:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi lấy chi tiết sản phẩm",
      });
    }
  }

  static async getSuggestions(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim() === "") return res.json({ success: true, result: [] });

      const suggestions = await Product.getSuggestions(q);
      res.json({ success: true, result: suggestions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHeroSale(req, res) {
    try {
      const products = await Product.getTopSaleProduct();
      res.status(200).json({ success: true, result: products });
    } catch (error) {
      console.error("Lỗi lấy sản phẩm Hero Sale:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi tải banner khuyến mãi" });
    }
  }

  static async createProduct(req, res) {
    try {
      const newProduct = await Product.create(req.body);
      res.status(201).json({ success: true, result: newProduct });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const updated = await Product.update(req.params.id, req.body);
      res.json({ success: true, result: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const success = await Product.delete(req.params.id);
      if (!success) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sản phẩm" });
      }
      res.json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadImage(req, res) {
    try {
      const productId = req.params.id;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Không có file ảnh được tải lên" });
      }

      const imageUrl = req.file.path;
      const isPrimary = req.body.is_primary ? 1 : 0;
      const sortOrder = req.body.sort_order || 0;

      const imageId = await Product.addImage(
        productId,
        imageUrl,
        isPrimary,
        sortOrder,
      );

      res.status(201).json({
        success: true,
        result: {
          id: imageId,
          product_id: productId,
          image_url: imageUrl,
          is_primary: isPrimary,
          sort_order: sortOrder,
        },
      });
    } catch (error) {
      console.error("Lỗi uploadImage:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async removeImage(req, res) {
    try {
      const { imageId } = req.params;
      const success = await Product.removeImage(imageId);

      if (!success) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy ảnh" });
      }

      res.json({ success: true, message: "Xóa ảnh thành công" });
    } catch (error) {
      console.error("Lỗi removeImage:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async setPrimaryImage(req, res) {
    try {
      const { id: productId, imageId } = req.params;
      await Product.setPrimaryImage(productId, imageId);

      res.json({ success: true, message: "Cập nhật ảnh đại diện thành công" });
    } catch (error) {
      console.error("Lỗi setPrimaryImage:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getReviews(req, res) {
    try {
      const productId = req.params.id;
      const reviews = await Product.getReviews(productId);
      res.status(200).json({ success: true, result: reviews });
    } catch (error) {
      console.error("Lỗi lấy đánh giá:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server khi tải đánh giá" });
    }
  }

  static async checkCanReview(req, res) {
    try {
      const userId = req.user?.id;
      const productId = req.params?.id;
      const orderId = req.query?.orderId || req.body?.orderId || null;

      if (!userId) return res.json({ success: true, canReview: false });

      const validOrderId = await Product.checkUserCanReview(
        userId,
        orderId,
        productId,
      );
      res.json({
        success: true,
        canReview: !!validOrderId,
        orderId: validOrderId,
      });
    } catch (error) {
      res.status(500).json({ success: false, canReview: false });
    }
  }
  static async addReview(req, res) {
    try {
      const userId = req.user.id;
      const productId = req.params.id;
      const { orderId, rating, comment } = req.body || {};

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Số sao đánh giá phải từ 1 đến 5.",
        });
      }

      const validOrderId = await Product.checkUserCanReview(
        userId,
        orderId,
        productId,
      );

      console.log("BE Log - Kết quả validOrderId:", validOrderId);

      if (!validOrderId) {
        return res.status(403).json({
          success: false,
          message:
            "Bạn không có quyền đánh giá sản phẩm này (Chưa nhận hàng hoặc đã đánh giá).",
        });
      }

      const newReview = await Product.createReview(
        userId,
        validOrderId,
        productId,
        rating,
        comment,
      );
      res.status(201).json({ success: true, result: newReview });
    } catch (error) {
      console.error("Lỗi addReview:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server khi gửi đánh giá" });
    }
  }
}

module.exports = ProductController;
