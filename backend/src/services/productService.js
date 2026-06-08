const Product = require("../models/productModel");

class ProductService {
  static async getAllProducts(query) {
    const { page = 1, limit = 12, keyword, brand, minPrice, maxPrice } = query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limitNumber = Math.max(parseInt(limit) || 12, 1);

    return Product.findAll({
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber,
      keyword,
      brand,
      minPrice,
      maxPrice,
    });
  }

  static async getProductById(id) {
    const product = await Product.getDetail(id);

    if (!product) {
      throw new Error("Sản phẩm không tồn tại hoặc đã bị ẩn");
    }

    return product;
  }

  static async getSuggestions(keyword) {
    if (!keyword?.trim()) return [];

    return Product.getSuggestions(keyword);
  }

  static async getHeroSale() {
    return Product.getTopSaleProduct();
  }

  static async createProduct(productData) {
    const { brand_id, category_id, name, variants } = productData;

    if (!name?.trim()) {
      throw new Error("Tên sản phẩm không được để trống");
    }

    if (!brand_id) {
      throw new Error("Vui lòng chọn thương hiệu");
    }

    if (!category_id) {
      throw new Error("Vui lòng chọn danh mục");
    }

    if (!variants?.length) {
      throw new Error("Sản phẩm phải có ít nhất 1 phiên bản");
    }

    return Product.create(productData);
  }

  static async updateProduct(id, productData) {
    if (!id) {
      throw new Error("Thiếu ID sản phẩm");
    }

    return Product.update(id, productData);
  }

  static async deleteProduct(id) {
    const success = await Product.delete(id);

    if (!success) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    return true;
  }

  static async uploadImage(productId, file, isPrimary, sortOrder) {
    if (!file) {
      throw new Error("Không có file ảnh được tải lên");
    }

    const imageUrl = file.path;

    const imageId = await Product.addImage(
      productId,
      imageUrl,
      isPrimary ? 1 : 0,
      sortOrder || 0,
    );

    return {
      id: imageId,
      product_id: productId,
      image_url: imageUrl,
      is_primary: isPrimary ? 1 : 0,
      sort_order: sortOrder || 0,
    };
  }

  static async removeImage(imageId) {
    const success = await Product.removeImage(imageId);

    if (!success) {
      throw new Error("Không tìm thấy ảnh");
    }

    return true;
  }

  static async setPrimaryImage(productId, imageId) {
    return Product.setPrimaryImage(productId, imageId);
  }

  static async getReviews(productId) {
    return Product.getReviews(productId);
  }

  static async checkCanReview(userId, orderId, productId) {
    if (!userId) {
      return {
        canReview: false,
        orderId: null,
      };
    }

    const validOrderId = await Product.findValidReviewOrder(
      userId,
      orderId,
      productId,
    );

    return {
      canReview: !!validOrderId,
      orderId: validOrderId,
    };
  }

  static async addReview(userId, productId, orderId, rating, comment) {
    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Số sao đánh giá phải từ 1 đến 5.");
    }

    const validOrderId = await Product.findValidReviewOrder(
      userId,
      orderId,
      productId,
    );

    if (!validOrderId) {
      throw new Error(
        "Bạn không có quyền đánh giá sản phẩm này (Chưa nhận hàng hoặc đã đánh giá).",
      );
    }

    return Product.insertReview(
      userId,
      validOrderId,
      productId,
      rating,
      comment,
    );
  }
}

module.exports = ProductService;
