import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401 || status === 403) {
        if (errorData?.error === "ACCOUNT_LOCKED") {
          alert(
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ!",
          );
        }

        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("storage"));

        if (window.location.pathname !== "/signin") {
          window.location.href = "/signin";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
