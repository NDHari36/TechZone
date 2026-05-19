import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import orderApi from "../api/orderApi";
import productApi from "../api/productApi";
import { Package, Ticket } from "lucide-react";

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
      toast.success("Hủy đơn hàng thành công!"); // Sửa ở đây
      await fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể hủy đơn hàng."); // Sửa ở đây
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
    });
    setReviewForm({ rating: 5, comment: "" });
    setOpenReview(true);
  };

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang chuẩn bị hàng";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
      case "completed":
        return "Đã giao thành công";
      case "cancelled":
        return "Đã hủy";
      default:
        return status || "—";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Lỗi: {error}
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Không tìm thấy đơn hàng.
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-24">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 80,
          right: 20,
        }}
      />{" "}
      <div className="mx-auto max-w-3xl px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors font-bold flex items-center gap-2"
        >
          ← Quay lại danh sách
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg shadow-gray-200/50">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
            <div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">
                Mã đơn hàng
              </div>
              <div className="font-black text-2xl text-gray-900">
                {order.code || `#${order.id || order.orderId}`}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Ngày đặt: {new Date(order.created_at).toLocaleString("vi-VN")}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">
                Trạng thái
              </div>
              <div
                className={`inline-block px-4 py-2 rounded-xl font-bold text-sm ${
                  order.status === "cancelled"
                    ? "bg-red-50 text-red-600"
                    : order.status === "completed" ||
                        order.status === "delivered"
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
                }`}
              >
                {translateStatus(order.status || order.orderStatus)}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-black text-lg text-gray-900 mb-4">
              Sản phẩm đã mua
            </h3>
            {(order.items || order.orderItems || []).map((it, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden p-2">
                  {it.productImage || it.image_url ? (
                    <img
                      src={it.productImage || it.image_url}
                      className="w-full h-full object-contain"
                      alt=""
                    />
                  ) : (
                    <Package size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="font-bold text-gray-900 line-clamp-2">
                    {it.productName}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Phân loại: {it.sku || "Mặc định"}
                  </div>
                </div>
                <div className="text-right flex flex-col justify-center items-end gap-2">
                  <div>
                    <div className="font-bold text-gray-900">
                      {formatVND(it.price)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      SL: x{it.quantity}
                    </div>
                  </div>
                  {(order.status?.toLowerCase() === "completed" ||
                    order.status?.toLowerCase() === "delivered") &&
                    !it.hasReviewed && (
                      <button
                        onClick={() => handleOpenReview(it)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                      >
                        Đánh giá
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
            <div>
              <h3 className="font-black text-lg text-gray-900 mb-4">
                Thông tin nhận hàng
              </h3>
              {order.receiver_name || order.address ? (
                <div className="bg-gray-50 p-5 rounded-xl space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="text-gray-500">Người nhận:</span>{" "}
                    <strong className="text-gray-900">
                      {order.receiver_name}
                    </strong>
                  </p>
                  <p>
                    <span className="text-gray-500">Điện thoại:</span>{" "}
                    <strong className="text-gray-900">
                      {order.receiver_phone}
                    </strong>
                  </p>
                  <p className="pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-500 block mb-1">
                      Địa chỉ giao hàng:
                    </span>
                    <strong className="text-gray-900 leading-relaxed">
                      {order.ship_line1}
                      {order.ship_ward && `, ${order.ship_ward}`}
                      {order.ship_district && `, ${order.ship_district}`}
                      {order.ship_city && `, ${order.ship_city}`}
                    </strong>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Không có thông tin địa chỉ.
                </p>
              )}
            </div>

            <div>
              <h3 className="font-black text-lg text-gray-900 mb-4">
                Chi tiết thanh toán
              </h3>
              <div className="bg-gray-50 p-5 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Tạm tính</span>
                  <span>{formatVND(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Phí vận chuyển</span>
                  <span>{formatVND(order.shipping_fee || 0)}</span>
                </div>

                {order.discount_applied > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Ticket size={16} /> Giảm giá{" "}
                      {order.coupon_code && `(${order.coupon_code})`}
                    </span>
                    <span>-{formatVND(order.discount_applied)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
                  <span className="font-black text-gray-900 uppercase">
                    Tổng cộng
                  </span>
                  <span className="font-black text-2xl text-red-600">
                    {formatVND(order.total || order.total_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.status === "pending" && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full md:w-auto px-8 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
              >
                {cancelling ? "Đang xử lý..." : "Hủy đơn hàng này"}
              </button>
              <p className="text-xs text-gray-500 mt-3">
                * Bạn chỉ có thể hủy đơn khi đơn hàng đang ở trạng thái{" "}
                <strong>Chờ xử lý</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
      {openReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="font-bold text-lg mb-4">Đánh giá sản phẩm</h2>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                  className={`cursor-pointer text-3xl transition-colors ${
                    reviewForm.rating >= star
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-gray-900 outline-none resize-none"
              rows={4}
              placeholder="Mời bạn chia sẻ cảm nhận về sản phẩm..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((p) => ({ ...p, comment: e.target.value }))
              }
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenReview(false)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                disabled={isSubmittingReview}
                onClick={async () => {
                  try {
                    setIsSubmittingReview(true);

                    if (!selectedProduct?.productId) {
                      toast.error("Lỗi: Không tìm thấy mã sản phẩm!"); // 1. Sửa lỗi ID
                      return;
                    }

                    const payload = {
                      productId: Number(selectedProduct.productId),
                      orderId: Number(selectedProduct.orderId),
                      rating: Number(reviewForm.rating),
                      comment: reviewForm.comment,
                    };

                    await productApi.addReview(payload);

                    toast.success("Đánh giá sản phẩm thành công!"); // 2. Sửa thành công
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
                            Number(itemId) === Number(selectedProduct.productId)
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
                    toast.error("Lỗi: " + msg); // 3. Sửa thông báo catch lỗi
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
                className="bg-gray-900 text-white px-5 py-2 font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OrderDetail;
