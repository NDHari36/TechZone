const { z } = require("zod");
const OrderService = require("../services/orderService");

const CreateOrderSchema = z.object({
  addressId: z.coerce
    .number({ required_error: "Địa chỉ là bắt buộc" })
    .positive("Địa chỉ không hợp lệ"),
  cartItemIds: z
    .array(z.coerce.number())
    .nonempty("Giỏ hàng không được để trống"),
  couponId: z.coerce.number().positive().optional().nullable(),
});

const OrderIdParamSchema = z.object({
  id: z.coerce
    .number({ required_error: "ID đơn hàng là bắt buộc" })
    .positive("ID đơn hàng không hợp lệ"),
});

const UpdateOrderStatusSchema = z.object({
  status: z
    .string({ required_error: "Trạng thái đơn hàng là bắt buộc" })
    .min(1, "Trạng thái không được trống"),
});

class OrderController {
  static async createOrder(req, res) {
    try {
      const validatedData = CreateOrderSchema.parse(req.body);

      const orderId = await OrderService.createOrder(
        req.user.id,
        validatedData,
      );

      return res.status(201).json({
        message: "Đặt hàng thành công",
        result: { orderId },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0]?.message || "Dữ liệu yêu cầu không hợp lệ",
          errors: error.errors,
        });
      }
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  static async getOrderDetailForAdmin(req, res) {
    try {
      const { id } = OrderIdParamSchema.parse(req.params);

      const order = await OrderService.getOrderDetailForAdmin(id);

      return res.status(200).json({
        result: order,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0]?.message || "ID đơn hàng không hợp lệ",
        });
      }

      return res
        .status(error.message === "Không tìm thấy đơn hàng." ? 404 : 500)
        .json({
          message: error.message,
        });
    }
  }

  static async getMyOrders(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Không có quyền truy cập." });
      }
      const orders = await OrderService.getMyOrders(req.user.id);

      return res.status(200).json({
        message: "Lấy danh sách đơn hàng thành công",
        result: orders,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Lỗi Server khi tải đơn hàng",
      });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const orders = await OrderService.getAllOrders();

      return res.status(200).json({
        result: orders,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Lỗi Server",
      });
    }
  }

  static async getOrderDetail(req, res) {
    try {
      const { id } = OrderIdParamSchema.parse(req.params);

      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Không có quyền truy cập." });
      }

      const order = await OrderService.getOrderDetail(id, req.user.id);

      return res.status(200).json({ result: order });
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0]?.message || "ID đơn hàng không hợp lệ",
        });
      }

      const status =
        error.message === "Không tìm thấy đơn hàng này." ? 404 : 500;

      return res.status(status).json({
        message: error.message,
      });
    }
  }

  static async cancelOrder(req, res) {
    try {
      const { id } = OrderIdParamSchema.parse(req.params);

      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Không có quyền truy cập." });
      }

      await OrderService.cancelOrder(id, req.user.id);

      return res.status(200).json({
        message: "Hủy đơn hàng thành công.",
      });
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0]?.message || "Yêu cầu không hợp lệ",
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const { id } = OrderIdParamSchema.parse(req.params);
      const { status } = UpdateOrderStatusSchema.parse(req.body);

      await OrderService.updateOrderStatus(id, status);

      return res.status(200).json({
        message: "Cập nhật trạng thái thành công.",
      });
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message:
            error.errors[0]?.message || "Dữ liệu trạng thái không hợp lệ",
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }
  }
}

module.exports = OrderController;
