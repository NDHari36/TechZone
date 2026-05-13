import { useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { ShoppingCart } from "lucide-react";
import cartApi from "../api/cartApi";

function ProductCard({ product, variant = "default" }) {
  const [loading, setLoading] = useState(false);

  const fallback = "/images/img.jpg";
  const displayImage =
    product.image_url || product.thumbnailUrl || product.image || fallback;
  const priceValue = product.min_price || product.price || 0;
  const price = Number(priceValue).toLocaleString("vi-VN");
  const brandName = product.brand_name || product.brandName || "Thương hiệu";
  const stockCount = product.total_stock || product.stock || 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation?.();

    try {
      setLoading(true);

      const vId =
        product.default_variant_id || product.variant_id || product.id;

      await cartApi.addToCart(vId, 1);

      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error(
        "Không thể thêm vào giỏ hàng: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const isLarge = variant === "large";

  return (
    <article
      className={`product-card group relative h-full flex flex-col overflow-hidden rounded-2xl border border-[#2c2c2e] bg-[#1c1c1e] text-white shadow-sm hover:border-[#3c3c3e] transition-colors ${isLarge ? "md:flex-row" : ""}`}
    >
      <div
        className={`relative overflow-hidden bg-white/5 flex items-center justify-center ${isLarge ? "md:w-1/2" : ""}`}
      >
        <img
          src={displayImage}
          alt={product.name}
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isLarge ? "h-80 md:h-[420px]" : "h-64 md:h-72"}`}
        />
        <button
          aria-label="Thêm vào giỏ"
          onClick={handleAddToCart}
          disabled={loading || stockCount <= 0}
          className="absolute top-3 right-3 bg-[#121212]/80 text-white p-2 rounded-full shadow border border-transparent hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          title={stockCount <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
        >
          {loading ? "..." : <ShoppingCart className="w-5 h-5 p-0.5" />}
        </button>
      </div>

      <div
        className={`flex flex-1 flex-col gap-2 p-5 ${isLarge ? "md:w-1/2" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {brandName}
          </span>
          {stockCount > 0 ? (
            <span className="text-xs text-green-500">{stockCount} còn</span>
          ) : (
            <span className="text-xs text-red-500 font-bold">Hết hàng</span>
          )}
        </div>

        <h3
          className={`${isLarge ? "text-2xl md:text-3xl" : "text-lg"} font-bold text-white line-clamp-1`}
        >
          {product.name}
        </h3>

        {product.description && (
          <p
            className={`text-sm text-gray-400 ${isLarge ? "line-clamp-3" : "line-clamp-1"}`}
          >
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#2c2c2e]">
          <div className="text-lg font-bold text-white">{price} đ</div>
          <Link
            to={`/product/detail/${product.id}`}
            className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
