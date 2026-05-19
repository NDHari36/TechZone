import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CompareContext } from "./CompareContext";
import { X, Plus, Search as SearchIcon, Loader } from "lucide-react";

export default function CompareBar() {
  const {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    showBar,
    markAsCompared,
  } = useContext(CompareContext);
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [brands, setBrands] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!keyword.trim()) {
        const fetchDefault = async () => {
          try {
            const first = compareList?.[0];

            const fallbackKeyword =
              first?.category?.name || first?.brand?.name || first?.name || "";

            const token = localStorage.getItem("authToken");
            const headers = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(
              `https://techzone-api-wkxx.onrender.com/api/products?page=0&size=20&keyword=${encodeURIComponent(
                fallbackKeyword,
              )}`,
              { headers },
            );

            const data = await res.json();
            const products =
              data.result?.content || data.result?.data || data.result || [];

            setSearchResults(Array.isArray(products) ? products : []);
            setShowDropdown(true);
          } catch (err) {
            console.error("Lỗi load default products:", err);
            setSearchResults([]);
          }
        };

        fetchDefault();
        return;
      }
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const token = localStorage.getItem("authToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `https://techzone-api-wkxx.onrender.com/api/products?page=0&size=20&keyword=${encodeURIComponent(keyword)}`,
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
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  if (
    !showBar ||
    !compareList ||
    compareList.length === 0 ||
    !location.pathname.includes("/product/detail")
  ) {
    return null;
  }

  const slots = [0, 1, 2];

  const handleAddProduct = (product) => {
    const formattedProduct = {
      ...product,
      image:
        product.thumbnailUrl ||
        product.images?.[0]?.image_url ||
        product.image_url ||
        product.image ||
        "/images/img.jpg",
      price:
        product.variants?.[0]?.price || product.min_price || product.price || 0,
    };
    addToCompare(formattedProduct);
    setIsSearchOpen(false);
    setKeyword("");
    setShowDropdown(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-[0_-5px_20px_rgba(0,0,0,0.15)] z-[900] flex justify-center py-4 animate-slideUp">
        <div className="max-w-5xl w-full flex items-center px-4">
          <div className="flex flex-1 items-stretch justify-between pr-6 border-r border-gray-200">
            {slots.map((index) => {
              const product = compareList[index];
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center justify-center relative px-2"
                >
                  {product ? (
                    <>
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-0 right-4 text-gray-400 hover:text-red-500 font-bold transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <img
                        src={product.image}
                        alt=""
                        className="h-12 object-contain mb-2"
                      />
                      <p className="text-[13px] font-medium text-center text-gray-700 line-clamp-2 px-2">
                        {product.name}
                      </p>
                    </>
                  ) : (
                    <div
                      onClick={() => setIsSearchOpen(true)}
                      className="flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      <div className="h-12 w-12 border border-dashed border-gray-300 flex items-center justify-center rounded mb-2">
                        <Plus size={24} className="text-gray-300" />
                      </div>
                      <span className="text-[13px]">Thêm sản phẩm</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-56 flex flex-col items-center justify-center pl-6">
            <button
              onClick={() => {
                markAsCompared();
                localStorage.setItem("hasCompared", "true");
                navigate("/compare");
              }}
              disabled={compareList.length < 2}
              className={`w-full py-2.5 rounded font-bold text-[15px] mb-2 transition-colors ${
                compareList.length >= 2
                  ? "bg-[#288ad6] text-white hover:bg-blue-600 shadow-sm"
                  : "bg-gray-300 text-white cursor-not-allowed"
              }`}
            >
              So sánh ngay
            </button>
            <button
              onClick={clearCompare}
              className="text-[14px] text-[#288ad6] hover:text-blue-700"
            >
              Xóa tất cả sản phẩm
            </button>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-start justify-center pt-[8vh] px-4 font-sans">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="relative p-8 pb-6 border-b border-slate-100">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-full p-2"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-black text-center text-slate-900 uppercase tracking-tight mb-8">
                Tìm sản phẩm so sánh
              </h3>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="w-full max-w-2xl mx-auto"
                ref={searchRef}
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <SearchIcon
                      size={20}
                      className="text-slate-400 group-focus-within:text-slate-900 transition-colors"
                    />
                  </div>

                  <input
                    autoFocus
                    aria-label="Từ khóa"
                    placeholder="Bạn đang tìm sản phẩm gì?"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onFocus={() => keyword.trim() && setShowDropdown(true)}
                    className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                  />

                  <div className="absolute inset-y-2 right-2 flex items-center">
                    <button
                      type="submit"
                      className="h-full px-8 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                      Tìm kiếm
                    </button>
                  </div>

                  {showDropdown && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-64 overflow-y-auto py-2">
                      {isSearching ? (
                        <div className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                          <Loader
                            size={16}
                            className="animate-spin text-slate-400"
                          />{" "}
                          Đang tìm kiếm...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((prod) => {
                          const isAdded = compareList.find(
                            (item) => item.id === prod.id,
                          );
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => !isAdded && handleAddProduct(prod)}
                              className={`w-full text-left px-6 py-3 text-[15px] font-semibold transition-colors flex items-center justify-between border-b border-slate-50 last:border-0 ${
                                isAdded
                                  ? "text-slate-400 bg-slate-50 cursor-not-allowed"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                              }`}
                            >
                              <span className="truncate">{prod.name}</span>
                              {isAdded && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ml-3">
                                  Đã chọn
                                </span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-6 py-4 text-sm text-slate-500">
                          Không tìm thấy sản phẩm "{keyword}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => {
                        setKeyword(brand.name);
                        setShowDropdown(true);
                      }}
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center p-10 gap-3">
                  <Loader className="animate-spin text-slate-400" size={36} />
                  <span className="text-slate-500 font-medium">
                    Đang tìm kiếm...
                  </span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((prod) => {
                    const isAdded = compareList.find(
                      (item) => item.id === prod.id,
                    );
                    const prodImage =
                      prod.thumbnailUrl ||
                      prod.images?.[0]?.image_url ||
                      prod.image_url ||
                      prod.image ||
                      "/images/img.jpg";
                    const prodPrice =
                      prod.variants?.[0]?.price ||
                      prod.min_price ||
                      prod.price ||
                      0;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => !isAdded && handleAddProduct(prod)}
                        className={`flex items-center gap-5 p-5 rounded-3xl transition-all border bg-white ${
                          isAdded
                            ? "opacity-50 cursor-not-allowed border-slate-200 shadow-none"
                            : "border-white shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer group"
                        }`}
                      >
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 border border-slate-50">
                          <img
                            src={prodImage}
                            alt={prod.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight mb-1">
                            {prod.name}
                          </h4>
                          <p className="text-red-600 font-black text-[15px]">
                            {Number(prodPrice).toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                        {isAdded ? (
                          <span className="text-[10px] font-black text-slate-400 border-2 border-slate-200 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                            Đã chọn
                          </span>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                            <Plus size={20} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : keyword ? (
                <div className="p-16 text-center text-slate-500 font-medium text-lg">
                  Không tìm thấy sản phẩm "{keyword}"
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 font-medium text-lg">
                  Bạn có thể tìm kiếm theo tên máy hoặc chọn gợi ý bên trên.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
