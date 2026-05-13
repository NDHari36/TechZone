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
      <div className="flex justify-center items-center min-h-[400px] bg-[#121212]">
        <Loader className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (error)
    return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <section className="bg-[#121212] min-h-screen pt-16 pb-20 font-sans text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="font-Roboto text-4xl font-bold mx-auto max-w-4xl text-white">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Không gian thương hiệu
            </span>
            . Khám phá hệ sinh thái.
          </h2>
        </div>

        <div className="space-y-20">
          {NAV_LIST.map((nav) => {
            const items = productsGrouped[nav.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={nav.id} id={nav.id} className="scroll-mt-24">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
                      {nav.title}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-1 bg-[#0b132b] rounded-2xl p-6 flex flex-col justify-between shadow-lg h-[400px] relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                      <img
                        src={`/images/brands/${nav.id}.jpg`}
                        alt={nav.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b] via-[#0b132b]/80 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex-1 pt-4">
                      <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                        Thương hiệu
                      </span>
                      <h3 className="text-4xl font-black text-white mt-2 mb-4">
                        {nav.label}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Khám phá hệ sinh thái và các sản phẩm công nghệ đột phá
                        từ dòng {nav.label}.
                      </p>
                    </div>

                    <div className="relative z-10">
                      <Link
                        to={`/Category?keyword=${nav.id}`}
                        className="block w-full text-center bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white text-sm font-bold py-3 rounded-xl transition-colors"
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductsList;
