import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    // USER BỊ KHÓA
    if (
      error.response?.status === 403 &&
      error.response?.data?.message === "Tài khoản đã bị khóa"
    ) {
      localStorage.clear();
      window.location.href = "/signin";
      return Promise.reject(error);
    }
    // REFRESH TOKEN FLOW
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/signin") &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = axios
            .post(
              `${API_BASE_URL}/auth/refresh-token`,
              {},
              { withCredentials: true },
            )
            .then((res) => {
              const newToken = res.data.accessToken;
              localStorage.setItem("authToken", newToken);
              return newToken;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/signin";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
