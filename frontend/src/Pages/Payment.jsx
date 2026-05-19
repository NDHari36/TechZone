import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Lock,
  MapPin,
  Ticket,
  Package,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import userApi from "../api/userApi";
import orderApi from "../api/orderApi";
import couponApi from "../api/couponApi";

const formatVND = (value) => {
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(value)) + " đ";
  } catch (e) {
    return value + " đ";
  }
};

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedItems] = useState(location.state?.selectedItems || []);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        if (selectedItems.length === 0) {
          navigate("/cart");
          return;
        }

        const [addressRes, couponRes] = await Promise.all([
          userApi.getAddresses().catch(() => ({ result: [] })),
          couponApi.getAllCoupons().catch(() => ({ result: [] })),
        ]);

        const addrList = addressRes.result || [];
        setAddresses(addrList);

        const allCoupons = couponRes.result || [];
        const filteredCoupons = allCoupons.filter(
          (cp) => Number(cp.is_used) === 0,
        );
        setAvailableCoupons(filteredCoupons);

        const def = addrList.find((a) => a.is_default === 1) || addrList[0];
        if (def) setSelectedAddress(def.id);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [selectedItems, navigate]);

  const subtotal =
    selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shipping - discountAmount;

  const handleApplyCoupon = async (coupon) => {
    if (selectedCoupon?.id === coupon.id) {
      setSelectedCoupon(null);
      setDiscountAmount(0);
      return;
    }

    if (subtotal < coupon.min_order) {
      alert(`Đơn hàng tối thiểu ${formatVND(coupon.min_order)}`);
      return;
    }

    try {
      const res = await couponApi.applyCoupon({
        code: coupon.code,
        subtotal: subtotal,
      });

      const data = res.result || res.data || res;
      setDiscountAmount(data.discountAmount);
      setSelectedCoupon(coupon);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Không thể áp dụng mã này.";
      alert(errorMsg);
      setSelectedCoupon(null);
      setDiscountAmount(0);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc (*)");
      return;
    }

    try {
      await userApi.addAddress({
        full_name: newAddress.fullName,
        phone: newAddress.phone,
        line1: newAddress.address,
        ward: newAddress.ward,
        district: newAddress.district,
        city: newAddress.city,
        is_default: newAddress.isDefault ? 1 : 0,
      });

      const data = await userApi.getAddresses();
      setAddresses(data.result || []);
      setNewAddress({
        fullName: "",
        phone: "",
        address: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
      });
      setShowAddressForm(false);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert("Vui lòng chọn địa chỉ giao hàng");

    const body = {
      addressId: Number(selectedAddress),
      note: note || "",
      cartItemIds: selectedItems.map((i) => i.cart_item_id || i.id),
      couponId: selectedCoupon?.id || null,
    };

    try {
      await orderApi.createOrder(body);
      setOrderPlaced(true);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      alert("Lỗi đặt hàng: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
      </div>
    );

  if (orderPlaced)
    return (
      <main className="min-h-screen bg-white pb-20 pt-24 text-center space-y-6">
        <CheckCircle className="h-20 w-20 text-green-600 mx-auto animate-bounce" />
        <h1 className="text-4xl font-black text-gray-900 uppercase">
          Thành công!
        </h1>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/Category")}
            className="bg-gray-900 text-white font-bold py-4 px-8 rounded-xl shadow-lg"
          >
            Tiếp tục mua sắm
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="bg-gray-100 text-gray-900 font-bold py-4 px-8 rounded-xl border"
          >
            Xem đơn hàng
          </button>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-4xl font-black text-gray-900 mb-8 uppercase tracking-tight">
          Đặt Hàng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <Package className="h-6 w-6" />
                <h2 className="text-2xl font-black uppercase">
                  Sản phẩm đơn hàng
                </h2>
              </div>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <img
                      src={item.productImage || item.image_url}
                      className="w-20 h-20 bg-white rounded-2xl border p-2 object-contain"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 truncate uppercase text-sm">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 font-bold">
                        Số lượng: x{item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">
                        {formatVND(item.price)}
                      </p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase">
                        Tổng: {formatVND(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <MapPin className="h-6 w-6" />
                <h2 className="text-2xl font-black uppercase">
                  Địa chỉ nhận hàng
                </h2>
              </div>
              <div className="grid gap-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddress === addr.id ? "border-gray-900 bg-gray-50 ring-2 ring-gray-900/10" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <input
                      type="radio"
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1.5 h-4 w-4 accent-gray-900"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-black text-gray-900 uppercase text-sm">
                        {addr.full_name}
                      </p>
                      <p className="text-gray-600 font-medium text-sm">
                        {addr.line1}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {addr.ward}, {addr.district}, {addr.city}
                      </p>
                      <p className="text-gray-900 font-bold mt-2 text-sm">
                        {addr.phone}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl font-bold text-gray-400 hover:border-gray-900 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Thêm địa chỉ mới
              </button>

              {showAddressForm && (
                <div className="p-6 bg-white border-2 border-gray-900 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black uppercase text-lg">
                      Thông tin địa chỉ mới
                    </h3>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="text-gray-400 hover:text-black"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Họ và tên người nhận *"
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          fullName: e.target.value,
                        })
                      }
                      className="p-3 border rounded-xl outline-none focus:border-black"
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại *"
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      className="p-3 border rounded-xl outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ chi tiết (Số nhà, đường) *"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      className="col-span-2 p-3 border rounded-xl outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      placeholder="Phường / Xã"
                      value={newAddress.ward}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, ward: e.target.value })
                      }
                      className="p-3 border rounded-xl outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      placeholder="Quận / Huyện"
                      value={newAddress.district}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          district: e.target.value,
                        })
                      }
                      className="p-3 border rounded-xl outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      placeholder="Tỉnh / Thành phố"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="col-span-2 p-3 border rounded-xl outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="default-addr"
                      checked={newAddress.isDefault}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-black"
                    />
                    <label
                      htmlFor="default-addr"
                      className="text-sm font-bold text-gray-600 cursor-pointer"
                    >
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddAddress}
                      className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all"
                    >
                      Lưu địa chỉ
                    </button>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="px-6 bg-gray-100 font-bold rounded-xl hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                <Ticket className="h-6 w-6" />
                <h2 className="text-2xl font-black uppercase">
                  Ưu đãi dành cho bạn
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {availableCoupons.length > 0 ? (
                  availableCoupons.map((cp) => (
                    <div
                      key={cp.id}
                      onClick={() =>
                        subtotal >= cp.min_order && handleApplyCoupon(cp)
                      }
                      className={`min-w-[220px] p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedCoupon?.id === cp.id ? "border-gray-900 bg-gray-900 text-white shadow-lg" : subtotal >= cp.min_order ? "border-gray-300 hover:border-gray-900 bg-white" : "opacity-40 grayscale pointer-events-none"}`}
                    >
                      <p className="font-black text-lg">{cp.code}</p>
                      <p className="text-xs font-bold mb-1">
                        Giảm{" "}
                        {cp.type === "percent"
                          ? `${cp.value}%`
                          : formatVND(cp.value)}
                      </p>
                      <p className="text-[10px] opacity-70">
                        Đơn từ {formatVND(cp.min_order)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm py-4">
                    Không có mã giảm giá khả dụng.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-900 rounded-3xl p-8 sticky top-28 space-y-8 shadow-2xl shadow-gray-200/50">
              <h2 className="text-2xl font-black uppercase border-b-2 border-gray-100 pb-4">
                Hóa đơn
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-500 font-bold text-sm">
                  <span>Tạm tính</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold text-sm">
                    <span>Giảm giá</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 font-bold text-sm">
                  <span>Vận chuyển</span>
                  <span>
                    {shipping === 0 ? "Miễn phí" : formatVND(shipping)}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t-2 border-gray-900">
                  <span className="text-lg font-black uppercase">
                    Tổng cộng
                  </span>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter">
                    {formatVND(total)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú đơn hàng..."
                  className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                  rows="2"
                />
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || loading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-2xl text-lg uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg active:scale-95"
                >
                  <Lock size={20} /> Xác nhận đặt hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Payment;
