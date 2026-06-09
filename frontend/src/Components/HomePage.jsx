import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProductsList from "./ProductcsList";
import SearchFilter from "./SearchFilter";
import SaleBanner from "./Banner";
import { ShieldCheck, Truck, Headset, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [tiles, setTiles] = useState([]);
  const [bannerProducts, setBannerProducts] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        setBannerLoading(true);
        const token = localStorage.getItem("authToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/products?page=0&size=100`, {
          headers,
        });
        const data = await res.json();
        const all = data.result?.content || data.result || [];

        // Map 4 sản phẩm đầu làm Banner nổi bật
        const bannerMapped = all.slice(0, 4).map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image_url || p.thumbnailUrl || p.image,
          price: p.min_price || p.price || 0,
          badgeText: p.total_stock > 10 ? "🔥 HOT DEAL" : "⚡ GIỚI HẠN",
          subBadgeText: p.brand_name || "THƯƠNG HIỆU ĐƯỢC YÊU THÍCH",
        }));
        setBannerProducts(bannerMapped);

        const keys = [
          {
            key: "iphone",
            title: "iPhone",
            image: "/images/Iphone.jpg",
          },
          {
            key: "apple",
            title: "Apple",
            image: "./images/Apple.jpg",
          },
          { key: "mac", title: "Mac", image: "/images/Mac.jpg" },
          { key: "ipad", title: "iPad", image: "/images/Ipad.jpg" },
          {
            key: "samsung",
            title: "Samsung",
            image: "/images/samsung.jpeg",
          },
          {
            key: "watch",
            title: "Watch",
            image: "/images/watch.png",
          },
          {
            key: "airpod",
            title: "AirPods",
            image: "./images/Airpods.jpg",
          },
        ];

        setTiles(keys);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setBannerLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans">
      <div className="h-20"></div>

      {/* Hero Sale Banner nổi bật */}
      <SaleBanner products={bannerProducts} loading={bannerLoading} />

      {/* Danh mục & Tìm kiếm */}
      <section className="w-full py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto pb-12 no-scrollbar md:justify-center items-center">
            {tiles.map((tile) => (
              <Link
                key={tile.key}
                to={`/Category?keyword=${encodeURIComponent(tile.key)}`}
                className="group flex-shrink-0 text-center"
              >
                <div className="mx-auto w-32 h-32 group-hover:scale-105 group-hover:shadow-xl rounded-[2rem] bg-white border border-slate-100 shadow-lg transition-all duration-500 group-hover:border-blue-500/50 group-hover:-translate-y-2 flex items-center justify-center p-5">
                  <img
                    src={tile.image}
                    alt={tile.title}
                    className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-500"
                    onError={(e) => {
                      e.target.style.opacity = 0.5;
                    }}
                  />
                </div>
                <div className="mt-4 text-xs font-black text-slate-500 group-hover:text-blue-600 uppercase tracking-[0.2em] transition-colors">
                  {tile.title}
                </div>
              </Link>
            ))}
          </div>

          <div className="max-w-5xl mx-auto bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <SearchFilter
              onSearch={(p) => navigate(`/Category?keyword=${p.keyword || ""}`)}
            />
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <main className="max-w-7xl mx-auto px-6 py-12 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 my-10">
        <div className="flex items-center gap-6 mb-12">
          <h3 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900">
            Sản phẩm nổi bật
          </h3>
          <div className="h-[1px] flex-1 bg-slate-200"></div>
          <button
            type="button"
            onClick={() => navigate("/Category")}
            className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-blue-600 font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors"
          >
            TẤT CẢ <ArrowRight size={16} />
          </button>
        </div>
        <ProductsList />
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
      {/* Dịch vụ cam kết */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold uppercase tracking-[0.3em]">
              CAM KẾT TỪ TECHZONE
            </span>

            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Mua sắm công nghệ an tâm hơn
            </h2>

            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
              Chúng tôi tập trung vào chất lượng sản phẩm, tốc độ giao hàng và
              trải nghiệm hỗ trợ khách hàng tốt nhất.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Tuyển chọn",
                desc: "Sản phẩm đạt tiêu chuẩn chất lượng cao nhất.",
                Icon: ShieldCheck,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-200",
              },
              {
                title: "Giao nhanh",
                desc: "Nhận máy ngay trong ngày tại nội thành.",
                Icon: Truck,
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-200",
              },
              {
                title: "Hỗ trợ tận tâm",
                desc: "Chuyên viên sẵn sàng giải đáp 24/7.",
                Icon: Headset,
                color: "text-orange-600",
                bg: "bg-orange-50",
                border: "border-orange-200",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group p-8 bg-white border ${item.border}
          rounded-[2rem] shadow-md hover:shadow-xl
          hover:-translate-y-2 transition-all duration-500`}
              >
                <div
                  className={`w-16 h-16 ${item.bg} ${item.color}
            rounded-2xl flex items-center justify-center mb-6
            group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.Icon size={30} />
                </div>

                <h4 className="text-xl font-black uppercase text-slate-900 mb-3">
                  {item.title}
                </h4>

                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
