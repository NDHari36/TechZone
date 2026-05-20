const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.register);
router.post("/signin", authController.login);
router.put("/reset-password-default/:id", authController.resetPasswordDefault);

module.exports = router;
