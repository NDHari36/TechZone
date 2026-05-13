const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// CÁC ROUTE DÀNH CHO ADMIN
router.get("/all", authMiddleware, OrderController.getAllOrders);
router.get(
  "/admin/:id",
  authMiddleware,
  OrderController.getOrderDetailForAdmin,
);
router.patch(
  "/admin/:id/status",
  authMiddleware,
  OrderController.updateOrderStatus,
);

// CÁC ROUTE DÀNH CHO KHÁCH HÀNG (USER)
router.post("/", authMiddleware, OrderController.createOrder);
router.get("/", authMiddleware, OrderController.getMyOrders);
router.get("/:id", authMiddleware, OrderController.getOrderDetail);
router.patch("/:id/cancel", authMiddleware, OrderController.cancelOrder);

module.exports = router;
