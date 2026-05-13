import api from "./api";

// LOGIN
export async function login(credentials) {
  try {
    const response = await api.post("/auth/signin", {
      username: credentials.username,
      password: credentials.password,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Đăng nhập thất bại";
    throw new Error(message);
  }
}

// REGISTER
export async function register(payload) {
  try {
    const response = await api.post("/auth/signup", {
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Đăng ký thất bại";
    throw new Error(message);
  }
}

export default {
  login,
  register,
};
