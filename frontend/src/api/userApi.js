import api from "./api";

const userApi = {
  getProfile: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put("/users/profile", data);
    return res.data;
  },
  getAddresses: async () => {
    const res = await api.get("/users/address");
    return res.data;
  },
  getAddressesByUserId: async (userId) => {
    return await api.get(`/users/address/${userId}`);
  },

  addAddress: async (addressData) => {
    const res = await api.post("/users/address", addressData);
    return res.data;
  },
  deleteAddress: async (id) => {
    const res = await api.delete(`/users/address/${id}`);
    return res.data;
  },
  setDefaultAddress: async (id) => {
    const res = await api.patch(`/users/address/${id}/default`);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.patch("/users/change-pwd", data);
    return res.data;
  },

  getAll: async () => {
    const res = await api.get("/users/all");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/users", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export default userApi;
