import api from "./api";

const dashboardApi = {
  getStats: async (params) => {
    const res = await api.get("/dashboard", { params });
    return res.data;
  },
};

export default dashboardApi;
