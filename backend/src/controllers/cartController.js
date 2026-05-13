const Cart = require("../models/cartModel");

class CartController {
  static async getMyCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await Cart.getCart(userId);
      res.json({ result: cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { productId, variantId, quantity = 1 } = req.body;

      if (!productId && !variantId) {
        return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
      }

      const updatedCart = await Cart.addItem(
        userId,
        productId,
        variantId,
        quantity,
      );
      res
        .status(200)
        .json({ message: "Đã thêm vào giỏ hàng", result: updatedCart });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { variantId, quantity } = req.body;

      const updatedCart = await Cart.updateItemQty(userId, variantId, quantity);
      res.json({ message: "Đã cập nhật số lượng", result: updatedCart });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const { variantId } = req.params;

      const updatedCart = await Cart.removeItem(userId, variantId);
      res.json({ message: "Đã xóa sản phẩm khỏi giỏ", result: updatedCart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CartController;
