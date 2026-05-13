import api from "./api";

const dashboardApi = {
  getStats: async (params) => {
    // URL thực tế sẽ là: /dashboard?startDate=...&endDate=...
    const res = await api.get("/dashboard", { params });
    return res.data;
  },
};

export default dashboardApi;
