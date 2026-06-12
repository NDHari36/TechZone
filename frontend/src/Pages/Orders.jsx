import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import orderApi from "../api/orderApi";
import productApi from "../api/productApi";
import {
  Package,
  ShoppingBag,
  Loader2,
  ChevronRight,
  Star,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
} from "lucide-react";

const formatVND = (value) => {
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(value)) + " đ";
  } catch {
    return (value || 0) + " đ";
  }
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderApi.getMyOrders();
        const rawData = res.result || res || [];

        if (!Array.isArray(rawData)) {
          setOrders([]);
          return;
        }

        const formatted = rawData.map((order) => ({
          id: order.id,
          code: order.code,
          status: order.status,
          total: order.total,
          created_at: order.created_at,
          items: order.items || [],
        }));

        formatted.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );
        setOrders(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenReview = (item, currentOrderId) => {
    if (!item) return;
    setSelectedProduct({
      productId:
        item.product_id ||
        item.productId ||
        item.variant_id ||
        item.variantId ||
        item.id,
      orderId: currentOrderId,
      productName: item.productName || item.name || item.title || "Sản phẩm",
      image:
        item.productImage ||
        item.image ||
        item.image_url ||
        "https://placehold.co/96x96",
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
          text: "Đang chuẩn bị",
          color: "text-blue-700 bg-blue-50 border-blue-200",
          icon: Package,
        };
      case "shipping":
        return {
          text: "Đang giao",
          color: "text-indigo-700 bg-indigo-50 border-indigo-200",
          icon: Truck,
        };
      case "completed":
        return {
          text: "Đã hoàn thành",
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
        <div className="mb-10 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase flex items-center gap-3">
            <ShoppingBag
              className="h-10 w-10 text-gray-900"
              strokeWidth={2.5}
            />
            Đơn hàng của tôi
          </h1>
          <div className="h-1.5 w-24 bg-gray-900 rounded-full"></div>
        </div>

        <div className="space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeInUp">
              <Loader2 className="h-12 w-12 text-gray-900 animate-spin mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                Đang tải dữ liệu...
              </p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="bg-white p-16 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-gray-200 border-dashed animate-fadeInUp">
              <Package
                className="h-20 w-20 text-gray-300 mb-4"
                strokeWidth={1.5}
              />
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">
                Chưa có đơn hàng
              </h3>
              <p className="text-gray-500 font-medium max-w-sm">
                Bạn chưa thực hiện bất kỳ đơn hàng nào. Hãy khám phá các sản
                phẩm của chúng tôi!
              </p>
              <button
                onClick={() => navigate("/products")}
                className="mt-6 px-8 py-3 bg-gray-900 text-white font-black uppercase rounded-xl hover:bg-black transition-transform active:scale-95 shadow-[4px_4px_0px_0px_rgba(209,213,219,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
              >
                Mua sắm ngay
              </button>
            </div>
          )}

          {!loading &&
            orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] overflow-hidden animate-fadeInUp transition-transform hover:-translate-y-1 duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Header */}
                  <div className="p-5 sm:p-6 border-b-2 border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-lg text-gray-900">
                          Mã: #{order.code || order.id}
                        </span>
                        <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-md uppercase">
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-black uppercase tracking-wide w-fit ${statusConfig.color}`}
                    >
                      <StatusIcon size={16} strokeWidth={3} />
                      {statusConfig.text}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-5 sm:p-6 space-y-5">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row gap-5 items-start sm:items-center group"
                      >
                        <div className="w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden relative">
                          <img
                            src={
                              it.productImage ||
                              it.image ||
                              it.image_url ||
                              "https://placehold.co/96x96"
                            }
                            alt={it.productName || it.name || it.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-tl-lg">
                            x{it.quantity}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-gray-900 text-lg sm:text-base leading-tight mb-2 truncate">
                            {it.productName ||
                              it.name ||
                              it.title ||
                              "Sản phẩm"}
                          </h4>
                          <div className="font-black text-red-600 text-lg">
                            {formatVND(it.price || 0)}
                          </div>
                        </div>

                        <div className="w-full sm:w-auto flex justify-end">
                          {order.status?.toLowerCase() === "completed" &&
                            !it.hasReviewed && (
                              <button
                                onClick={() =>
                                  handleOpenReview(
                                    it,
                                    order.id || order.orderId || id,
                                  )
                                }
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-black text-gray-900 bg-white border-2 border-gray-900 rounded-xl uppercase flex items-center justify-center gap-2 transition-all hover:bg-gray-900 hover:text-white active:scale-95"
                              >
                                <Star
                                  size={16}
                                  className={
                                    reviewForm.rating ? "fill-current" : ""
                                  }
                                />
                                Đánh giá
                              </button>
                            )}
                          {order.status?.toLowerCase() === "completed" &&
                            it.hasReviewed && (
                              <span className="px-4 py-2 text-sm font-bold text-gray-400 bg-gray-100 rounded-xl flex items-center gap-1">
                                <CheckCircle2 size={16} /> Đã đánh giá
                              </span>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-5 sm:p-6 border-t-2 border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-sm font-bold text-gray-500 uppercase">
                        Tổng thanh toán:
                      </span>
                      <span className="text-2xl font-black text-red-600">
                        {formatVND(order.total)}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-bold uppercase tracking-wide rounded-xl shadow-md hover:shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95 active:shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      Chi tiết đơn hàng <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
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
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.productName}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
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
                          toast.error("Mã sản phẩm không hợp lệ");
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
                        setTimeout(() => {
                          window.location.reload();
                        }, 1000);
                      } catch (error) {
                        console.error("Chi tiết lỗi:", error);
                        const msg =
                          error.response?.data?.message ||
                          error.message ||
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
      </div>
    </main>
  );
}

export default Orders;
