import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";

function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/access-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác");
      }

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem("authToken", data.accessToken);

        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        window.dispatchEvent(new Event("storage"));

        navigate("/profile");
      }
    } catch (err) {
      setError(err.message || "Lỗi đăng nhập. Vui lòng thử lại.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-slate-900 to-slate-700 px-6">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white/90 p-8 shadow-xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-500">
            Tiếp tục để quản lý đơn hàng và lưu sản phẩm yêu thích.
          </p>
        </header>

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2 text-left">
            <label
              htmlFor="username"
              className="text-sm font-medium text-slate-700"
            >
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              placeholder="binhhhi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2 text-left">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách
          bảo mật của TechZone.
        </p>
      </div>
    </main>
  );
}

export default SignIn;
