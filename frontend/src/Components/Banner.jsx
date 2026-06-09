import React, { useState, useEffect } from "react";
import { ShoppingBag, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatVND = (v) => {
  const num = Number(v);
  if (isNaN(num)) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(num) + " đ";
};

const SaleBanner = ({ products, loading }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!products || products.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [products]);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 15;
    const y = ((clientY - top) / height - 0.5) * 15;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };
  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6 py-12">
        <div className="w-full h-[450px] bg-slate-100 animate-pulse rounded-[3rem]"></div>
      </section>
    );
  }

  if (!products || !Array.isArray(products) || products.length === 0)
    return null;

  const product = products[currentIndex] || products[0];

  if (!product) return null;

  const displayPrice =
    product.salePrice || product.price || product.originalPrice || 0;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 py-12">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative w-full overflow-hidden rounded-[3rem] bg-[#0a0a0a] p-8 md:p-12 lg:p-16 shadow-[0_25px_80px_rgba(0,0,0,0.5)] min-h-[450px] flex items-center transition-all duration-300 border border-white/10"
      >
        <div className="absolute top-10 right-20 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

        {products.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-6 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 md:right-6 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/50 text-white backdrop-blur-sm border border-slate-100 opacity-30 transition-all duration-300 hover:opacity-100 hover:bg-white/70 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
        <div
          key={product.id}
          className="relative z-10 flex flex-col items-center gap-12 md:flex-row w-full animate-fade-in"
        >
          <div className="relative w-full md:w-1/2 flex justify-center perspective-1000">
            <div
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotateX(${-offset.y / 2}deg) rotateY(${offset.x / 2}deg)`,
                transition: "transform 0.1s ease-out",
              }}
              className="relative z-10 flex justify-center items-center w-full h-[300px]"
            >
              {product.secondaryImage && (
                <img
                  src={product.secondaryImage}
                  alt="Phone Accessory"
                  className="absolute left-1/4 w-[150px] h-auto object-contain transform -translate-x-1/2 z-20 drop-shadow-lg"
                />
              )}
              <img
                src={
                  product.mainImage ||
                  product.image ||
                  "/images/placeholder.jpg"
                }
                alt={product.name}
                className="relative w-auto max-w-[300px] md:max-w-[400px] h-full object-contain drop-shadow-xl z-10"
              />
            </div>
          </div>

          <div className="w-full space-y-6 text-center md:w-1/2 md:text-left text-white">
            <div className="space-y-3">
              <span className="inline-block px-4 py-1.5 bg-white/10 text-white border-white/20 backdrop-blur-md rounded-full text-sm font-semibold shadow-sm border border-slate-200">
                {product.badgeText || "🔥 BEST SELLER"}
              </span>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600 font-medium">
                <span className="text-xl text-yellow-500">
                  <Zap size={18} fill="currentColor" />
                </span>
                <span className="uppercase tracking-widest text-sm">
                  {product.subBadgeText || "DEAL BÁN CHẠY NHẤT"}
                </span>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase">
              {product.name}
            </h2>

            <div className="text-5xl font-black text-white">
              {formatVND(displayPrice)}
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate(`/product/detail/${product.id}`)}
                className="group mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50"
              >
                MUA NGAY
                <ShoppingBag
                  size={24}
                  className="transition-transform group-hover:rotate-12"
                />
              </button>
            </div>
          </div>
        </div>

        {products.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-10 bg-blue-500"
                    : "w-3 bg-slate-400 hover:bg-slate-300"
                }`}
                aria-label={`Chuyển đến slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `,
        }}
      />
    </section>
  );
};

export default SaleBanner;
