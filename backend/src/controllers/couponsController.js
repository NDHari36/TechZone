const CouponService = require("../services/couponService");

class CouponController {
  static async applyCoupon(req, res) {
    try {
      const { code, subtotal } = req.body;
      const userId = req.user?.id || req.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Vui lòng đăng nhập.",
        });
      }

      if (!code || !subtotal) {
        return res.status(400).json({
          message: "Thiếu thông tin mã hoặc tổng tiền.",
        });
      }

      const result = await CouponService.applyCoupon(code, subtotal, userId);

      res.status(200).json({
        result,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  static async getAllCoupons(req, res) {
    try {
      const userId = req.user?.id || req.userId;

      const coupons = await CouponService.getAllCoupons(userId);

      res.status(200).json({
        result: coupons,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi server khi tải danh sách khuyến mãi.",
      });
    }
  }
}

module.exports = CouponController;
