const Order = require("../models/orderModel");

class OrderController {
  static async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { addressId, note, cartItemIds, couponId } = req.body;

      if (!addressId) {
        return res
          .status(400)
          .json({ message: "Vui lòng chọn địa chỉ giao hàng!" });
      }

      if (
        !cartItemIds ||
        !Array.isArray(cartItemIds) ||
        cartItemIds.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Giỏ hàng trống, không thể thanh toán!" });
      }

      const orderId = await Order.createOrder(userId, {
        addressId,
        note,
        cartItemIds,
        couponId,
      });

      res
        .status(201)
        .json({ message: "Đặt hàng thành công", result: { orderId } });
    } catch (error) {
      console.error("Lỗi Controller Đặt hàng:", error.message);
      res
        .status(500)
        .json({ message: error.message || "Lỗi hệ thống khi xử lý đơn hàng." });
    }
  }

  static async getOrderDetailForAdmin(req, res) {
    try {
      const orderId = req.params.id;
      const order = await Order.getOrderByIdAdmin(orderId);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
      }

      res.status(200).json({ result: order });
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng (Admin):", error.message);
      res.status(500).json({ message: "Lỗi Server khi tải chi tiết đơn hàng" });
    }
  }

  static async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await Order.getOrdersByUserId(userId);
      res
        .status(200)
        .json({ message: "Lấy danh sách đơn hàng thành công", result: orders });
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error.message);
      res.status(500).json({ message: "Lỗi Server khi tải đơn hàng" });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const orders = await Order.getAll();
      res.status(200).json({ result: orders });
    } catch (error) {
      console.error("Lỗi lấy tất cả đơn hàng (Admin):", error.message);
      res.status(500).json({ message: "Lỗi Server" });
    }
  }

  static async getOrderDetail(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await Order.getOrderById(orderId, userId);

      if (!order) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy đơn hàng này." });
      }

      res.status(200).json({ result: order });
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng:", error.message);
      res.status(500).json({ message: "Lỗi Server khi tải chi tiết đơn hàng" });
    }
  }

  static async cancelOrder(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const success = await Order.cancelOrder(orderId, userId);

      if (!success) {
        return res.status(400).json({
          message:
            "Không thể hủy đơn hàng. Đơn không tồn tại hoặc đã được xử lý.",
        });
      }

      res.status(200).json({ message: "Hủy đơn hàng thành công." });
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error.message);
      res.status(500).json({ message: "Lỗi Server khi hủy đơn hàng" });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp trạng thái mới." });
      }

      const success = await Order.updateOrderStatus(orderId, status);
      if (!success) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại." });
      }

      res.status(200).json({ message: "Cập nhật trạng thái thành công." });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error.message);
      res.status(500).json({ message: "Lỗi Server khi cập nhật trạng thái" });
    }
  }
}

module.exports = OrderController;
