const Order = require("../models/orderModel");

class OrderService {
  static async createOrder(userId, data) {
    const { addressId, cartItemIds, couponId } = data;

    // Sử dụng Transaction Helper Wrapper để tránh rò rỉ Connection DB lên Service Layer
    return await Order.withTransaction(async (connection) => {
      const address = await Order.getAddress(connection, addressId, userId);

      if (!address) {
        throw new Error("Địa chỉ không tồn tại");
      }

      // Đọc giỏ hàng thuần không khóa bảng tĩnh
      const cartItems = await Order.getCartItems(connection, cartItemIds);
      if (!cartItems.length) {
        throw new Error("Không có sản phẩm nào");
      }

      // ĐIỂM CHUYÊN SÂU: Khóa dòng inventories theo ID tăng dần để ngăn chặn triệt để Deadlock
      const variantIds = cartItems.map((item) => item.variant_id);
      const lockedStocks = await Order.lockInventories(connection, variantIds);

      const stockMap = new Map();
      lockedStocks.forEach((inv) => {
        stockMap.set(inv.variant_id, inv.stock);
      });

      // Kiểm tra kho an toàn sau khi đã lock dòng
      for (const item of cartItems) {
        const currentStock = stockMap.get(item.variant_id) || 0;
        if (currentStock < item.qty) {
          throw new Error(`${item.product_name} không đủ tồn kho`);
        }
      }

      let subtotal = 0;
      for (const item of cartItems) {
        subtotal += item.price * item.qty;
      }

      let discountTotal = 0;
      if (couponId) {
        // CHUẨN HOÁ PHÂN TẦNG: Lấy dữ liệu Coupon thô từ Model, thực hiện check nghiệp vụ tại Service Layer
        const coupon = await Order.getCoupon(connection, couponId);

        if (!coupon) {
          throw new Error("Mã giảm giá không hợp lệ");
        }

        // Thực hiện kiểm tra ngày hết hạn và trạng thái hoạt động ở tầng Service
        const now = new Date();
        const isExpired = coupon.end_at && new Date(coupon.end_at) <= now;
        if (coupon.is_active !== 1 || isExpired) {
          throw new Error("Mã giảm giá đã hết hạn hoặc không khả dụng");
        }

        discountTotal = coupon.discount_value;
      }

      const shippingFee = Order.CONFIG.DEFAULT_SHIPPING_FEE;
      const total = subtotal - discountTotal + shippingFee;

      // ĐIỂM CHUYÊN SÂU: Sinh mã đơn hàng độc bản kết hợp User ID, mốc thời gian và Suffix ngẫu nhiên
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `${Order.CONFIG.CODE_PREFIX}-${userId}-${Date.now()}-${uniqueSuffix}`;

      const orderId = await Order.insertOrder(connection, {
        userId,
        code,
        status: Order.STATUS.PENDING,
        subtotal,
        discountTotal,
        shippingFee,
        total,
        ...address,
      });

      // Tối ưu N+1 Query: Chuẩn bị danh sách Order Items để Batch Insert trong 1 lần gọi DB duy nhất
      const orderItems = cartItems.map((item) => ({
        orderId,
        ...item,
        lineTotal: item.price * item.qty,
      }));

      await Order.createOrderItemsBatch(connection, orderItems);

      // Cập nhật tồn kho an toàn bằng Atomic Update kết hợp kiểm định tại Service Layer
      for (const item of cartItems) {
        const affectedRows = await Order.updateInventory(
          connection,
          item.variant_id,
          item.qty,
        );
        if (affectedRows === 0) {
          throw new Error(
            `${item.product_name} không đủ tồn kho hoặc đã hết hàng.`,
          );
        }
      }

      await Order.deleteCartItems(connection, cartItemIds);

      if (couponId) {
        await Order.saveCoupon(connection, orderId, couponId, discountTotal);
      }

      return orderId;
    });
  }

  static async getAllOrders() {
    const orders = await Order.getAll();

    return orders.map((order) => ({
      ...order,
      isPaid: !!order.paid_at,
    }));
  }

  static async getOrderDetailForAdmin(orderId) {
    const rows = await Order.getOrderByIdAdmin(orderId);

    // Kiểm tra và throw error nghiệp vụ tại Service
    if (!rows || rows.length === 0 || !rows[0].id) {
      const error = new Error("Không tìm thấy đơn hàng.");
      error.status = 404;
      throw error;
    }

    const first = rows[0];

    // CHUẨN HOÁ KIẾN TRÚC: Transform / Map raw data từ model và build response object cuối cùng tại Service Layer
    return {
      ...first,
      items: first.productId
        ? rows
            .filter((r) => r.variant_id)
            .map((r) => ({
              productId: r.productId,
              variantId: r.variant_id,
              productName: r.productName,
              productImage: r.productImage,
              quantity: r.quantity,
              price: r.price,
              line_total: r.line_total,
              hasReviewed: !!r.hasReviewed,
            }))
        : [],
    };
  }

