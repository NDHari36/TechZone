import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import orderApi from "../api/orderApi";
import productApi from "../api/productApi";

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
    });
    setReviewForm({ rating: 5, comment: "" });
    setOpenReview(true);
  };

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang chuẩn bị";
      case "shipping":
        return "Đang giao";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status || "—";
    }
  };

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
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="text-3xl font-black mb-10">Đơn hàng của tôi</h1>

        <div className="space-y-6">
          {loading && (
            <div className="text-center py-10 text-gray-500">Đang tải...</div>
          )}

          {!loading && orders.length === 0 && (
            <div className="bg-white p-10 text-center rounded-xl">
              Không có đơn hàng
            </div>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border shadow-sm"
            >
              <div className="p-4 border-b flex justify-between">
                <div>
                  <div className="font-bold">{order.code}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <div className="font-bold text-blue-600">
                  {translateStatus(order.status)}
                </div>
              </div>

              <div className="p-4 space-y-2">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={
                          it.productImage ||
                          it.image ||
                          it.image_url ||
                          "https://placehold.co/96x96"
                        }
                        className="w-full h-full object-contain border rounded"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <div className="font-semibold text-gray-900">
                        {it.productName || it.name || it.title || "Sản phẩm"}
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        Số lượng: x{it.quantity}
                      </div>

                      <div className="font-bold text-red-600 mt-1">
                        {formatVND(it.price || 0)}
                      </div>
                    </div>

                    <div className="w-[120px] flex justify-end items-center">
                      {order.status?.toLowerCase() === "completed" &&
                        !it.hasReviewed && (
                          <button
                            onClick={() =>
                              handleOpenReview(
                                it,
                                order.id || order.orderId || id,
                              )
                            }
                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                          >
                            Đánh giá
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t flex justify-between">
                <div className="text-red-600 font-black">
                  Tổng: {formatVND(order.total)}
                </div>

                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="px-4 py-2 border rounded"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {openReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
              <h2 className="font-bold mb-4">Đánh giá sản phẩm</h2>

              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() =>
                      setReviewForm((p) => ({
                        ...p,
                        rating: star,
                      }))
                    }
                    className={`cursor-pointer text-2xl ${
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
                className="w-full border p-2 mb-4"
                rows={4}
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((p) => ({
                    ...p,
                    comment: e.target.value,
                  }))
                }
              />

              <div className="flex justify-end gap-2">
                <button onClick={() => setOpenReview(false)}>Hủy</button>

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
                      console.error("Data phản hồi:", error.response?.data);

                      const msg =
                        error.response?.data?.message ||
                        error.message ||
                        "Có lỗi xảy ra khi gửi đánh giá";
                      toast.error("Lỗi: " + msg);
                    } finally {
                      setIsSubmittingReview(false);
                    }
                  }}
                  className="bg-black text-white px-4 py-2"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;
