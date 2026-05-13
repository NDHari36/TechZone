const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const addressController = require("../controllers/addressController");
const authMiddleware = require("../middlewares/authMiddleware");

// --- DÀNH CHO KHÁCH HÀNG (USER) ---
router.put("/profile", authMiddleware, userController.updateProfile);
router.get("/me", authMiddleware, userController.getMe);
router.patch("/change-pwd", authMiddleware, userController.changePassword);

router.get("/address", authMiddleware, addressController.getMyAddresses);
router.post("/address", authMiddleware, addressController.createAddress);
router.delete("/address/:id", authMiddleware, addressController.deleteAddress);

router.patch(
  "/address/:id/default",
  authMiddleware,
  addressController.setDefaultAddress,
);
// --- DÀNH CHO QUẢN TRỊ VIÊN (ADMIN) ---
router.get("/all", authMiddleware, userController.getAllUsers);
router.post("/", authMiddleware, userController.createUser);
router.get("/address/:userId", addressController.getAddressesByUserId);

router.put("/:id", authMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, userController.deleteUser);
module.exports = router;
