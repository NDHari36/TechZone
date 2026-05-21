const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", CartController.getMyCart);
router.post("/:productId", CartController.addToCart);
router.put("/item", CartController.updateQuantity);
router.delete("/item/:variantId", CartController.removeItem);

module.exports = router;
