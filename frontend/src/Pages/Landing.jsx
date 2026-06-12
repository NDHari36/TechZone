import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Truck, Headset } from "lucide-react";
import productApi from "../api/productApi";
import SaleBanner from "../Components/Banner";

function Landing() {
  const [heroProducts, setHeroProducts] = useState([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchHeroData = async () => {
      setLoadingHero(true);
      try {
        const data = await productApi.getHeroSale();
        const formattedProducts =
          data?.result?.map((item) => {
            const rawImage = item.image_url || item.thumbnailUrl || item.image;
            let finalImage = "../images/logo.jpg";
            if (rawImage) {
              finalImage = rawImage.startsWith("https")
                ? rawImage
                : `${API_BASE_URL}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
            }
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              originalPrice: Number(item.originalPrice) || 0,
              salePrice: Number(item.originalPrice) || 0,
              sold_count: Number(item.sold_count) || 0,
              image: finalImage,
              brand_name: item.brand_name || item.brandName || "Thương hiệu",
              total_stock: Number(item.total_stock) || 0,
              default_variant_id:
                item.default_variant_id || item.variant_id || item.id,
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
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <section className="relative min-h-[80vh] bg-white flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-0"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-6 py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter text-slate-900">
                {/* Chào mừng đến với <br /> */}
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
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Mua sắm ngay
                </Link>
                <a
                  href="#features"
                  className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-blue-600 font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors"
                >
                  Tìm hiểu thêm ↓
                </a>
              </div>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-orange-500/10 blur-3xl rounded-full"></div>

              <img
                src="../../public/images/logo.jpg"
                alt="Logo TechZone"
                className="relative z-10 object-contain rounded-[3rem] shadow-2xl border border-gray-800"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="relative z-20 -mt-10 md:-mt-20">
        <SaleBanner products={heroProducts} loading={loadingHero} />
      </div>
      <section id="features" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
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

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tuyển chọn */}
            <div className="group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3">
                Tuyển chọn
              </h3>

              <p className="text-slate-600 leading-relaxed">
                Mỗi sản phẩm đều được kiểm tra kỹ lưỡng về chất lượng, nguồn gốc
                và chế độ bảo hành trước khi đến tay khách hàng.
              </p>
            </div>

            {/* Giao nhanh */}
            <div className="group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <Truck size={28} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3">
                Giao nhanh
              </h3>

              <p className="text-slate-600 leading-relaxed">
                Xử lý đơn hàng nhanh chóng với hệ thống vận chuyển tối ưu, giúp
                bạn nhận sản phẩm trong thời gian sớm nhất.
              </p>
            </div>

            {/* Tận tâm */}
            <div className="group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                <Headset size={28} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3">
                Hỗ trợ tận tâm
              </h3>

              <p className="text-slate-600 leading-relaxed">
                Đội ngũ tư vấn luôn sẵn sàng hỗ trợ trước và sau khi mua, đảm
                bảo trải nghiệm tốt nhất cho khách hàng.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="bg-gradient-to-br from-[#0c1c38] to-black rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">
                Bắt đầu khám phá <br /> thế giới công nghệ
              </h2>
              <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
                Duyệt qua danh mục sản phẩm hoặc tìm theo thương hiệu yêu thích
                của bạn ngay hôm nay.
              </p>
              <Link
                to="/store"
                className="inline-block bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
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
        .hero-bg { 
          background-image: url("https://images.unsplash.com/photo-1510511459019-5dde7724fd8a?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .hero-pattern {
          background-image: radial-gradient(at 20% 20%, rgba(200, 200, 255, 0.1), transparent 50%),
                          radial-gradient(at 80% 80%, rgba(255, 200, 200, 0.1), transparent 50%);
        }
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
