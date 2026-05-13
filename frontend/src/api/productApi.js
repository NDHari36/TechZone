import api from "./api";

const productApi = {
  getAll: async (params = { page: 1, limit: 10000 }) => {
    const response = await api.get(`/products`, {
      params: params,
    });
    return response.data;
  },

  getSuggestions: async (keyword) => {
    const response = await api.get(`/products/suggestions`, {
      params: { q: keyword },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post(`/products`, productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getHeroSale: async () => {
    const res = await api.get("/products/hero-sale");
    return res.data;
  },

  getReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  addReview: async (data) => {
    const response = await api.post(
      `/products/${data.productId}/reviews`,
      data,
    );
    return response.data;
  },

  checkCanReview: async (productId, orderId) => {
    const response = await api.get(`/products/${productId}/can-review`, {
      params: { orderId },
    });
    return response.data;
  },

  uploadImage: async (productId, formData) => {
    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  removeImage: async (imageId) => {
    const response = await api.delete(`/products/images/${imageId}`);
    return response.data;
  },

  setPrimaryImage: async (productId, imageId) => {
    const response = await api.put(
      `/products/${productId}/images/${imageId}/primary`,
    );
    return response.data;
  },
};

export default productApi;
