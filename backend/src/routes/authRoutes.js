const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.register);
router.post("/signin", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.put("/reset-password-default/:id", authController.resetPasswordDefault);

module.exports = router;
