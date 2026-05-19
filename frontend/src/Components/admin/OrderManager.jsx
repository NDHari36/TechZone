import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  ShoppingCart,
  Pencil,
  X,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShoppingBag,
  CreditCard,
  Ticket,
} from "lucide-react";
import orderApi from "../../api/orderApi";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchOrderCode, setSearchOrderCode] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [form, setForm] = useState({
    status: "",
  });

  const load = async () => {
    try {
      const res = await orderApi.getAll();

      const data = res.data || res;
      let orderList = Array.isArray(data)
        ? data
        : data.result?.content ||
          data.result ||
          data.content ||
          data.data ||
          [];

      setOrders(orderList);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    }
  };
  const filteredOrders = orders.filter((order) => {
    const matchStatus =
      statusFilter === "all"
        ? true
        : order.status?.toLowerCase() === statusFilter;

    const orderCode = order.code || `DH${String(order.id).padStart(6, "0")}`;

    const matchSearch = searchOrderCode
      ? orderCode.toLowerCase().includes(searchOrderCode.toLowerCase())
      : true;

    return matchStatus && matchSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return sortOrder === "asc"
      ? parseInt(a.id) - parseInt(b.id)
      : parseInt(b.id) - parseInt(a.id);
  });
  const handleSortId = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openModalForEdit = (order, e) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setForm({
      status: order.status || "pending",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setForm({ status: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderApi.updateStatus(selectedOrder.id, { status: form.status });
      toast.success("Cập nhật trạng thái thành công!");
      closeModal();
      load();
      if (expandedRowId === selectedOrder.id) {
        handleToggleExpand(selectedOrder, true);
      }
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleExpand = async (order, forceReload = false) => {
    if (expandedRowId === order.id && !forceReload) {
      setExpandedRowId(null);
      setExpandedDetails(null);
      return;
    }

    setExpandedRowId(order.id);
    setIsLoadingDetails(true);

    try {
      const res = await orderApi.getByIdAdmin(order.id);
      const details = res.result || res.data || {};

      if (details && Array.isArray(details.items)) {
        details.items = details.items
          .filter((i) => i)
          .map((item) => ({
            ...item,
            productName:
              item.productName || item.product_name_snapshot || "Sản phẩm",
          }));
      } else {
        details.items = [];
      }

      setExpandedDetails(details);
    } catch (err) {
      console.error("Lỗi tải chi tiết đơn hàng:", err);
      setExpandedDetails({});
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-bold flex items-center justify-center gap-1 w-max mx-auto bg-yellow-100 text-yellow-700">
            <Clock size={14} /> Chờ xử lý
          </span>
        );
      case "processing":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-bold flex items-center justify-center gap-1 w-max mx-auto bg-blue-100 text-blue-700">
            <Package size={14} /> Đang chuẩn bị
          </span>
        );
      case "shipping":
      case "shipped":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-bold flex items-center justify-center gap-1 w-max mx-auto bg-indigo-100 text-indigo-700">
            <Truck size={14} /> Đang giao
          </span>
        );
      case "completed":
      case "delivered":
      case "success":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-bold flex items-center justify-center gap-1 w-max mx-auto bg-green-100 text-green-700">
            <CheckCircle size={14} /> Đã giao
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-bold flex items-center justify-center gap-1 w-max mx-auto bg-red-100 text-red-700">
            <XCircle size={14} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-bold flex items-center justify-center gap-1 w-max mx-auto bg-gray-100 text-gray-700">
            {status || "Không rõ"}
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 80,
          right: 20,
        }}
      />{" "}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-gray-900" />
            <h1 className="text-2xl font-black uppercase text-gray-900">
              Quản lý đơn hàng
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Tìm mã đơn hàng..."
              value={searchOrderCode}
              onChange={(e) => setSearchOrderCode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl bg-white outline-none focus:ring-1 focus:ring-gray-900"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl bg-white outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang chuẩn bị</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 w-10"></th>
                  <th
                    onClick={handleSortId}
                    className="p-4 font-bold text-center cursor-pointer select-none"
                  >
                    ID {sortOrder === "asc" ? "↑" : "↓"}
                  </th>

                  <th className="p-4 font-bold text-center">Mã đơn hàng</th>
                  <th className="p-4 font-bold">Khách hàng</th>
                  <th className="p-4 font-bold">Ngày đặt</th>
                  <th className="p-4 font-bold">Tổng tiền</th>
                  <th className="p-4 font-bold text-center">Trạng thái</th>
                  <th className="p-4 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedOrders.length > 0 ? (
                  sortedOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        onClick={() => handleToggleExpand(order)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          expandedRowId === order.id ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="p-4 text-gray-400">
                          {expandedRowId === order.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-500 font-bold">
                          {order.id}
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-900 font-bold text-sm">
                            {order.code ||
                              `DH${String(order.id).padStart(6, "0")}`}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900">
                            {order.full_name ||
                              order.user?.full_name ||
                              "Khách hàng ẩn danh"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.phone || order.user?.phone || "Chưa có SĐT"}
                          </div>
                        </td>
                        <td className="p-4 text-gray-700">
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="p-4 text-red-600 font-bold">
                          {Number(
                            order.total_amount || order.total_price || 0,
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {order.status?.toLowerCase() !== "completed" &&
                            order.status?.toLowerCase() !== "cancelled" ? (
                              <button
                                onClick={(e) => openModalForEdit(order, e)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Cập nhật trạng thái"
                              >
                                <Pencil size={18} />
                              </button>
                            ) : (
                              <span className="text-gray-400 font-medium select-none">
                                ---
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {expandedRowId === order.id && (
                        <tr>
                          <td
                            colSpan="8"
                            className="p-0 border-b-2 border-gray-200"
                          >
                            <div className="bg-gray-50/50 p-6 shadow-inner">
                              {isLoadingDetails ? (
                                <div className="text-center py-6 text-gray-400 animate-pulse">
                                  Đang tải chi tiết đơn hàng...
                                </div>
                              ) : expandedDetails ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                    <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                                      <MapPin
                                        size={18}
                                        className="text-red-500"
                                      />
                                      Thông tin giao hàng
                                    </h4>
                                    <div className="text-sm space-y-3">
                                      <p className="flex justify-between">
                                        <span className="text-gray-500">
                                          Người nhận:
                                        </span>
                                        <span className="font-bold text-gray-900">
                                          {expandedDetails.receiver_name ||
                                            expandedDetails.full_name ||
                                            "---"}
                                        </span>
                                      </p>
                                      <p className="flex justify-between">
                                        <span className="text-gray-500">
                                          SĐT:
                                        </span>
                                        <span className="font-bold text-gray-900">
                                          {expandedDetails.receiver_phone ||
                                            expandedDetails.phone ||
                                            "---"}
                                        </span>
                                      </p>
                                      <div className="pt-2 border-t border-gray-50">
                                        <span className="text-gray-500 block mb-1">
                                          Địa chỉ chi tiết:
                                        </span>
                                        <p className="text-gray-900 font-medium leading-relaxed">
                                          {expandedDetails.ship_line1 ||
                                            expandedDetails.address ||
                                            "Chưa có địa chỉ chi tiết"}
                                          {expandedDetails.ship_ward &&
                                            `, ${expandedDetails.ship_ward}`}
                                          {expandedDetails.ship_district &&
                                            `, ${expandedDetails.ship_district}`}
                                          {expandedDetails.ship_city &&
                                            `, ${expandedDetails.ship_city}`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
                                    <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                      <ShoppingBag
                                        size={18}
                                        className="text-blue-500"
                                      />
                                      Sản phẩm đã đặt
                                    </h4>

                                    <div className="space-y-4 flex-1 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                                      {expandedDetails.items &&
                                      expandedDetails.items.length > 0 ? (
                                        expandedDetails.items.map(
                                          (item, idx) => (
                                            <div
                                              key={idx}
                                              className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 p-1">
                                                  {item.productImage ||
                                                  item.image_url ? (
                                                    <img
                                                      src={
                                                        item.productImage ||
                                                        item.image_url
                                                      }
                                                      alt="img"
                                                      className="w-full h-full object-contain"
                                                    />
                                                  ) : (
                                                    <Package
                                                      size={24}
                                                      className="text-gray-400"
                                                    />
                                                  )}
                                                </div>
                                                <div>
                                                  <p className="font-bold text-gray-900 text-sm line-clamp-1">
                                                    {item.productName ||
                                                      "Sản phẩm"}
                                                  </p>
                                                  <p className="text-xs text-gray-500 mt-0.5">
                                                    Phân loại:{" "}
                                                    {item.sku || "Mặc định"}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-bold text-gray-900 text-sm">
                                                  {Number(
                                                    item.price,
                                                  ).toLocaleString(
                                                    "vi-VN",
                                                  )}{" "}
                                                  ₫
                                                </p>
                                                <p className="text-xs text-blue-600 font-bold mt-0.5">
                                                  Tổng:{" "}
                                                  {Number(
                                                    item.price * item.quantity,
                                                  ).toLocaleString(
                                                    "vi-VN",
                                                  )}{" "}
                                                  ₫
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                  SL: x{item.quantity}
                                                </p>
                                              </div>
                                            </div>
                                          ),
                                        )
                                      ) : (
                                        <div className="text-sm text-gray-400 italic text-center py-4">
                                          Không tìm thấy dữ liệu chi tiết sản
                                          phẩm.
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-xl space-y-2">
                                      <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>Tạm tính:</span>
                                        <span>
                                          {Number(
                                            expandedDetails.subtotal || 0,
                                          ).toLocaleString("vi-VN")}{" "}
                                          ₫
                                        </span>
                                      </div>

                                      <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>Phí vận chuyển:</span>
                                        <span>
                                          {Number(
                                            expandedDetails.shipping_fee || 0,
                                          ).toLocaleString("vi-VN")}{" "}
                                          ₫
                                        </span>
                                      </div>

                                      {expandedDetails.discount_applied > 0 && (
                                        <div className="flex justify-between text-sm text-green-600 font-bold">
                                          <span className="flex items-center gap-1">
                                            <Ticket size={16} /> Mã giảm giá (
                                            {expandedDetails.coupon_code}):
                                          </span>
                                          <span>
                                            -
                                            {Number(
                                              expandedDetails.discount_applied,
                                            ).toLocaleString("vi-VN")}{" "}
                                            ₫
                                          </span>
                                        </div>
                                      )}

                                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                        <div className="flex items-center gap-2 text-gray-800 font-bold">
                                          <CreditCard size={20} /> Tổng thanh
                                          toán:
                                        </div>
                                        <div className="text-xl font-black text-red-600">
                                          {Number(
                                            expandedDetails.total ||
                                              expandedDetails.total_amount ||
                                              expandedDetails.total_price ||
                                              0,
                                          ).toLocaleString("vi-VN")}{" "}
                                          ₫
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-red-500 py-4">
                                  Không tải được dữ liệu.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-gray-500">
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900 uppercase">
                Cập nhật Đơn hàng #{selectedOrder.id}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">
                  Khách hàng:{" "}
                  <span className="font-bold text-gray-900">
                    {selectedOrder.full_name ||
                      selectedOrder.user?.full_name ||
                      "Ẩn danh"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Tổng tiền:{" "}
                  <span className="font-bold text-red-600">
                    {Number(
                      selectedOrder.total || selectedOrder.total_amount || 0,
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </span>
                </div>
              </div>

              <form
                id="orderForm"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <label className="block text-sm font-bold text-gray-700">
                  Trạng thái đơn hàng
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang chuẩn bị hàng</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Đã giao hàng (Hoàn thành)</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="orderForm"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-md"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
