const Dashboard = require("../models/dashboardModel");

class DashboardController {
  static async getDashboardData(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const [overview, revenueChart, ordersChart, recentOrders] =
        await Promise.all([
          Dashboard.getOverviewStats(startDate, endDate),
          Dashboard.getRevenueChart(startDate, endDate),
          Dashboard.getOrdersChart(startDate, endDate),
          Dashboard.getRecentOrders(startDate, endDate),
        ]);

      res.status(200).json({
        success: true,
        result: { overview, revenueChart, ordersChart, recentOrders },
      });
    } catch (error) {
      console.error("Lỗi DashboardController:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }
}

module.exports = DashboardController;
