const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log(error.name);

      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Access token hết hạn",
      });

      return res.status(403).json({
        code: "INVALID_TOKEN",
        message: "Token không hợp lệ",
      });
    }

    return res.status(403).json({
      message: "Token không hợp lệ",
    });
  }
};

module.exports = authMiddleware;
