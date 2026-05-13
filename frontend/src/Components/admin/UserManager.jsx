import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import {
  Plus,
  Lock,
  Unlock,
  Users,
  User,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
} from "lucide-react";
import userApi from "../../api/userApi";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [sortIDuser, setSortIDuser] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedAddresses, setExpandedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role_id: 2,
    is_active: 1,
  });

  const load = async () => {
    try {
      const res = await userApi.getAll();

      let data = res.result?.content || res.result || res.data || [];
      const uniqueData = Array.from(
        new Map(data.map((item) => [item.id, item])).values(),
      );
      const sortedUsers = [...data].sort((a, b) => {
        return parseInt(a.id) - parseInt(b.id);
      });
      setUsers(sortedUsers);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    }
  };

  const handleSortById = () => {
    const sorted = [...users].sort((a, b) => {
      if (sortIDuser === "asc") {
        return parseInt(b.id) - parseInt(a.id);
      } else {
        return parseInt(a.id) - parseInt(b.id);
      }
    });

    setUsers(sorted);
    setSortIDuser(sortIDuser === "asc" ? "desc" : "asc");
  };
  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();

    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.full_name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.phone?.includes(keyword)
    );
  });
  useEffect(() => {
    load();
  }, []);
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      full_name: "",
      phone: "",
      role_id: 2,
      is_active: 1,
    });
  };

  const openModalForCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.password)
        return alert("Vui lòng nhập mật khẩu cho người dùng mới!");
      await userApi.create(form);
      toast.success("Thêm thành công!");
      closeModal();
      load();
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRoleChange = async (user, newRoleId, e) => {
    e.stopPropagation();

    if (Number(user.role_id) === 1) return;

    try {
      await userApi.update(user.id, { role_id: newRoleId });
      toast.success("Cập nhật vai trò thành công!");
      load();
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleLock = async (user, e) => {
    e.stopPropagation();

    if (Number(user.role_id) === 1) return;

    const newStatus = user.is_active === 1 ? 0 : 1;
    const actionName = newStatus === 0 ? "khóa" : "mở khóa";

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này?`))
      return;

    try {
      await userApi.update(user.id, { is_active: newStatus });
      toast.success(
        `${newStatus === 0 ? "Khóa" : "Mở khóa"} tài khoản thành công!`,
      );
      load();
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleExpand = async (user) => {
    if (expandedRowId === user.id) {
      setExpandedRowId(null);
      setExpandedAddresses([]);
      return;
    }

    setExpandedRowId(user.id);
    setIsLoadingAddresses(true);

    try {
      const res = await userApi.getAddressesByUserId(user.id);

      const addresses = res.data?.result || res.data || [];

      setExpandedAddresses(addresses);
    } catch (err) {
      console.error("Lỗi khi tải địa chỉ:", err);
      setExpandedAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
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
        <div className="flex justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-gray-900" />
            <h1 className="text-2xl font-black uppercase text-gray-900">
              Quản lý người dùng
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <input
              type="text"
              placeholder="Tìm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <button
              onClick={openModalForCreate}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md"
            >
              <Plus size={20} /> Thêm người dùng
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 w-10"></th>
                  <th
                    onClick={handleSortById}
                    className="p-4 font-bold text-center cursor-pointer select-none hover:bg-gray-100 transition-colors"
                  >
                    ID {sortIDuser === "asc" ? "↑" : "↓"}
                  </th>
                  <th className="p-4 font-bold">Người dùng</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Số điện thoại</th>
                  <th className="p-4 font-bold text-center">Vai trò</th>
                  <th className="p-4 font-bold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <React.Fragment key={`user-${user.id}-${index}`}>
                      <tr
                        onClick={() => handleToggleExpand(user)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          expandedRowId === user.id ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="p-4 text-gray-400">
                          {expandedRowId === user.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-500 font-medium">
                          {user.id}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                              <User className="text-gray-400" size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {user.full_name
                                  ? user.full_name
                                  : user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-700">
                          {user.email}
                          {user.is_active === 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Đã khóa
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-700">
                          {user.phone || "---"}
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={user.role_id}
                            onChange={(e) =>
                              handleRoleChange(user, e.target.value, e)
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={Number(user.role_id) === 1}
                            className={`px-3 py-1.5 rounded-full text-sm font-bold text-center outline-none transition-colors border-none ring-1 ring-inset ${
                              Number(user.role_id) === 1
                                ? "bg-purple-50 text-purple-700 ring-purple-200 cursor-not-allowed opacity-80"
                                : "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100 cursor-pointer"
                            }`}
                          >
                            <option
                              value={1}
                              className="bg-white text-gray-900 font-medium"
                            >
                              Admin
                            </option>
                            <option
                              value={2}
                              className="bg-white text-gray-900 font-medium"
                            >
                              Khách hàng
                            </option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={(e) => handleToggleLock(user, e)}
                              disabled={Number(user.role_id) === 1}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1 font-semibold text-sm ${
                                Number(user.role_id) === 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : user.is_active === 1
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                              }`}
                              title={
                                Number(user.role_id) === 1
                                  ? "Không thể thao tác với Quản trị viên"
                                  : user.is_active === 1
                                    ? "Đang hoạt động - Bấm để Khóa"
                                    : "Đang bị khóa - Bấm để Mở khóa"
                              }
                            >
                              {user.is_active === 1 ? (
                                <Unlock size={18} />
                              ) : (
                                <Lock size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedRowId === user.id && (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-0 border-b-2 border-gray-200"
                          >
                            <div className="bg-gray-50/50 p-6 shadow-inner">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 col-span-1">
                                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
                                    Thông tin tài khoản
                                  </h4>
                                  <div className="space-y-3 text-sm">
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">ID:</span>
                                      <span className="font-semibold text-gray-900">
                                        {user.id}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">
                                        Họ và tên:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {user.full_name || "Chưa cập nhật"}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">
                                        Tên đăng nhập:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        @{user.username}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">
                                        Email:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {user.email}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">
                                        Số điện thoại:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {user.phone || "---"}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">
                                        Ngày tham gia:
                                      </span>
                                      <span className="font-semibold text-gray-900 flex items-center gap-1">
                                        <Calendar size={14} />
                                        {formatDate(user.created_at)}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">
                                        Vai trò:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {Number(user.role_id) === 1
                                          ? "Admin"
                                          : "Khách hàng"}
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-500">
                                        Trạng thái:
                                      </span>
                                      <span
                                        className={`font-semibold ${
                                          user.is_active === 1
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {user.is_active === 1
                                          ? "Hoạt động"
                                          : "Đã khóa"}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-2">
                                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                    <MapPin
                                      size={18}
                                      className="text-red-500"
                                    />
                                    Sổ địa chỉ nhận hàng
                                  </h4>

                                  {isLoadingAddresses ? (
                                    <div className="text-center py-4 text-gray-400 animate-pulse">
                                      Đang tải địa chỉ...
                                    </div>
                                  ) : expandedAddresses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {expandedAddresses.map((addr, idx) => (
                                        <div
                                          key={addr.id || idx}
                                          className={`p-4 border rounded-lg relative ${
                                            addr.is_default
                                              ? "border-blue-300 bg-blue-50/30"
                                              : "border-gray-200"
                                          }`}
                                        >
                                          {addr.is_default === 1 && (
                                            <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                              MẶC ĐỊNH
                                            </span>
                                          )}
                                          <p className="font-bold text-gray-900 mb-1">
                                            {addr.full_name}
                                          </p>
                                          <p className="text-sm text-gray-600 mb-2">
                                            {addr.phone}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {addr.line1}
                                            {addr.ward ? `, ${addr.ward}` : ""}
                                            {addr.district
                                              ? `, ${addr.district}`
                                              : ""}
                                            {addr.city ? `, ${addr.city}` : ""}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                      Người dùng này chưa thêm địa chỉ nào.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-500">
                      Chưa có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900 uppercase">
                Thêm người dùng mới
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form
                id="userForm"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Tên đăng nhập (Username)
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    placeholder="VD: nguyenvan_a"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    placeholder="********"
                  />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Họ và tên
                  </label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    placeholder="0987654321"
                  />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Vai trò
                  </label>
                  <select
                    name="role_id"
                    value={form.role_id}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  >
                    <option value={2}>Khách hàng (User)</option>
                    <option value={1}>Quản trị viên (Admin)</option>
                  </select>
                </div>
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
                form="userForm"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-md"
              >
                Lưu người dùng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
