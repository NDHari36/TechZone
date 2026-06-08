const DashboardService = require("../services/dashboardService");

class DashboardController {
  static async getDashboardData(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const result = await DashboardService.getDashboardData(
        startDate,
        endDate,
      );

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Lỗi DashboardController:", error);

      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }
}

module.exports = DashboardController;
