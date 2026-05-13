import api from "./api";

const brandApi = {
  getAll: async () => {
    try {
      const response = await api.get("/brands");
      return response.data;
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  },
};

export default brandApi;
