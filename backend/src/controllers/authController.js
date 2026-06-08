const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");
require("dotenv").config();

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc!" });
    }

    const userId = await userService.createUser({
      username,
      email,
      password,
      full_name,
      phone,
      role_id: 2,
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      userId,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập tài khoản và mật khẩu!" });
    }

    const user = await userService.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Tài khoản bị khóa!" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role_name: user.role_name,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role_name: user.role_name,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      message: "Đăng nhập thành công",
      accessToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//refresh token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Không có refresh token",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({
      message: "Refresh token không hợp lệ",
    });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.json({ message: "Logged out" });
};

// RESET PASSWORD DEFAULT
exports.resetPasswordDefault = async (req, res) => {
  try {
    const hashed = await bcrypt.hash("123456", 10);

    for (let id = 1; id <= 100; id++) {
      await userService.updatePassword(id, hashed);
    }

    res.json({ message: "Reset password thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
