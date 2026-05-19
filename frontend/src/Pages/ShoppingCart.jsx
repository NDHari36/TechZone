import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart as ShoppingCartIcon,
  Loader,
} from "lucide-react";
import cartApi from "../api/cartApi";

const formatVND = (value) => {
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(value)) + " đ";
  } catch (e) {
    return value + " đ";
  }
};

function ShoppingCart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const [selectedItems, setSelectedItems] = useState(new Set());

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCartData(data.result);
      setError(null);
    } catch (err) {
      setError(err.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (variantId, newQuantity, stockLimit) => {
    let qty = parseInt(newQuantity);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > stockLimit) qty = stockLimit;

    setUpdatingItems((prev) => new Set([...prev, variantId]));
    try {
      const data = await cartApi.updateQuantity(variantId, qty);
      setCartData(data.result);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const s = new Set(prev);
        s.delete(variantId);
        return s;
      });
    }
  };

  const handleRemoveItem = async (variantId) => {
    setUpdatingItems((prev) => new Set([...prev, variantId]));
    try {
      const data = await cartApi.removeItem(variantId);
      setCartData(data.result);
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const s = new Set(prev);
        s.delete(variantId);
        return s;
      });
    }
  };
  const handleToggleSelection = (variantId) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
      return next;
    });
  };

  const items = cartData?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const vId = item.variantId || item.id;
    return selectedItems.has(vId) ? sum + item.price * item.quantity : sum;
  }, 0);

  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleGoToPayment = () => {
    const productsToPay = items.filter((item) =>
      selectedItems.has(item.variantId || item.id),
    );
    navigate("/pay", { state: { selectedItems: productsToPay } });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase">
          Giỏ hàng của bạn
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items
              .sort((a, b) => a.id - b.id)
              .map((item) => {
                const vId = item.variantId || item.id;
                const isSelected = selectedItems.has(vId);
                const stock = item.stock || 0;

                return (
                  <div
                    key={vId}
                    className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer 
                    ${isSelected ? "bg-blue-50/50 border-blue-200" : "bg-gray-50 border-gray-200 hover:border-gray-400 hover:shadow-lg"}`}
                    onClick={() => handleToggleSelection(vId)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelection(vId)}
                      className="w-5 h-5 rounded cursor-pointer mt-2 accent-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <img
                      src={`https://techzone-api-wkxx.onrender.com/api/cart/images/${item.productId}`}
                      className="w-24 h-24 bg-white border border-gray-200 rounded-lg object-contain p-1 flex-shrink-0"
                      alt=""
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {item.color} | {item.storage}
                      </p>
                      <p
                        className={`text-xs font-bold mb-2 ${item.quantity >= stock ? "text-red-500" : "text-blue-600"}`}
                      >
                        Tồn kho: {item.quantity} / {stock}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatVND(item.price)}
                      </p>
                    </div>

                    <div
                      className="flex flex-col items-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() =>
                            handleQuantityChange(vId, item.quantity - 1, stock)
                          }
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="text"
                          value={updatingItems.has(vId) ? "" : item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(vId, e.target.value, stock)
                          }
                          className="w-10 text-center font-semibold text-sm outline-none border-x border-gray-300"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(vId, item.quantity + 1, stock)
                          }
                          disabled={item.quantity >= stock}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-20"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/Details/${item.productId}`)}
                          className="px-4 py-2 border border-gray-300 bg-white rounded-lg font-semibold text-xs hover:bg-gray-50"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleRemoveItem(vId)}
                          className="p-2 border border-gray-300 text-gray-400 hover:text-red-600 bg-white rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase">
                Tóm tắt đơn hàng
              </h2>
              <div className="space-y-4 mb-6 border-b pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({selectedItems.size} món):</span>
                  <span className="font-bold text-gray-900">
                    {formatVND(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Vận chuyển:</span>
                  <span className="font-bold text-green-600">
                    {shipping === 0 ? "Miễn phí" : formatVND(shipping)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-2xl font-black text-gray-900 mb-6">
                <span>Tổng:</span>
                <span>{formatVND(total)}</span>
              </div>
              <button
                onClick={handleGoToPayment}
                disabled={selectedItems.size === 0}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition uppercase disabled:bg-gray-300"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
export default ShoppingCart;
