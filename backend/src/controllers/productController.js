const ProductService = require("../services/productService");

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const products = await ProductService.getAllProducts(req.query);

      res.json({
        success: true,
        result: products,
        data: products,
      });
    } catch (error) {
      console.error("Lỗi getAllProducts:", error.message);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getProductById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);

      res.json({
        success: true,
        result: product,
      });
    } catch (error) {
      console.error("Lỗi getProductById:", error.message);

      res.status(error.message.includes("không tồn tại") ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getSuggestions(req, res) {
    try {
      const suggestions = await ProductService.getSuggestions(req.query.q);

      res.json({
        success: true,
        result: suggestions,
      });
    } catch (error) {
      console.error("Lỗi getSuggestions:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getHeroSale(req, res) {
    try {
      const products = await ProductService.getHeroSale();

      res.status(200).json({
        success: true,
        result: products,
      });
    } catch (error) {
      console.error("Lỗi lấy sản phẩm Hero Sale:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi tải banner khuyến mãi",
      });
    }
  }

  static async createProduct(req, res) {
    try {
      const product = await ProductService.createProduct(req.body);

      res.status(201).json({
        success: true,
        result: product,
      });
    } catch (error) {
      console.error("Lỗi createProduct:", error);

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateProduct(req, res) {
    try {
      const product = await ProductService.updateProduct(
        req.params.id,
        req.body,
      );

      res.json({
        success: true,
        result: product,
      });
    } catch (error) {
      console.error("Lỗi updateProduct:", error);

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteProduct(req, res) {
    try {
      await ProductService.deleteProduct(req.params.id);

      res.json({
        success: true,
        message: "Xóa sản phẩm thành công",
      });
    } catch (error) {
      console.error("Lỗi deleteProduct:", error);

      res.status(error.message.includes("Không tìm thấy") ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async uploadImage(req, res) {
    try {
      const result = await ProductService.uploadImage(
        req.params.id,
        req.file,
        req.body.is_primary,
        req.body.sort_order,
      );

      res.status(201).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Lỗi uploadImage:", error);

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async removeImage(req, res) {
    try {
      await ProductService.removeImage(req.params.imageId);

      res.json({
        success: true,
        message: "Xóa ảnh thành công",
      });
    } catch (error) {
      console.error("Lỗi removeImage:", error);

      res.status(error.message.includes("Không tìm thấy") ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async setPrimaryImage(req, res) {
    try {
      const { id: productId, imageId } = req.params;

      await ProductService.setPrimaryImage(productId, imageId);

      res.json({
        success: true,
        message: "Cập nhật ảnh đại diện thành công",
      });
    } catch (error) {
      console.error("Lỗi setPrimaryImage:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getReviews(req, res) {
    try {
      const reviews = await ProductService.getReviews(req.params.id);

      res.status(200).json({
        success: true,
        result: reviews,
      });
    } catch (error) {
      console.error("Lỗi lấy đánh giá:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi server khi tải đánh giá",
      });
    }
  }

  static async checkCanReview(req, res) {
    try {
      const result = await ProductService.checkCanReview(
        req.user?.id,
        req.query?.orderId || req.body?.orderId || null,
        req.params.id,
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Lỗi checkCanReview:", error);

      res.status(500).json({
        success: false,
        canReview: false,
      });
    }
  }

  static async addReview(req, res) {
    try {
      const review = await ProductService.addReview(
        req.user.id,
        req.params.id,
        req.body.orderId,
        req.body.rating,
        req.body.comment,
      );

      res.status(201).json({
        success: true,
        result: review,
      });
    } catch (error) {
      console.error("Lỗi addReview:", error);

      const status = error.message.includes("không có quyền đánh giá")
        ? 403
        : error.message.includes("Số sao đánh giá")
          ? 400
          : 500;

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = ProductController;
