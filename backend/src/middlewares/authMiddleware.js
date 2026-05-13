const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId;

    const [users] = await db.query("SELECT is_active FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Tài khoản không tồn tại!" });
    }

    if (users[0].is_active === 0) {
      return res.status(403).json({
        error: "ACCOUNT_LOCKED",
        message: "Tài khoản của bạn đã bị khóa bởi Quản trị viên!",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Lỗi Verify Token:", error.message);
    return res
      .status(403)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

module.exports = authMiddleware;
