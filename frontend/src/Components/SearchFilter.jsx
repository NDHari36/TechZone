import React, { useState, useEffect, useRef } from "react";
import { Search, Loader } from "lucide-react";

export default function SearchFilter({ defaultKeyword = "", onSearch }) {
  const [keyword, setKeyword] = useState(defaultKeyword);

  const [brands, setBrands] = useState([]);

  // autocomplete states
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef(null);

  // fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(
          "https://techzone-api-wkxx.onrender.com/api/brands",
        );

        const data = await res.json();

        if (data.result) setBrands(data.result);
      } catch (err) {
        console.error("Lỗi lấy danh sách hãng:", err);
      }
    };

    fetchBrands();
  }, []);

  // click outside close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // realtime search
  useEffect(() => {
    const fetchSearch = async () => {
      if (!keyword.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        const token = localStorage.getItem("authToken");

        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(
          `https://techzone-api-wkxx.onrender.com/api/products?page=0&size=8&keyword=${encodeURIComponent(keyword)}`,
          { headers },
        );

        const data = await res.json();

        const products =
          data.result?.content || data.result?.data || data.result || [];

        setSearchResults(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSearch, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const submit = (e) => {
    e?.preventDefault();

    if (onSearch) {
      onSearch({
        keyword: keyword || "",
      });
    }

    setShowDropdown(false);
  };

  const handleSelectProduct = (product) => {
    setKeyword(product.name);

    if (onSearch) {
      onSearch({
        keyword: product.name,
      });
    }

    setShowDropdown(false);
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-4xl mx-auto"
      ref={searchRef}
    >
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search
            size={20}
            className="text-slate-400 group-focus-within:text-slate-900 transition-colors"
          />
        </div>

        <input
          aria-label="Từ khóa"
          placeholder="Bạn đang tìm sản phẩm gì?"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => keyword.trim() && setShowDropdown(true)}
          className="w-full pl-14 pr-32 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
        />

        <div className="absolute inset-y-2 right-2 flex items-center">
          <button
            type="submit"
            className="h-full px-8 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Tìm kiếm
          </button>
        </div>

        {/* autocomplete dropdown */}
        {showDropdown && (
          <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden">
            {isSearching ? (
              <div className="px-6 py-5 flex items-center gap-3 text-slate-500">
                <Loader size={18} className="animate-spin" />
                Đang tìm kiếm...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => {
                const price =
                  product.variants?.[0]?.price ||
                  product.min_price ||
                  product.price ||
                  0;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                  >
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-slate-900 truncate">
                        {product.name}
                      </h4>

                      <p className="text-red-600 font-black text-sm mt-1">
                        {Number(price).toLocaleString("vi-VN")} ₫
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-5 text-slate-500">
                Không tìm thấy sản phẩm "{keyword}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* brand suggestions */}
      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {brands.map((brand) => (
          <button
            key={brand.id}
            type="button"
            onClick={() => {
              setKeyword(brand.name);

              if (onSearch) {
                onSearch({
                  keyword: brand.name,
                });
              }
            }}
            className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors"
          >
            {brand.name}
          </button>
        ))}
      </div>
    </form>
  );
}
