const Dashboard = require("../models/dashboardModel");

class DashboardService {
  static async getDashboardData(startDate, endDate) {
    const [overview, revenueChart, ordersChart, recentOrders] =
      await Promise.all([
        Dashboard.getOverviewStats(startDate, endDate),
        Dashboard.getRevenueChart(startDate, endDate),
        Dashboard.getOrdersChart(startDate, endDate),
        Dashboard.getRecentOrders(startDate, endDate),
      ]);

    return {
      overview,
      revenueChart,
      ordersChart,
      recentOrders,
    };
  }
}

module.exports = DashboardService;
