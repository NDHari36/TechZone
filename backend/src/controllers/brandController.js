const Brand = require("../models/brandModel");

class BrandController {
  static async getBrands(req, res) {
    try {
      const brandList = await Brand.getAllActive();
      res.status(200).json({
        success: true,
        result: brandList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách hãng",
        error: error.message,
      });
    }
  }
}

module.exports = BrandController;
