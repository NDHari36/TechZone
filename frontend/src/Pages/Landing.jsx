import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import productApi from "../api/productApi";
import SaleBanner from "../Components/Banner";

function Landing() {
  const [heroProducts, setHeroProducts] = useState([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchHeroData = async () => {
      setLoadingHero(true);
      try {
        const data = await productApi.getHeroSale();
        const formattedProducts =
          data?.result?.map((item) => {
            const rawImage = item.image_url || item.thumbnailUrl || item.image;
            let finalImage = "/images/logo.png";
            if (rawImage) {
              finalImage = rawImage.startsWith("http")
                ? rawImage
                : `http://localhost:8081${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
            }
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              originalPrice: Number(item.originalPrice) || 0,
              salePrice: Number(item.originalPrice) || 0,
              sold_count: Number(item.sold_count) || 0,
              image: finalImage,
            };
          }) || [];
        setHeroProducts(formattedProducts);
      } catch (err) {
        console.error("Lỗi tải banner sale:", err);
        setHeroProducts([]);
      } finally {
        setLoadingHero(false);
      }
    };
    fetchHeroData();
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative min-h-[80vh] hero-bg flex items-center overflow-hidden">
        <div
          className="hero-pattern absolute inset-0 z-0 pointer-events-none opacity-40"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-6xl px-6 py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">
                Chào mừng đến với <br />
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent font-Bebas tracking-wider italic">
                  TechZone
                </span>
              </h1>
              <p className="text-xl text-slate-600 max-w-md font-medium">
                Cửa hàng công nghệ tinh giản — trải nghiệm mua sắm nhanh chóng,
                dịch vụ tận tâm.
              </p>

              <div className="flex items-center gap-4 pt-4">
                <Link
                  to="/store"
                  className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                >
                  Mua sắm ngay
                </Link>
                <a
                  href="#features"
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  Tìm hiểu thêm ↓
                </a>
              </div>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-orange-500/10 blur-3xl rounded-full"></div>

              <img
                src="/images/logo.png"
                alt="SopPings Hero"
                className="relative z-10 w-full h-[500px] object-cover rounded-[3rem] shadow-2xl border border-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-10 md:-mt-20">
        <SaleBanner products={heroProducts} loading={loadingHero} />
      </div>

      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group space-y-4 text-center p-8 rounded-3xl hover:bg-slate-50 transition-colors">
              <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                Tuyển chọn
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Sản phẩm được lựa chọn theo tiêu chí chất lượng và thiết kế tinh
                tế nhất.
              </p>
            </div>

            <div className="group space-y-4 text-center p-8 rounded-3xl hover:bg-slate-50 transition-colors">
              <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                Giao nhanh
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Hệ thống vận chuyển tối ưu, nhận hàng ngay trong ngày tại nội
                thành.
              </p>
            </div>

            <div className="group space-y-4 text-center p-8 rounded-3xl hover:bg-slate-50 transition-colors">
              <div className="mx-auto w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                Tận tâm
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Chính sách đổi trả linh hoạt và bảo hành chính hãng chuẩn 5 sao.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">
                Bắt đầu khám phá <br /> thế giới công nghệ
              </h2>
              <p className="text-slate-400 mb-10 text-lg max-w-2xl mx-auto">
                Duyệt qua danh mục sản phẩm hoặc tìm theo thương hiệu yêu thích
                của bạn ngay hôm nay.
              </p>
              <Link
                to="/store"
                className="inline-block bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all"
              >
                VÀO CỬA HÀNG ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `,
        }}
      />
    </main>
  );
}

export default Landing;
