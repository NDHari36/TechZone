import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  Loader,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import dashboardApi from "../../api/dashboardApi";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const today = new Date();

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  const [data, setData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      lowStock: 0,
    },
    revenueChart: [],
    ordersChart: [],
    recentOrders: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.getStats({ startDate, endDate });
        if (res.success || res.result) {
          setData(res.result || res);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setTimeout(() => setLoading(false), 100);
      }
    };
    fetchDashboard();
  }, [startDate, endDate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleSetToday = () => {
    const todayStr = formatDate(new Date());
    setStartDate(todayStr);
    setEndDate(todayStr);
  };
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipping: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="h-10 w-10 animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wider">
            Tổng quan hệ thống
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Theo dõi doanh thu và hoạt động kinh doanh (Dữ liệu thực tế)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={handleSetToday}
            className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all mr-2"
          >
            HÔM NAY
          </button>
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-colors"
          />
          <span className="text-gray-400 font-bold">-</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                Doanh thu
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {formatCurrency(data.overview.totalRevenue)}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">
                  Hôm nay:
                </span>
                <span className="text-sm font-black text-green-600">
                  {formatCurrency(data.overview.todayRevenue)}{" "}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          onClick={() => {
            document
              .getElementById("recent-orders")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">
                Đơn hàng
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {data.overview.totalOrders}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                Khách hàng
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {data.overview.totalCustomers}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                Cảnh báo kho (Hiện tại)
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                {data.overview.lowStock}
              </h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm font-bold text-orange-600">
            <span>Sản phẩm sắp/đã hết hàng</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-6">
            Biểu đồ doanh thu
          </h3>
          <div className="h-80 w-full min-h-[320px]">
            {data.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="320">
                <AreaChart data={data.revenueChart}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontWeight: 600 }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                    dx={-10}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#111827"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 font-bold">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-6">
            Trạng thái đơn hàng
          </h3>
          <div className="h-80 w-full min-h-[320px]">
            {data.ordersChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="320">
                <BarChart data={data.ordersChart}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontWeight: 600 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    stackId="a"
                    fill="#10B981"
                    radius={[0, 0, 4, 4]}
                    name="Thành công"
                  />
                  <Bar
                    dataKey="pending"
                    stackId="a"
                    fill="#F59E0B"
                    radius={[0, 0, 0, 0]}
                    name="Chờ xử lý"
                  />
                  <Bar
                    dataKey="cancelled"
                    stackId="a"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    name="Đã hủy"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 font-bold">
                Chưa có dữ liệu đơn hàng
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        id="recent-orders"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {" "}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider">
            Đơn hàng gần đây
          </h3>
          <button
            onClick={() => {
              document
                .getElementById("recent-orders")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm font-bold flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            Xem tất cả <ArrowUpRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-black">Mã đơn</th>
                <th className="p-4 font-black">Khách hàng</th>
                <th className="p-4 font-black">Liên hệ</th>
                <th className="p-4 font-black">Tổng tiền</th>
                <th className="p-4 font-black">Trạng thái</th>
                <th className="p-4 font-black">Ngày đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <tr
                    key={order.id || order.code}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-gray-900">
                      {order.code}
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {order.full_name || order.username || "Khách vãng lai"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {order.phone || order.email || "Không có"}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {formatCurrency(order.total_amount || order.total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatDateDisplay(order.created_at || order.date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-gray-500 font-bold"
                  >
                    Không có đơn hàng nào gần đây
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
