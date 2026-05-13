const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ các trường bắt buộc!" });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail)
      return res.status(409).json({ message: "Email này đã được sử dụng!" });

    const existingUsername = await User.findByUsername(username);
    if (existingUsername)
      return res.status(409).json({ message: "Tên đăng nhập đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      role_id: 2,
    });

    if (full_name || phone) {
      await User.updateProfile(userId, {
        full_name: full_name || username,
        email: email,
        phone: phone || "",
      });
    }

    res.status(201).json({
      message: "Đăng ký thành công!",
      userId,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi Server khi đăng ký" });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập Username và Mật khẩu",
      });
    }

    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng!",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa !",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role_name: user.role_name,
      },
      process.env.JWT_SECRET || "aa03abdd77bdfa26ad1999d871c4aca3",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      message: "Lỗi Server khi đăng nhập",
    });
  }
};
