const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

class UserController {
  // DÀNH CHO USER
  static async getMe(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.getProfile(userId);

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.status(200).json({ result: user });
    } catch (error) {
      console.error("Lỗi getMe:", error.message);
      res.status(500).json({ message: "Lỗi server khi lấy thông tin" });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { full_name, email, phone } = req.body;

      if (email) {
        const [existingUser] = await db.query(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [email, userId],
        );
        if (existingUser.length > 0) {
          return res.status(400).json({ message: "Email này đã được sử dụng" });
        }
      }

      await User.updateProfile(userId, { full_name, email, phone });

      res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công",
      });
    } catch (error) {
      console.error("Lỗi updateProfile:", error.message);
      res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ" });
    }
  }

  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { password, newPassword, confirmPassword } = req.body;

      if (!password || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ" });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "Mật khẩu xác nhận không khớp" });
      }

      const [users] = await db.query(
        "SELECT password_hash FROM users WHERE id = ?",
        [userId],
      );
      if (users.length === 0)
        return res.status(404).json({ message: "User không tồn tại" });

      const isMatch = await bcrypt.compare(password, users[0].password_hash);
      if (!isMatch)
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });

      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      await User.updatePassword(userId, newPasswordHash);

      res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
      console.error("Lỗi changePassword:", error.message);
      res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
    }
  }

  // DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)

  static async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.status(200).json({ result: users });
    } catch (error) {
      console.error("Lỗi getAllUsers:", error.message);
      res
        .status(500)
        .json({ message: "Lỗi server khi tải danh sách người dùng" });
    }
  }

  static async createUser(req, res) {
    try {
      const { username, email, password, full_name, phone, role_id } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          message:
            "Vui lòng nhập các trường bắt buộc (Username, Email, Password)",
        });
      }

      const existingUser = await User.findByUsername(username);
      if (existingUser)
        return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

      const existingEmail = await User.findByEmail(email);
      if (existingEmail)
        return res.status(400).json({ message: "Email đã tồn tại" });

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const userId = await User.create({
        username,
        email,
        password_hash,
        role_id,
        full_name,
        phone,
      });

      res
        .status(201)
        .json({ message: "Tạo người dùng thành công", result: { id: userId } });
    } catch (error) {
      console.error("Lỗi createUser:", error.message);
      res.status(500).json({ message: "Lỗi server khi tạo người dùng" });
    }
  }

  static async updateUser(req, res) {
    try {
      const userId = Number(req.params.id);
      const { role_id, is_active } = req.body;

      const io = req.app.get("socketio");

      await User.updateAdmin(userId, { role_id, is_active }, io);

      res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
      console.error("Lỗi updateUser:", error.message);
      res.status(500).json({ message: "Lỗi server khi cập nhật" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const io = req.app.get("socketio");
      const success = await User.delete(userId, io);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.status(200).json({ message: "Xóa người dùng thành công" });
    } catch (error) {
      console.error("Lỗi deleteUser:", error.message);
      res.status(500).json({ message: "Lỗi server khi xóa người dùng" });
    }
  }
}

module.exports = UserController;
