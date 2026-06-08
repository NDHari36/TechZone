const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

class UserService {
  // GET USER BY USERNAME (giữ lại vì controller dùng)
  static async getUserByUsername(username) {
    return await User.findByUsername(username);
  }

  static async getProfile(userId) {
    const user = await User.getProfile(userId);
    if (!user) throw new Error("Không tìm thấy user");
    return user;
  }

  static async createUser(data) {
    const { username, email, password, full_name, phone, role_id } = data;

    if (!username || !email || !password) {
      throw new Error("Thiếu dữ liệu");
    }

    const existedUsername = await User.findByUsername(username);
    if (existedUsername) throw new Error("Username đã tồn tại");

    const existedEmail = await User.findByEmail(email);
    if (existedEmail) throw new Error("Email đã tồn tại");

    const hash = await bcrypt.hash(password, 10);

    return await User.create({
      username,
      email,
      password_hash: hash,
      full_name,
      phone,
      role_id,
    });
  }

  static async updatePassword(userId, passwordHash) {
    return await User.updatePassword(userId, passwordHash);
  }

  static async updateProfile(userId, data) {
    const { email } = data;

    if (email) {
      const existing = await User.findByEmail(email);
      if (existing && existing.id !== userId) {
        throw new Error("Email đã tồn tại");
      }
    }

    return await User.updateProfile(userId, data);
  }

  static async changePassword(
    userId,
    { password, newPassword, confirmPassword },
  ) {
    if (!password || !newPassword || !confirmPassword) {
      throw new Error("Thiếu dữ liệu");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Mật khẩu xác nhận không khớp");
    }

    const user = await User.getById(userId);
    if (!user) throw new Error("User không tồn tại");

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error("Sai mật khẩu cũ");

    const hash = await bcrypt.hash(newPassword, 10);

    return await User.updatePassword(userId, hash);
  }

  static async getAllUsers() {
    return await User.getAll();
  }

  static async updateUser(userId, data) {
    return await User.updateAdmin(userId, data);
  }

  static async deleteUser(userId) {
    const ok = await User.delete(userId);
    if (!ok) throw new Error("Không tìm thấy user");
    return true;
  }
}

module.exports = UserService;
