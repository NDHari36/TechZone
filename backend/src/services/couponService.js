const Coupon = require("../models/couponModel");

class CouponService {
  static async validateCoupon(code, subtotal, userId) {
    const coupon = await Coupon.findByCode(code);

    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại hoặc đã hết hạn.");
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      throw new Error("Mã giảm giá này đã hết lượt sử dụng.");
    }

    if (coupon.min_order !== null && subtotal < coupon.min_order) {
      const minOrderFormatted = new Intl.NumberFormat("vi-VN").format(
        coupon.min_order,
      );

      throw new Error(
        `Đơn hàng tối thiểu ${minOrderFormatted}đ để dùng mã này.`,
      );
    }

    if (userId) {
      const used = await Coupon.checkUserUsedCoupon(userId, coupon.id);

      if (used) {
        throw new Error(
          "Bạn đã sử dụng mã giảm giá này cho một đơn hàng khác rồi.",
        );
      }
    }

    return coupon;
  }

  static async applyCoupon(code, subtotal, userId) {
    const coupon = await this.validateCoupon(code, subtotal, userId);

    let discountAmount = 0;

    if (coupon.type === "percent") {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === "fixed") {
      discountAmount = coupon.value;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      newTotal: subtotal - discountAmount,
    };
  }

  static async getAllCoupons(userId) {
    return Coupon.getAllActiveCoupons(userId);
  }
}

module.exports = CouponService;
