import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";
import authApi from "../api/authApi";

function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authApi.login(formData);

      const token = result?.accessToken;
      const user = result?.user;
      if (!token) throw new Error("Không tìm thấy token");

      localStorage.setItem("authToken", token);

      if (user) {
        localStorage.setItem("userInfo", JSON.stringify(user));
      }

      localStorage.setItem("authEvent", Date.now());

      const targetPath = user?.role_id === 1 ? "/admin" : "/";
      navigate(targetPath);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Sai tài khoản hoặc mật khẩu",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Đăng Nhập</h1>
          <p className="mt-2 text-sm text-gray-500">
            Chào mừng bạn quay trở lại
          </p>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 rounded bg-green-100 p-3 text-green-700 text-sm">
            <CheckCircle size={18} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded bg-red-100 p-3 text-red-700 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tài khoản
            </label>

            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              placeholder="Nhập tên đăng nhập"
              className="w-full rounded border p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>

            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="••••••••"
              className="w-full rounded border p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              "ĐĂNG NHẬP"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="cursor-pointer font-semibold text-blue-600 hover:underline"
          >
            Đăng ký
          </span>
        </div>
      </div>
    </main>
  );
}

export default SignIn;