  static async getMyOrders(userId) {
    const rows = await Order.getOrdersByUserId(userId);

    const ordersMap = new Map();

    rows.forEach((row) => {
      if (!ordersMap.has(row.orderId)) {
        ordersMap.set(row.orderId, {
          id: row.orderId,
          code: row.code,
          status: row.status,
          total: row.total,
          created_at: row.orderDate,
          items: [],
        });
      }

      ordersMap.get(row.orderId).items.push({
        id: row.orderItemId,
        variantId: row.variantId,
        productId: row.productId,
        productName: row.productName,
        quantity: row.quantity,
        price: row.price,
        productImage: row.productImage,
        hasReviewed: Boolean(row.hasReviewed),
      });
    });

    return Array.from(ordersMap.values());
  }

  static async getOrderDetail(orderId, userId) {
    // CHUẨN HOÁ KIẾN TRÚC: Lấy raw rows từ Model và kiểm tra tại Service
    const rows = await Order.getOrderById(orderId, userId);

    if (!rows || rows.length === 0) {
      const error = new Error("Không tìm thấy đơn hàng này.");
      error.status = 404;
      throw error;
    }

    const first = rows[0];

    // CHUẨN HOÁ KIẾN TRÚC: Transform / Map raw data từ model và build response object cuối cùng tại Service Layer
    return {
      id: first.id,
      code: first.code,
      status: first.status,
      subtotal: first.subtotal,
      shipping_fee: first.shipping_fee,
      total: first.total,
      receiver_name: first.receiver_name,
      receiver_phone: first.receiver_phone,
      ship_line1: first.ship_line1,
      ship_ward: first.ship_ward,
      ship_district: first.ship_district,
      ship_city: first.ship_city,
      created_at: first.created_at,
      items: rows
        .filter((r) => r.product_name_snapshot)
        .map((r) => ({
          productId: r.productId,
          productName: r.product_name_snapshot,
          price: r.unit_price_snapshot,
          quantity: r.qty,
          image: r.product_image_snapshot,
          sku: r.variant_snapshot || "Mặc định",
          hasReviewed: Boolean(r.hasReviewed),
        })),
    };
  }

  // ĐIỂM CHUYÊN SÂU: Hoàn trả lại tồn kho tự động khi hủy đơn hàng trong cùng transaction
  static async cancelOrder(orderId, userId) {
    return await Order.withTransaction(async (connection) => {
      // Đọc các item thuộc đơn hàng để hoàn kho
      const items = await Order.getOrderItemsByOrderId(connection, orderId);

      const affectedRows = await Order.cancelOrderWithConnection(
        connection,
        orderId,
        userId,
      );
      if (affectedRows === 0) {
        throw new Error("Không thể hủy đơn hàng.");
      }

      // Hoàn trả tồn kho một cách nhất quán
      for (const item of items) {
        await Order.incrementInventory(connection, item.variant_id, item.qty);
      }

      return affectedRows;
    });
  }

  // ĐIỂM CHUYÊN SÂU: Hoàn trả lại tồn kho tự động khi trạng thái chuyển sang CANCELLED
  static async updateOrderStatus(orderId, status) {
    if (!status) {
      throw new Error("Vui lòng cung cấp trạng thái mới.");
    }

    return await Order.withTransaction(async (connection) => {
      if (status === Order.STATUS.CANCELLED) {
        const items = await Order.getOrderItemsByOrderId(connection, orderId);

        const affectedRows = await Order.updateOrderStatusWithConnection(
          connection,
          orderId,
          status,
        );
        if (affectedRows === 0) {
          throw new Error(
            "Không tìm thấy đơn hàng hoặc trạng thái không thay đổi.",
          );
        }

        // Hoàn kho nếu đơn hàng bị hủy bởi admin
        for (const item of items) {
          await Order.incrementInventory(connection, item.variant_id, item.qty);
        }

        return affectedRows;
      } else {
        const affectedRows = await Order.updateOrderStatusWithConnection(
          connection,
          orderId,
          status,
        );
        if (affectedRows === 0) {
          throw new Error(
            "Không tìm thấy đơn hàng hoặc trạng thái không thay đổi.",
          );
        }
        return affectedRows;
      }
    });
  }
}

module.exports = OrderService;
