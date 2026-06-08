const AddressService = require("../services/addressService");

class AddressController {
  static async getMyAddresses(req, res) {
    try {
      const userId = req.user.id;

      const addresses = await AddressService.getAddressesByUserId(userId);

      res.status(200).json({
        success: true,
        result: addresses,
      });
    } catch (error) {
      console.error("Lỗi getMyAddresses:", error.message);

      res.status(500).json({
        message: "Lỗi server khi lấy địa chỉ",
      });
    }
  }

  static async createAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressData = req.body;

      const addressId = await AddressService.addAddress(userId, addressData);

      res.status(201).json({
        success: true,
        message: "Thêm địa chỉ mới thành công",
        result: {
          id: addressId,
          ...addressData,
        },
      });
    } catch (error) {
      console.error("LỖI SQL CHI TIẾT:", error.message);

      res.status(500).json({
        message: "Lỗi hệ thống khi lưu địa chỉ: " + error.message,
      });
    }
  }

  static async getAddressesByUserId(req, res) {
    try {
      const userId = req.params.userId;

      const addresses = await AddressService.getAddressesByUserId(userId);

      res.status(200).json({
        success: true,
        result: addresses,
      });
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }

  static async setDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;

      const success = await AddressService.updateDefault(userId, addressId);

      if (!success) {
        return res.status(404).json({
          message: "Không tìm thấy địa chỉ hoặc không có quyền thay đổi!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Đã đặt làm địa chỉ mặc định thành công",
      });
    } catch (error) {
      console.error("Lỗi setDefaultAddress:", error.message);

      res.status(500).json({
        message: "Lỗi hệ thống khi đặt mặc định",
      });
    }
  }

  static async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;

      const success = await AddressService.deleteAddress(userId, addressId);

      if (!success) {
        return res.status(404).json({
          message: "Không tìm thấy địa chỉ để xóa!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Xóa địa chỉ thành công",
      });
    } catch (error) {
      console.error("Lỗi deleteAddress:", error.message);

      res.status(500).json({
        message: "Lỗi server khi xóa địa chỉ",
      });
    }
  }
}

module.exports = AddressController;
