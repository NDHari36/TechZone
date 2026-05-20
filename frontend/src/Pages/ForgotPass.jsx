import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const API_URL =
  "https://techzone-api-wkxx.onrender.com/api/auth/reset-password-default";

export default function ResetPass() {
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async () => {
    const start = parseInt(startId);
    const end = parseInt(endId);

    if (isNaN(start) || isNaN(end)) {
      toast.error("Vui lòng nhập số hợp lệ");
      return;
    }

    if (start > end) {
      toast.error("Start ID phải nhỏ hơn End ID");
      return;
    }

    try {
      setLoading(true);

      for (let id = start; id <= end; id++) {
        try {
          await axios.put(`${API_URL}/${id}`);
        } catch (err) {
          console.log("Fail user ID:", id);
        }
      }

      toast.success(`Reset password từ ${start} đến ${end} thành công`);

      setStartId("");
      setEndId("");
    } catch (error) {
      console.error(error);
      toast.error("Reset thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Toaster position="top-right" />

      <div
        className="card border-0 shadow-lg p-4"
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#dc3545",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "22px",
            }}
          >
            🔐
          </div>

          <h3 className="fw-bold mb-1">Reset Password</h3>
          <p className="text-muted mb-0">
            Nhập khoảng ID để reset mật khẩu người dùng
          </p>
        </div>

        {/* START */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Start ID</label>
          <input
            type="number"
            className="form-control form-control-lg"
            placeholder="Ví dụ: 1"
            value={startId}
            onChange={(e) => setStartId(e.target.value)}
          />
        </div>

        {/* END */}
        <div className="mb-3">
          <label className="form-label fw-semibold">End ID</label>
          <input
            type="number"
            className="form-control form-control-lg"
            placeholder="Ví dụ: 100"
            value={endId}
            onChange={(e) => setEndId(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          className="btn btn-danger w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" />
              Đang reset...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        {/* BACK */}
        <Link
          to="/"
          className="btn btn-outline-light w-100 mt-3 py-2"
          style={{ backgroundColor: "#6c757d" }}
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
