const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", ProductController.getAllProducts);
router.get("/suggestions", ProductController.getSuggestions);
router.get("/hero-sale", ProductController.getHeroSale);
router.get("/:id", ProductController.getProductById);

router.get("/:id/reviews", ProductController.getReviews);

router.get("/:id/can-review", authMiddleware, ProductController.checkCanReview);

router.post("/:id/reviews", authMiddleware, ProductController.addReview);

router.post(
  "/:id/images",
  authMiddleware,
  upload.single("image"),
  ProductController.uploadImage,
);
router.delete(
  "/images/:imageId",
  authMiddleware,
  ProductController.removeImage,
);
router.put(
  "/:id/images/:imageId/primary",
  authMiddleware,
  ProductController.setPrimaryImage,
);

router.post("/", authMiddleware, ProductController.createProduct);
router.put("/:id", authMiddleware, ProductController.updateProduct);
router.delete("/:id", authMiddleware, ProductController.deleteProduct);

module.exports = router;
