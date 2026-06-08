const Cart = require("../models/cartModel");

class CartService {
  static async getOrCreateCart(userId) {
    const cart = await Cart.getCartByUserId(userId);

    if (cart) {
      return cart.id;
    }

    return await Cart.createCart(userId);
  }

  static async getCart(userId) {
    const cartId = await this.getOrCreateCart(userId);

    const items = await Cart.getCartItems(cartId);

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    return {
      cart_id: cartId,
      total,
      items,
    };
  }

  static async addItem(userId, productId, variantId, quantity) {
    const cartId = await this.getOrCreateCart(userId);

    let actualVariantId = variantId;

    if (!actualVariantId && productId) {
      const variant = await Cart.getCheapestVariant(productId);

      if (!variant) {
        throw new Error("Sản phẩm này chưa có cấu hình để thêm vào giỏ");
      }

      actualVariantId = variant.id;
    }

    const variant = await Cart.getVariantById(actualVariantId);

    if (!variant) {
      throw new Error("Không tìm thấy thông tin cấu hình sản phẩm");
    }

    const existing = await Cart.getCartItem(cartId, actualVariantId);

    if (existing) {
      await Cart.updateCartItem(existing.id, quantity, variant.price);
    } else {
      await Cart.insertCartItem(
        cartId,
        actualVariantId,
        quantity,
        variant.price,
      );
    }

    return await this.getCart(userId);
  }

  static async updateItemQty(userId, variantId, quantity) {
    const cartId = await this.getOrCreateCart(userId);

    if (quantity <= 0) {
      return await this.removeItem(userId, variantId);
    }

    await Cart.updateQuantity(cartId, variantId, quantity);

    return await this.getCart(userId);
  }

  static async removeItem(userId, variantId) {
    const cartId = await this.getOrCreateCart(userId);

    await Cart.removeItem(cartId, variantId);

    return await this.getCart(userId);
  }
}

module.exports = CartService;
