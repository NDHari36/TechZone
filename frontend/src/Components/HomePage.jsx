import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProductsList from "./ProductcsList";
import SearchFilter from "./SearchFilter";
import { ShieldCheck, Truck, Headset, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [tiles, setTiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          "http://localhost:8081/api/products?page=0&size=100",
          { headers },
        );
        const data = await res.json();
        const all = data.result?.content || data.result || [];

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
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans">
      <div className="h-24"></div>

      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          {
            title: "Tuyển chọn",
            desc: "Sản phẩm đạt tiêu chuẩn chất lượng cao nhất.",
            Icon: ShieldCheck,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            title: "Giao nhanh",
            desc: "Nhận máy ngay trong ngày tại nội thành.",
            Icon: Truck,
            color: "text-slate-700",
            bg: "bg-slate-100",
          },
          {
            title: "Hỗ trợ tận tâm",
            desc: "Chuyên viên sẵn sàng giải đáp 24/7.",
            Icon: Headset,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="group p-10 bg-white border border-slate-50 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-500"
          >
            <div
              className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
            >
              <item.Icon size={28} />
            </div>
            <h4 className="text-2xl font-black tracking-tight mb-2 uppercase">
              {item.title}
            </h4>
            <p className="text-slate-500 font-medium leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      <section className="w-full py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-10 overflow-x-auto pb-12 no-scrollbar md:justify-center items-center">
            {tiles.map((tile) => (
              <Link
                key={tile.key}
                to={`/Category?keyword=${encodeURIComponent(tile.key)}`}
                className="group flex-shrink-0 text-center"
              >
                <div className="mx-auto w-32 h-32 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-2 flex items-center justify-center p-6">
                  {" "}
                  <img
                    src={tile.image}
                    alt={tile.title}
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="mt-5 text-sm font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">
                  {" "}
                  {tile.title}
                </div>
              </Link>
            ))}
          </div>

          <div className="max-w-5xl mx-auto bg-white p-4 rounded-[2.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-slate-100">
            {" "}
            <SearchFilter
              onSearch={(p) => navigate(`/Category?keyword=${p.keyword || ""}`)}
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center gap-6 mb-16">
          <h3 className="text-4xl font-black tracking-tighter uppercase italic">
            Sản phẩm nổi bật
          </h3>
          <div className="h-[2px] flex-1 bg-slate-50"></div>
          <button
            type="button"
            onClick={() => navigate("/Category")}
            className="text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors"
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
    </div>
  );
}
