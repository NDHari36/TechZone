import api from "./api";

const orderApi = {
  createOrder: async (orderData) => {
    const res = await api.post("/orders", orderData);
    return res.data;
  },
  getOrderDetail: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  cancelOrder: async (id) => {
    const res = await api.patch(`/orders/${id}/cancel`);
    return res.data;
  },
  getByIdAdmin: async (id) => {
    const res = await api.get(`/orders/admin/${id}`);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get("/orders");
    return res.data;
  },
  checkWarranty: async (imei) => {
    const res = await api.get(`/warranty?imei=${encodeURIComponent(imei)}`);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get("/orders/all");
    return res.data;
  },
  updateStatus: async (id, data) => {
    const res = await api.patch(`/orders/admin/${id}/status`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },
};

export default orderApi;
