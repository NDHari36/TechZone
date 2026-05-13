import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import ProductCard from "../Components/ProductCard";
import productApi from "../api/productApi";
import brandApi from "../api/brandApi";
import {
  Search,
  X,
  Laptop,
  Smartphone,
  Tablet,
  Cpu,
  Star,
  ArrowRight,
} from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Category() {
  const inputRef = useRef(null);
  const query = useQuery();
  const navigate = useNavigate();
  const suggestionRef = useRef(null);

  const keyword = query.get("keyword") || "";
  const brandParam = query.get("brand") || "";
  const minPriceParam = query.get("minPrice") || "";
  const maxPriceParam = query.get("maxPrice") || "";

  const [products, setProducts] = useState([]);
  const [dbBrands, setDbBrands] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterSort, setFilterSort] = useState(query.get("sort") || "");
  const [filterKeyword, setFilterKeyword] = useState(keyword);
  const [filterBrand, setFilterBrand] = useState(brandParam);
  const [filterMin, setFilterMin] = useState(minPriceParam);
  const [filterMax, setFilterMax] = useState(maxPriceParam);
  useEffect(() => {
    setFilterKeyword(keyword);
    setFilterBrand(brandParam);
    setFilterMin(minPriceParam);
    setFilterMax(maxPriceParam);
  }, [keyword, brandParam, minPriceParam, maxPriceParam]);

  useEffect(() => {
    brandApi.getAll().then((res) => res.result && setDbBrands(res.result));

    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getAll({
          keyword,
          brand: brandParam,
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
          limit: 48,
        });
        setProducts(data?.result || data?.data || []);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, brandParam, minPriceParam, maxPriceParam]);
  const applyFilters = (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (filterKeyword) params.set("keyword", filterKeyword);
    if (filterBrand) params.set("brand", filterBrand);
    if (filterMin) params.set("minPrice", filterMin);
    if (filterMax) params.set("maxPrice", filterMax);
    if (filterSort) params.set("sort", filterSort);
    navigate(`?${params.toString()}`);
  };

  const handleInputChange = async (e) => {
    const val = e.target.value;
    setFilterKeyword(val);
    if (val.length > 1) {
      try {
        const data = await productApi.getSuggestions(val);
        setSuggestions(data.result || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Lỗi fetch suggestions");
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handlePriceOption = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [min, max] = val.split("-");
    setFilterMin(min || "");
    setFilterMax(max || "");
  };

  const clearFilters = () => {
    setFilterKeyword("");
    setFilterBrand("");
    setFilterMin("");
    setFilterMax("");
    setFilterSort("");
    navigate("/Category");
  };

  const v = (keyword || brandParam).toLowerCase();
  const config = v.includes("mac")
    ? {
        title: "MacBook",
        sub: "Series",
        tag: "Pro",
        icon: <Laptop size={16} />,
        theme: "bg-slate-950 text-white",
        accent: "text-blue-400",
      }
    : v.includes("iphone")
      ? {
          title: "iPhone",
          sub: "Pro",
          tag: "Limitless",
          icon: <Smartphone size={16} />,
          theme: "bg-zinc-900 text-white",
          accent: "text-rose-500",
        }
      : {
          title: keyword || brandParam || "Store",
          sub: "",
          tag: "Discovery",
          icon: <Star size={16} />,
          theme: "bg-slate-100 text-slate-900",
          accent: "text-blue-600",
        };
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.min_price || a.price || 0;
    const priceB = b.min_price || b.price || 0;

    if (filterSort === "price,asc") return priceA - priceB;
    if (filterSort === "price,desc") return priceB - priceA;
    return 0;
  });
  return (
    <main className="min-h-screen bg-white pb-20 pt-24">
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div
          className={`relative overflow-hidden rounded-[3rem] ${config.theme} p-12 md:p-24`}
        >
          <div className="relative z-10 space-y-6">
            <div
              className={`inline-flex items-center gap-2 ${config.accent} font-black text-xs uppercase tracking-[0.4em]`}
            >
              {config.icon} {config.tag}
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8]">
              {config.title} <br />{" "}
              <span className="opacity-20">{config.sub}</span>
            </h1>
          </div>
          <div
            className={`absolute -right-20 -top-20 w-[500px] h-[500px] opacity-20 blur-[120px] rounded-full ${config.accent.replace("text", "bg")}`}
          ></div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 mb-16">
        <form
          onSubmit={applyFilters}
          className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 relative overflow-visible"
        >
          {(keyword || brandParam || minPriceParam || maxPriceParam) && (
            <div className="absolute -top-10 right-0 z-20">
              <button
                type="button"
                onClick={clearFilters}
                className="text-[20px] font-black text-slate-900 hover:text-red-600 uppercase tracking-[0.2em] transition-colors flex items-center gap-1 p-2"
              >
                <X size={20} className="text-red-600" strokeWidth={4} />
                XÓA BỘ LỌC
              </button>
            </div>
          )}
          <div className="flex flex-col xl:flex-row gap-4 relative">
            <div className="relative flex-1" ref={suggestionRef}>
              {filterKeyword && filterKeyword.trim() !== "" && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 
               bg-gradient-to-r from-blue-600 to-indigo-600 
               text-white px-6 py-3 rounded-full 
               text-sm font-bold uppercase tracking-widest 
               shadow-md shadow-blue-200
               hover:shadow-lg hover:scale-105 
               active:scale-95 transition-all duration-200"
                >
                  Tìm
                </button>
              )}
              <input
                ref={inputRef}
                value={filterKeyword}
                onChange={handleInputChange}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="Tìm kiếm sản phẩm rõ nét..."
                className="w-full pl-5 pr-20 py-5 bg-slate-50 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 text-lg outline-none focus:ring-2 focus:ring-slate-900"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden shadow-slate-200">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setFilterKeyword(s.name);
                        setShowSuggestions(false);
                        navigate(`?keyword=${s.name}`);
                      }}
                      className="px-6 py-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between group border-b border-slate-50 last:border-none"
                    >
                      <span className="font-bold text-slate-700 group-hover:text-black">
                        {s.name}
                      </span>
                      <ArrowRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 text-blue-600 transition-all"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="xl:w-64 px-6 py-5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest outline-none cursor-pointer"
            >
              <option value="">TẤT CẢ HÃNG</option>
              {dbBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {" "}
            <select
              onChange={handlePriceOption}
              className="px-4 py-4 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase outline-none cursor-pointer"
            >
              <option value="">KHOẢNG GIÁ NHANH</option>
              <option value="0-10000000">Dưới 10 Triệu</option>
              <option value="10000000-30000000">10 - 30 Triệu</option>
              <option value="30000000-">Trên 30 Triệu</option>
            </select>
            <select
              value={filterSort}
              onChange={(e) => {
                setFilterSort(e.target.value);
                const params = new URLSearchParams(window.location.search);
                if (e.target.value) params.set("sort", e.target.value);
                else params.delete("sort");
                navigate(`?${params.toString()}`);
              }}
              className="px-4 py-4 bg-slate-50 rounded-xl text-[10px] font-black text-slate-900 uppercase outline-none cursor-pointer border border-transparent focus:border-blue-500"
            >
              <option value="">SẮP XẾP THEO</option>
              <option value="price,asc">Giá: Thấp đến Cao</option>
              <option value="price,desc">Giá: Cao đến Thấp</option>
            </select>
            <input
              type="number"
              value={filterMin}
              onChange={(e) => setFilterMin(e.target.value)}
              placeholder="GIÁ TỪ"
              className="px-4 py-4 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-slate-900"
            />
            <input
              type="number"
              value={filterMax}
              onChange={(e) => setFilterMax(e.target.value)}
              placeholder="ĐẾN GIÁ"
              className="px-4 py-4 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-slate-900"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
            >
              ÁP DỤNG
            </button>
          </div>
        </form>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-slate-100 rounded-[2.5rem]"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {sortedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Category;
