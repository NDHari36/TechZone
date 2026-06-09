import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SwiperSlider from "./SwiperSlider";
import { Loader } from "lucide-react";
import productApi from "../api/productApi";

const NAV_LIST = [
  { id: "mac", label: "Mac", title: "MAC" },
  { id: "ipad", label: "iPad", title: "IPAD" },
  { id: "iphone", label: "iPhone", title: "ĐIỆN THOẠI" },
  { id: "samsung", label: "Samsung", title: "SAMSUNG" },
  { id: "watch", label: "Watch", title: "WATCH" },
  { id: "airpods", label: "AirPods", title: "AIRPODS" },
];

function ProductsList({ searchParams }) {
  const [productsGrouped, setProductsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const limit = searchParams?.size || 100;
        const response = await productApi.getAll({ page: 1, limit: limit });
        const allProducts = response.result || response.data || [];

        const buckets = {
          mac: [],
          ipad: [],
          iphone: [],
          samsung: [],
          watch: [],
          airpods: [],
        };

        allProducts.forEach((product) => {
          const catName = product.category_name?.toLowerCase() || "";
          const brandName = product.brand_name?.toLowerCase() || "";

          if (brandName.includes("samsung")) {
            buckets.samsung.push(product);
          } else if (
            brandName.includes("apple") ||
            brandName === "khác" ||
            !brandName
          ) {
            if (catName.includes("laptop") || catName.includes("mac"))
              buckets.mac.push(product);
            else if (catName.includes("tablet") || catName.includes("ipad"))
              buckets.ipad.push(product);
            else if (
              catName.includes("điện thoại") ||
              catName.includes("phone") ||
              product.category_id === 1
            )
              buckets.iphone.push(product);
            else if (catName.includes("watch") || catName.includes("đồng hồ"))
              buckets.watch.push(product);
            else if (catName.includes("tai nghe") || catName.includes("airpod"))
              buckets.airpods.push(product);
          }
        });

        setProductsGrouped(buckets);
      } catch (err) {
        console.error("Lỗi fetch:", err);
        setError("Không thể tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
        <div className="h-10 w-1/3 bg-slate-200 animate-pulse rounded-xl mx-auto" />

        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <div className="h-[400px] bg-slate-100 rounded-2xl animate-pulse" />
            <div className="col-span-3 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-[400px] bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error)
    return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <section className="bg-white pt-16 pb-20 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
              Không gian thương hiệu - Khám phá hệ sinh thái
            </span>
          </h2>
        </div>

        <div className="space-y-20">
          {NAV_LIST.map((nav, index) => {
            const items = productsGrouped[nav.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={nav.id} id={nav.id} className="scroll-mt-24">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
                      {nav.title}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-2xl p-6 flex flex-col justify-between shadow-lg border border-slate-100 h-[400px] relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                      <img
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.opacity = 0.5;
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex-1 pt-4">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                        Thương hiệu
                      </span>
                      <h3 className="text-4xl font-black text-slate-900 mt-2 mb-4">
                        {nav.label}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Khám phá hệ sinh thái và các sản phẩm công nghệ đột phá
                        từ dòng {nav.label}.
                      </p>
                    </div>

                    <div className="relative z-10">
                      <Link
                        to={`/Category?keyword=${nav.id}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-md shadow-blue-200"
                      >
                        Xem tất cả {items.length} sản phẩm
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-3 overflow-hidden">
                    <SwiperSlider
                      items={items}
                      slidesPerView={{ default: 1, sm: 2, lg: 3 }}
                    />
                  </div>
                </div>
                {index !== NAV_LIST.length - 1 && (
                  <div className="my-16 flex items-center justify-center">
                    <div className="w-full max-w-6xl border-t border-slate-200 relative">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs text-slate-400 tracking-widest">
                        ●
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductsList;
