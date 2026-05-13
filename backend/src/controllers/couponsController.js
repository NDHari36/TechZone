const Coupon = require("../models/couponModel");

class CouponController {
  static async applyCoupon(req, res) {
    try {
      const { code, subtotal } = req.body;
      const userId = req.user?.id || req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Vui lòng đăng nhập." });
      }

      if (!code || !subtotal) {
        return res
          .status(400)
          .json({ message: "Thiếu thông tin mã hoặc tổng tiền." });
      }

      const coupon = await Coupon.findValidCoupon(code, subtotal, userId);

      let discountAmount = 0;
      if (coupon.type === "percent") {
        discountAmount = (subtotal * coupon.value) / 100;
      } else if (coupon.type === "fixed") {
        discountAmount = coupon.value;
      }

      discountAmount = Math.min(discountAmount, subtotal);

      res.status(200).json({
        result: {
          couponId: coupon.id,
          code: coupon.code,
          discountAmount,
          newTotal: subtotal - discountAmount,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAllCoupons(req, res) {
    try {
      const userId = req.user?.id || req.userId;
      const coupons = await Coupon.getAllActiveCoupons(userId);
      res.status(200).json({ result: coupons });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi server khi tải danh sách khuyến mãi." });
    }
  }
}

module.exports = CouponController;
