const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.getById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User không tồn tại",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa",
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      is_active: user.is_active,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Access token hết hạn",
      });
    }

    return res.status(403).json({
      message: "Token không hợp lệ",
    });
  }
};

module.exports = authMiddleware;
