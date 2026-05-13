import api from "./api";

const couponApi = {
  applyCoupon: async (payload) => {
    const res = await api.post("/coupons/apply", payload);
    return res.data;
  },
  getAllCoupons: async () => {
    const res = await api.get("/coupons");
    return res.data;
  },
};

export default couponApi;
