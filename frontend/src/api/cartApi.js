import api from "./api";

export async function getCart() {
  try {
    const response = await api.get("/cart/");
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể tải giỏ hàng";
    throw new Error(message);
  }
}

export async function addToCart(variantId, quantity = 1) {
  try {
    const response = await api.post(`/cart/${variantId}`, {
      variantId,
      quantity,
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Không thể thêm vào giỏ hàng";

    throw new Error(message);
  }
}

export async function updateQuantity(variantId, quantity) {
  try {
    const response = await api.put("/cart/item", {
      variantId,
      quantity,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Cập nhật số lượng thất bại";
    throw new Error(message);
  }
}

export async function removeItem(variantId) {
  try {
    const response = await api.delete(`/cart/item/${variantId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Xóa sản phẩm thất bại";
    throw new Error(message);
  }
}

export default {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
};
