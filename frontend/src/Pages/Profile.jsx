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
      <main className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-gray-900" />
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white pt-24 pb-12">
      {" "}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 80,
          right: 20,
        }}
      />{" "}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.6s ease-out forwards; }
        .stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.2s; }
      `}</style>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-12 animate-fadeInUp">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-2 tracking-wider">
            TÀI KHOẢN CỦA BẠN
          </h1>
          <div className="h-1 w-20 bg-gray-900 rounded-full"></div>
        </div>

        {userData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border-2 border-gray-900 p-8 sticky top-24 animate-slideInLeft shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 animate-scaleIn stagger-1">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gray-900">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1 font-Bebas uppercase">
                    {userData.full_name || userData.username}
                  </h2>
                  <p className="text-sm text-gray-600 mb-6 font-medium">
                    @{userData.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl border-2 border-gray-900 p-8 animate-slideInRight shadow-lg">
                <h3 className="text-3xl font-black text-gray-900 font-Roboto flex items-center gap-3 uppercase tracking-wider mb-8">
                  <ShieldCheck className="h-6 w-6 text-white bg-gray-900 rounded p-1" />{" "}
                  Hồ sơ cá nhân
                </h3>

                {!isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                        <label className="block text-xs font-black text-gray-500 uppercase mb-1">
                          username
                        </label>
                        <p className="text-gray-900 font-bold">
                          @{userData.username}
                        </p>
                      </div>
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                        <label className="block text-xs font-black text-gray-500 uppercase mb-1">
                          Họ và tên
                        </label>
                        <p className="text-gray-900 font-bold">
                          {userData.full_name || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                        <label className="block text-xs font-black text-gray-500 uppercase mb-1">
                          Số điện thoại
                        </label>
                        <p className="text-gray-900 font-bold">
                          {userData.phone || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                        <label className="block text-xs font-black text-gray-500 uppercase mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 font-bold">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md"
                    >
                      <Edit3 className="h-5 w-5" /> Chỉnh sửa hồ sơ
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-6 animate-scaleIn"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-gray-700 mb-2 uppercase">
                          Tên đăng nhập (Cố định)
                        </label>
                        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 font-bold text-gray-400 cursor-not-allowed">
                          {userData.username}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-2 uppercase">
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
                          className="w-full p-4 border-2 border-gray-900 rounded-lg font-bold outline-none"
                          placeholder="Nhập họ tên"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-2 uppercase">
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
                          className="w-full p-4 border-2 border-gray-900 rounded-lg font-bold outline-none"
                          placeholder="Nhập SĐT"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-gray-700 mb-2 uppercase">
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
                          className="w-full p-4 border-2 border-gray-900 rounded-lg font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex-1 bg-gray-900 text-white font-black py-4 rounded-lg uppercase flex items-center justify-center gap-2"
                      >
                        {isUpdatingProfile ? (
                          <Loader className="animate-spin" size={20} />
                        ) : (
                          <Save size={20} />
                        )}{" "}
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 bg-white text-gray-900 font-black py-4 border-2 border-gray-900 rounded-lg uppercase"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-900 p-8 shadow-lg animate-fadeInUp">
                <h3 className="text-3xl font-black text-gray-900 mb-8 uppercase flex items-center gap-3 tracking-wider">
                  <MapPin className="h-6 w-6 text-white bg-gray-900 rounded p-1" />{" "}
                  Quản lý địa chỉ
                </h3>
                <div className="space-y-4 mb-8">
                  {addresses.map((addr, idx) => (
                    <div
                      key={addr.id}
                      className="border-2 border-gray-300 rounded-lg p-5 relative hover:border-gray-900 transition-all shadow-sm"
                    >
                      {addr.is_default === 1 && (
                        <div className="absolute top-4 right-4 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded">
                          MẶC ĐỊNH
                        </div>
                      )}
                      <p className="font-black text-gray-900 text-lg uppercase mb-1">
                        {addr.full_name}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        {addr.line1}, {addr.ward}, {addr.district}, {addr.city}
                      </p>
                      <p className="text-sm font-bold mt-2 flex items-center gap-1 text-gray-900">
                        <Phone size={14} /> {addr.phone}
                      </p>
                      <div className="flex gap-3 mt-5">
                        {addr.is_default !== 1 && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="px-6 py-2 bg-gray-900 text-white text-xs font-black rounded-lg uppercase hover:bg-black transition-all active:scale-95 shadow-sm"
                          >
                            Đặt mặc định
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="px-6 py-2 bg-white text-red-600 border-2 border-red-600 text-xs font-black rounded-lg uppercase hover:bg-red-50 transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-5 w-5" /> Thêm địa chỉ mới
                  </button>
                ) : (
                  <form
                    onSubmit={handleAddAddress}
                    className="space-y-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-300 animate-scaleIn"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Người nhận"
                        value={addressForm.recipient}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            recipient: e.target.value,
                          })
                        }
                        className="p-3 border-2 border-gray-300 rounded-lg outline-none font-bold"
                        required
                      />

                      <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            phone: e.target.value,
                          })
                        }
                        className="p-3 border-2 border-gray-300 rounded-lg outline-none font-bold"
                        required
                      />

                      <input
                        type="text"
                        placeholder="Địa chỉ chi tiết"
                        value={addressForm.line1}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            line1: e.target.value,
                          })
                        }
                        className="md:col-span-2 p-3 border-2 border-gray-300 rounded-lg outline-none font-bold"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Phường/Xã"
                        value={addressForm.ward}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            ward: e.target.value,
                          })
                        }
                        className="p-3 border-2 border-gray-300 rounded-lg outline-none font-bold"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Quận/Huyện"
                        value={addressForm.district}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            district: e.target.value,
                          })
                        }
                        className="p-3 border-2 border-gray-300 rounded-lg outline-none font-bold"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Thành phố"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                        className="md:col-span-2 p-3 border-2 border-gray-300 rounded-lg outline-none font-bold"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-gray-900 text-white font-black py-4 rounded-lg uppercase"
                      >
                        Thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="flex-1 bg-white text-gray-900 font-black py-4 border-2 border-gray-900 rounded-lg uppercase"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-900 p-8 shadow-lg animate-fadeInUp">
                <h3 className="text-3xl font-black text-gray-900 mb-8 font-Roboto flex items-center gap-3 uppercase tracking-wide">
                  <Lock className="h-6 w-6 text-white bg-gray-900 rounded p-1" />{" "}
                  Bảo mật
                </h3>
                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                  >
                    <Lock className="h-5 w-5" /> Thay đổi mật khẩu
                  </button>
                ) : (
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-5 animate-scaleIn"
                  >
                    {passwordError && (
                      <div className="p-4 bg-gray-100 border-2 border-gray-900 text-gray-900 font-bold rounded-lg">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-4 bg-green-100 border-2 border-green-600 text-green-700 font-bold rounded-lg flex items-center gap-2">
                        <CheckCircle size={18} />
                        {passwordSuccess}
                      </div>
                    )}
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
                      className="w-full p-4 border-2 border-gray-900 rounded-lg font-bold"
                    />
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
                      className="w-full p-4 border-2 border-gray-900 rounded-lg font-bold"
                    />
                    <input
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="w-full p-4 border-2 border-gray-900 rounded-lg font-bold"
                    />
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="flex-1 bg-gray-900 text-white font-black py-4 rounded-lg uppercase"
                      >
                        {changingPassword ? "Đang xử lý..." : "Lưu mật khẩu"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordError(null);
                          setPasswordSuccess(null);
                        }}
                        className="flex-1 bg-white text-gray-900 font-black py-4 border-2 border-gray-900 rounded-lg uppercase"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl uppercase tracking-widest"
              >
                <LogOut size={24} /> Đăng xuất tài khoản
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;
