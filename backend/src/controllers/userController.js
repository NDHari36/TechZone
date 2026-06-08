const UserService = require("../services/userService");

class UserController {
  static async getMe(req, res) {
    try {
      const user = await UserService.getProfile(req.user.id);

      res.status(200).json({
        result: user,
      });
    } catch (error) {
      res.status(error.message.includes("Không tìm thấy") ? 404 : 500).json({
        message: error.message,
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      await UserService.updateProfile(req.user.id, req.body);

      res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công",
      });
    } catch (error) {
      res.status(error.message.includes("Email") ? 400 : 500).json({
        message: error.message,
      });
    }
  }

  static async changePassword(req, res) {
    try {
      await UserService.changePassword(req.user.id, req.body);

      res.status(200).json({
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      res
        .status(
          error.message.includes("Mật khẩu") || error.message.includes("User")
            ? 400
            : 500,
        )
        .json({
          message: error.message,
        });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        result: users,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi server khi tải danh sách người dùng",
      });
    }
  }

  static async createUser(req, res) {
    try {
      const userId = await UserService.createUser(req.body);

      res.status(201).json({
        message: "Tạo người dùng thành công",
        result: {
          id: userId,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const io = req.app.get("socketio");

      await UserService.updateUser(Number(req.params.id), req.body, io);

      res.status(200).json({
        message: "Cập nhật thành công",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const io = req.app.get("socketio");

      await UserService.deleteUser(req.params.id, io);

      res.status(200).json({
        message: "Xóa người dùng thành công",
      });
    } catch (error) {
      res.status(error.message.includes("Không tìm thấy") ? 404 : 500).json({
        message: error.message,
      });
    }
  }
}

module.exports = UserController;
