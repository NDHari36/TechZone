import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  LogOut,
  Loader,
  AlertCircle,
  CheckCircle,
  MapPin,
  Trash2,
  Plus,
  Edit3,
  Save,
  X,
  ShieldCheck,
} from "lucide-react";
import userApi from "../api/userApi";

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [animateItems, setAnimateItems] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState(null);

  const [addressForm, setAddressForm] = useState({
    recipient: "",
    phone: "",
    line1: "",
    ward: "",
    district: "",
    city: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      const user = data.result || data;
      setUserData(user);

      setProfileForm({
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      setError(null);
      setAnimateItems(true);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Vui lòng đăng nhập",
      );
      if (err.response?.status === 401 || err.response?.status === 403)
        navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await userApi.getAddresses();
      setAddresses(data.result || []);
    } catch (err) {
      setAddressError(err.response?.data?.message || err.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await userApi.updateProfile({
        full_name: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
      });
      await fetchProfile();
      setIsEditingProfile(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await userApi.addAddress({
        full_name: addressForm.recipient,
        phone: addressForm.phone,
        line1: addressForm.line1,
        ward: addressForm.ward,
        district: addressForm.district,
        city: addressForm.city,
        is_default: addresses.length === 0 ? 1 : 0,
      });

      await fetchAddresses();
      await fetchProfile();

      setAddressForm({
        recipient: "",
        phone: "",
        line1: "",
        ward: "",
        district: "",
        city: "",
      });

      setShowAddressForm(false);
      toast.success("Thêm địa chỉ thành công!");
    } catch (err) {
      setAddressError(err.response?.data?.message || err.message);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoadingAddresses(true);
      await userApi.setDefaultAddress(addressId);
      await fetchAddresses();
      await fetchProfile();
      toast.success("Đã thay đổi địa chỉ mặc định!");
    } catch (err) {
      setAddressError(err.response?.data?.message || "Lỗi đặt mặc định");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
      await userApi.deleteAddress(addressId);
      await fetchAddresses();
      await fetchProfile();
      toast.success("Đã xóa địa chỉ!");
    } catch (err) {
      setAddressError(err.response?.data?.message || err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu không khớp");
      return;
    }
    if (passwordForm.password === passwordForm.newPassword) {
      setPasswordError("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }
    setChangingPassword(true);
    try {
      await userApi.changePassword(passwordForm);
      setPasswordSuccess("Đổi mật khẩu thành công");
      setPasswordForm({ password: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    navigate("/signin");
  };

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  if (loading)
    return (
      <main className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-gray-900" />
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 text-gray-900">
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
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideInRight { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .stagger-1 { animation-delay: 0.1s; } 
        .stagger-2 { animation-delay: 0.2s; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
        <div className="mb-10 animate-fadeInUp">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Tài khoản của bạn
          </h1>
          <p className="mt-2 text-slate-500">
            Quản lý thông tin cá nhân, địa chỉ giao hàng và bảo mật tài khoản.
          </p>
        </div>

        {userData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white    rounded-3xl border  border-gray-900 p-8 sticky top-24 animate-slideInLeft shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 animate-scaleIn stagger-1">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 shadow-inner border-4 border-white ring-2 ring-gray-900">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semiboldtext-gray-900 mb-1   tracking-wide">
                    {userData.full_name || userData.username}
                  </h2>
                  <p className="text-sm text-gray-500 font-semibold mb-6 flex items-center gap-1">
                    @{userData.username}
                  </p>
                  <div className="w-full h-px bg-gray-200 mb-6"></div>
                  <div className="w-full flex flex-col gap-3 text-sm font-semibold text-gray-600">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{userData.email}</span>
                    </div>
                    {userData.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{userData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Details Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all animate-slideInRight">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-100">
                  <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    Hồ sơ cá nhân
                  </h3>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-md"
                    >
                      <Edit3 className="h-4 w-4" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
                {!isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          Username
                        </label>
                        <p className="text-slate-900 font-medium text-base">
                          @{userData.username}
                        </p>
                      </div>
                      <div className="group bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          Họ và tên
                        </label>
                        <p className="text-slate-900 font-medium text-base">
                          {userData.full_name || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="group bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          Số điện thoại
                        </label>
                        <p className="text-slate-900 font-medium text-base">
                          {userData.phone || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="group bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          Email
                        </label>
                        <p className="text-gray-900 font-bold text-lg truncate">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-6 animate-scaleIn"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-black text-gray-600 mb-2   tracking-wide">
                          Tên đăng nhập (Cố định)
                        </label>
                        <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-4 font-bold text-gray-500 cursor-not-allowed">
                          {userData.username}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-600   tracking-wide">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-non transition-all "
                          placeholder="Nhập họ tên"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-600   tracking-wide">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-non transition-all "
                          placeholder="Nhập SĐT"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs font-black text-gray-600   tracking-wide">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-non transition-all "
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-gray-100">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex-1 bg-gray-900 hover:bg-black text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(209,213,219,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                      >
                        {isUpdatingProfile ? (
                          <Loader className="animate-spin" size={20} />
                        ) : (
                          <Save size={20} />
                        )}
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 bg-white text-gray-900 font-black py-4 px-6 border-2 border-gray-900 rounded-xl transition-colors hover:bg-gray-50 active:scale-95"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Address Management Section */}
              <div className="bg-white rounded-3xl border  border-gray-900 p-6 sm:p-8 border-slate-200 shadow-sm hover:shadow-md transition-all animate-fadeInUp stagger-1">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-100">
                  <h3 className="text-xl font-semiboldtext-gray-900 flex items-center gap-3 uppercase tracking-wide">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    Quản lý địa chỉ
                  </h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Thêm địa chỉ</span>
                    </button>
                  )}
                </div>

                <div className="space-y-5 mb-6">
                  {addresses.length === 0 && !showAddressForm && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        Bạn chưa thêm địa chỉ nào.
                      </p>
                    </div>
                  )}
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`group relative border ${
                        addr.is_default === 1
                          ? "border-blue-200 bg-blue-50/40"
                          : "border-gray-200 bg-white hover:border-gray-400"
                      } rounded-xl p-5 sm:p-6 transition-all duration-200`}
                    >
                      {addr.is_default === 1 && (
                        <div className="absolute top-4 right-4 bg-green-100 text-green-700 border border-green-200 text-xs font-medium px-3 py-1 rounded-full">
                          ✓ MẶC ĐỊNH
                        </div>
                      )}
                      <div className="pr-20">
                        <h4 className="font-black text-gray-900 text-lg uppercase mb-2 flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          {addr.full_name}
                        </h4>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed mb-3 flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="text-gray-400 mt-0.5 shrink-0"
                          />
                          <span>
                            {addr.line1}, {addr.ward}, {addr.district},{" "}
                            {addr.city}
                          </span>
                        </p>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          {addr.phone}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t-2 border-gray-100">
                        {addr.is_default !== 1 && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="px-4 py-2 bg-gray-100 text-gray-900 text-xs font-black rounded-lg uppercase hover:bg-gray-200 transition-colors active:scale-95"
                          >
                            Đặt mặc định
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="px-4 py-2 bg-red-50 text-red-600 border-2 border-red-100 text-xs font-black rounded-lg uppercase hover:bg-red-100 hover:border-red-200 transition-colors active:scale-95 flex items-center gap-1 ml-auto"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddressForm && (
                  <form
                    onSubmit={handleAddAddress}
                    className="space-y-5 p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200 animate-scaleIn shadow-sm"
                  >
                    <h4 className="font-black text-lg uppercase tracking-wide border-b-2 border-gray-200 pb-3 mb-4">
                      Thêm địa chỉ mới
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Người nhận
                        </label>
                        <input
                          type="text"
                          value={addressForm.recipient}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              recipient: e.target.value,
                            })
                          }
                          className="w-full p-3.5 border-2 border-gray-300 rounded-xl outline-none font-bold focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              phone: e.target.value,
                            })
                          }
                          className="w-full p-3.5 border-2 border-gray-300 rounded-xl outline-none font-bold focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all bg-white"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Địa chỉ chi tiết (Số nhà, đường...)
                        </label>
                        <input
                          type="text"
                          value={addressForm.line1}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              line1: e.target.value,
                            })
                          }
                          className="w-full p-3.5 border-2 border-gray-300 rounded-xl outline-none font-bold focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Phường / Xã
                        </label>
                        <input
                          type="text"
                          value={addressForm.ward}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              ward: e.target.value,
                            })
                          }
                          className="w-full p-3.5 border-2 border-gray-300 rounded-xl outline-none font-bold focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Quận / Huyện
                        </label>
                        <input
                          type="text"
                          value={addressForm.district}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              district: e.target.value,
                            })
                          }
                          className="w-full p-3.5 border-2 border-gray-300 rounded-xl outline-none font-bold focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all bg-white"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                          Thành phố / Tỉnh
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              city: e.target.value,
                            })
                          }
                          className="w-full p-3.5 border-2 border-gray-300 rounded-xl outline-none font-bold focus:border-gray-900 focus:ring-4 focus:ring-gray-200 transition-all bg-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-gray-900 text-white font-black py-4 rounded-xl uppercase transition-transform active:scale-95 hover:bg-black"
                      >
                        Thêm địa chỉ
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="flex-1 bg-white text-gray-900 font-black py-4 border-2 border-gray-900 rounded-xl uppercase transition-colors hover:bg-gray-50 active:scale-95"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Security Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all animate-fadeInUp stagger-2">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-100">
                  <h3 className="text-xl font-semiboldtext-gray-900 flex items-center gap-3 uppercase tracking-wide">
                    <div className="bg-gray-900 p-2 rounded-lg">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    Bảo mật
                  </h3>
                </div>
                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 uppercase tracking-wide transition-colors active:scale-95 border-2 border-transparent hover:border-gray-300"
                  >
                    <Lock className="h-5 w-5" /> Thay đổi mật khẩu
                  </button>
                ) : (
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-5 animate-scaleIn max-w-xl"
                  >
                    {passwordError && (
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold rounded-r-lg flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p>{passwordError}</p>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 font-bold rounded-r-lg flex items-start gap-3">
                        <CheckCircle className="shrink-0 mt-0.5" size={18} />
                        <p>{passwordSuccess}</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <input
                          type="password"
                          placeholder="Mật khẩu hiện tại"
                          value={passwordForm.password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              password: e.target.value,
                            })
                          }
                          required
                          className="w-full p-4 border-2 border-gray-300 rounded-xl font-bold bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Mật khẩu mới"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          required
                          className="w-full p-4 border-2 border-gray-300 rounded-xl font-bold bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Xác nhận mật khẩu mới"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          className="w-full p-4 border-2 border-gray-300 rounded-xl font-bold bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-200 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="flex-1 bg-gray-900 text-white font-black py-4 rounded-xl uppercase transition-transform active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 shadow-[4px_4px_0px_0px_rgba(209,213,219,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                      >
                        {changingPassword ? (
                          <Loader className="animate-spin" size={20} />
                        ) : (
                          <Lock size={20} />
                        )}
                        {changingPassword ? "Đang xử lý..." : "Lưu mật khẩu"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordError(null);
                          setPasswordSuccess(null);
                          setPasswordForm({
                            password: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="flex-1 bg-white text-gray-900 font-black py-4 border-2 border-gray-900 rounded-xl uppercase transition-colors hover:bg-gray-50 active:scale-95"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Logout Button */}
              <div className="pt-4 animate-fadeInUp stagger-2">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5   rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0px_8px_0px_0px_rgba(153,27,27,1)] hover:shadow-[0px_4px_0px_0px_rgba(153,27,27,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase tracking-widest text-lg"
                >
                  <LogOut size={24} /> Đăng xuất tài khoản
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;
