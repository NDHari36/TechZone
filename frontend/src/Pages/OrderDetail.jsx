import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import orderApi from "../api/orderApi";
import productApi from "../api/productApi";
import {
  Package,
  Ticket,
  ArrowLeft,
  Loader2,
  Star,
  X,
  MapPin,
  Phone,
  User,
  Receipt,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";

const formatVND = (value) => {
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(value)) + " đ";
  } catch (e) {
    return value + " đ";
  }
};

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const navigate = useNavigate();

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrderDetail(id);
      const rawOrder = data.result || data;

      if (rawOrder) {
        rawOrder.items = (rawOrder.items || rawOrder.orderItems || []).map(
          (it) => ({
            ...it,
            hasReviewed: !!(it.hasReviewed || it.has_reviewed),
          }),
        );
      }
      console.log("Chi tiết đơn hàng đã tải:", rawOrder);
      setOrder(rawOrder);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải chi tiết đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    try {
      await orderApi.cancelOrder(id);
      toast.success("Hủy đơn hàng thành công!");
      await fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReview = (item) => {
    if (!item) return;
    setSelectedProduct({
      productId:
        item.productId ||
        item.product_id ||
        item.variantId ||
        item.variant_id ||
        item.id,
      orderId: order.id || id,
      productName: item.productName || item.name || "Sản phẩm",
      image: item.productImage || item.image_url || item.image || null,
    });
    setReviewForm({ rating: 5, comment: "" });
    setOpenReview(true);
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          text: "Chờ xử lý",
          color: "text-amber-700 bg-amber-50 border-amber-200",
          icon: Clock,
        };
      case "processing":
        return {
          text: "Đang chuẩn bị hàng",
          color: "text-blue-700 bg-blue-50 border-blue-200",
          icon: Package,
        };
      case "shipped":
        return {
          text: "Đang giao hàng",
          color: "text-indigo-700 bg-indigo-50 border-indigo-200",
          icon: Truck,
        };
      case "delivered":
      case "completed":
        return {
          text: "Đã giao thành công",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          icon: CheckCircle2,
        };
      case "cancelled":
        return {
          text: "Đã hủy",
          color: "text-red-700 bg-red-50 border-red-200",
          icon: XCircle,
        };
      default:
        return {
          text: status || "—",
          color: "text-gray-700 bg-gray-50 border-gray-200",
          icon: Package,
        };
    }
  };

  if (loading)
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-20">
        <Loader2 className="h-12 w-12 text-gray-900 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">
          Đang tải chi tiết...
        </p>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-20 px-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">
          Đã xảy ra lỗi
        </h2>
        <p className="text-gray-600 font-medium mb-6 max-w-md">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl uppercase flex items-center gap-2 hover:bg-black transition-transform active:scale-95 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
      </main>
    );

  if (!order)
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-20">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-lg">
          Không tìm thấy đơn hàng
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-gray-900 text-white font-black rounded-xl uppercase flex items-center gap-2 hover:bg-black transition-transform active:scale-95 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]"
        >
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>
      </main>
    );

  const statusConfig = getStatusConfig(order.status || order.orderStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-24 text-gray-900">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{ top: 80, right: 20 }}
        toastOptions={{
          className:
            "border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] rounded-xl font-bold",
        }}
      />
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-6 animate-fadeInUp">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-black text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 uppercase tracking-wider bg-white py-2 px-4 rounded-lg border-2 border-transparent hover:border-gray-200 w-fit"
          >
            <ArrowLeft size={16} strokeWidth={3} /> Quay lại danh sách
          </button>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] overflow-hidden animate-fadeInUp">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b-2 border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Receipt size={14} /> Chi tiết đơn hàng
              </div>
              <div className="font-black text-3xl sm:text-4xl text-gray-900 mb-2 uppercase tracking-tight">
                {order.code || `#${order.id || order.orderId}`}
              </div>
              <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
                <Clock size={14} />
                Ngày đặt: {new Date(order.created_at).toLocaleString("vi-VN")}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Trạng thái hiện tại
              </div>
              <div
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-black uppercase tracking-wide ${statusConfig.color}`}
              >
                <StatusIcon size={18} strokeWidth={2.5} />
                {statusConfig.text}
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="p-6 sm:p-8">
            <h3 className="font-black text-xl text-gray-900 mb-6 uppercase flex items-center gap-2 border-b-2 border-gray-100 pb-4">
              <Package className="text-gray-900" />
              Sản phẩm đã mua
            </h3>

            <div className="space-y-4">
              {(order.items || order.orderItems || []).map((it, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-xl border-2 border-gray-100 hover:border-gray-900 transition-colors group"
                >
                  <div className="w-24 h-24 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    {it.productImage || it.image_url || it.image ? (
                      <img
                        src={it.productImage || it.image_url || it.image}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        alt={it.productName}
                      />
                    ) : (
                      <Package size={32} className="text-gray-300" />
                    )}
                    <div className="absolute top-0 left-0 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-br-lg">
                      x{it.quantity}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-black text-lg text-gray-900 line-clamp-2 leading-tight mb-1">
                      {it.productName}
                    </div>
                    {it.sku && (
                      <div className="text-sm font-bold text-gray-500 bg-gray-100 w-fit px-2 py-1 rounded-md mt-1">
                        Phân loại: {it.sku}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t-2 border-gray-100 sm:border-0">
                    <div className="text-right">
                      <div className="font-black text-xl text-red-600">
                        {formatVND(it.price)}
                      </div>
                    </div>
                    {(order.status?.toLowerCase() === "completed" ||
                      order.status?.toLowerCase() === "delivered") &&
                      !it.hasReviewed && (
                        <button
                          onClick={() => handleOpenReview(it)}
                          className="px-4 py-2 text-xs font-black text-gray-900 border-2 border-gray-900 bg-white rounded-lg uppercase hover:bg-gray-900 hover:text-white transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Star size={14} /> Đánh giá
                        </button>
                      )}
                    {(order.status?.toLowerCase() === "completed" ||
                      order.status?.toLowerCase() === "delivered") &&
                      it.hasReviewed && (
                        <span className="px-3 py-1.5 text-xs font-bold text-gray-400 bg-gray-100 rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={14} /> Đã đánh giá
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Payment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t-2 border-gray-100">
            {/* Delivery Info */}
            <div className="p-6 sm:p-8 border-b-2 md:border-b-0 md:border-r-2 border-gray-100 bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900 mb-5 uppercase flex items-center gap-2">
                <MapPin className="text-gray-900" size={20} />
                Thông tin nhận hàng
              </h3>

              {order.receiver_name || order.address ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600 mt-0.5">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">
                        Người nhận
                      </div>
                      <div className="font-black text-gray-900">
                        {order.receiver_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600 mt-0.5">
                      <Phone size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">
                        Số điện thoại
                      </div>
                      <div className="font-black text-gray-900">
                        {order.receiver_phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600 mt-0.5">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">
                        Địa chỉ giao hàng
                      </div>
                      <div className="font-bold text-gray-700 leading-relaxed text-sm">
                        {order.ship_line1}
                        {order.ship_ward && `, ${order.ship_ward}`}
                        {order.ship_district && `, ${order.ship_district}`}
                        {order.ship_city && `, ${order.ship_city}`}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border-2 border-gray-100 border-dashed flex flex-col items-center text-center justify-center h-full min-h-[160px]">
                  <MapPin className="text-gray-300 mb-2" size={24} />
                  <p className="text-gray-500 font-bold">
                    Không có thông tin địa chỉ
                  </p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="p-6 sm:p-8 bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-900 mb-5 uppercase flex items-center gap-2">
                <Receipt className="text-gray-900" size={20} />
                Chi tiết thanh toán
              </h3>

              <div className="bg-white p-5 sm:p-6 rounded-xl border-2 border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-gray-600 font-bold text-sm">
                  <span>Tổng tiền hàng</span>
                  <span className="text-gray-900">
                    {formatVND(order.subtotal || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600 font-bold text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="text-gray-900">
                    {formatVND(order.shipping_fee || 0)}
                  </span>
                </div>

                {order.discount_applied > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-black text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <span className="flex items-center gap-1.5 uppercase tracking-wide">
                      <Ticket size={16} /> Giảm giá
                      {order.coupon_code && (
                        <span className="text-xs bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-800 ml-1">
                          {order.coupon_code}
                        </span>
                      )}
                    </span>
                    <span>-{formatVND(order.discount_applied)}</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-100 pt-4 mt-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-900 uppercase tracking-wide">
                      Tổng thanh toán
                    </span>
                    <span className="font-black text-2xl sm:text-3xl text-red-600">
                      {formatVND(order.total || order.total_amount || 0)}
                    </span>
                  </div>
                  <div className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    (Đã bao gồm VAT nếu có)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer for Pending Orders */}
          {order.status === "pending" && (
            <div className="p-6 sm:p-8 bg-white border-t-2 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                Đơn hàng đang chờ xác nhận. Bạn có thể hủy nếu đổi ý.
              </p>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full md:w-auto px-8 py-3.5 bg-red-50 border-2 border-red-200 text-red-600 font-black rounded-xl uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm flex justify-center items-center gap-2"
              >
                {cancelling ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <XCircle size={18} />
                )}
                {cancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {openReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeInUp"
          style={{ animationDuration: "0.2s" }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn border-2 border-gray-900">
            <div className="p-5 border-b-2 border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-xl text-gray-900 uppercase">
                Đánh giá sản phẩm
              </h2>
              <button
                onClick={() => setOpenReview(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="p-6">
              {selectedProduct && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.productName}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <Package size={24} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 line-clamp-2">
                      {selectedProduct.productName}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6 flex flex-col items-center">
                <p className="text-sm font-bold text-gray-500 uppercase mb-3">
                  Chất lượng sản phẩm
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewForm((p) => ({ ...p, rating: star }))
                      }
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={40}
                        strokeWidth={1.5}
                        className={`${
                          reviewForm.rating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-transparent text-gray-300"
                        } transition-colors duration-200`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-gray-500 uppercase">
                  Nhận xét của bạn
                </label>
                <textarea
                  className="w-full p-4 border-2 border-gray-300 rounded-xl bg-gray-50 outline-none font-medium text-gray-900 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all resize-none"
                  rows={4}
                  placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm nhé..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((p) => ({ ...p, comment: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenReview(false)}
                  className="flex-1 py-4 font-black text-gray-900 bg-white border-2 border-gray-900 rounded-xl uppercase hover:bg-gray-50 transition-colors active:scale-95"
                >
                  Hủy
                </button>
                <button
                  disabled={isSubmittingReview}
                  onClick={async () => {
                    try {
                      setIsSubmittingReview(true);
                      if (!selectedProduct?.productId) {
                        toast.error("Lỗi: Không tìm thấy mã sản phẩm!");
                        return;
                      }
                      const payload = {
                        productId: Number(selectedProduct.productId),
                        orderId: Number(selectedProduct.orderId),
                        rating: Number(reviewForm.rating),
                        comment: reviewForm.comment,
                      };
                      await productApi.addReview(payload);
                      toast.success("Đánh giá sản phẩm thành công!");
                      setOpenReview(false);
                      setOrder((prevOrder) => {
                        if (!prevOrder) return prevOrder;
                        return {
                          ...prevOrder,
                          items: (
                            prevOrder.items ||
                            prevOrder.orderItems ||
                            []
                          ).map((item) => {
                            const itemId =
                              item.productId ||
                              item.product_id ||
                              item.variantId ||
                              item.variant_id ||
                              item.id;
                            if (
                              Number(itemId) ===
                              Number(selectedProduct.productId)
                            ) {
                              return { ...item, hasReviewed: true };
                            }
                            return item;
                          }),
                        };
                      });
                    } catch (error) {
                      console.error("Chi tiết lỗi:", error);
                      const msg =
                        error.response?.data?.message ||
                        "Có lỗi xảy ra khi gửi đánh giá";
                      toast.error("Lỗi: " + msg);
                    } finally {
                      setIsSubmittingReview(false);
                    }
                  }}
                  className="flex-1 py-4 font-black text-white bg-gray-900 rounded-xl uppercase flex items-center justify-center gap-2 hover:bg-black transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(209,213,219,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                >
                  {isSubmittingReview && (
                    <Loader2 className="animate-spin" size={20} />
                  )}
                  Gửi đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OrderDetail;
