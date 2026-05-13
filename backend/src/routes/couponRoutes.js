const express = require("express");
const router = express.Router();
const CouponController = require("../controllers/couponsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, CouponController.getAllCoupons);

router.post("/apply", authMiddleware, CouponController.applyCoupon);

module.exports = router;
