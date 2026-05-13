import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";
import authApi from "../api/authApi";

function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) {
      setError("Email không hợp lệ!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);

      await authApi.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/signin", {
        state: { message: "Đăng ký thành công! Vui lòng đăng nhập." },
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Đăng Ký</h1>
          <p className="mt-2 text-sm text-gray-500">Tạo tài khoản mới</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded bg-red-100 p-3 text-red-700 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tài khoản
            </label>
            <input
              id="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full rounded border p-3 text-sm"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full rounded border p-3 text-sm"
              placeholder="example@gmail.com"
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
              required
              className="w-full rounded border p-3 text-sm"
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full rounded border p-3 text-sm"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded bg-blue-600 py-3 text-sm font-bold text-white"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Đang xử lý...
              </>
            ) : (
              "ĐĂNG KÝ"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/signin"
            className="font-semibold text-blue-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}

export default SignUp;
