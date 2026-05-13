import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchFilter({ defaultKeyword = "", onSearch }) {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/brands");
        const data = await res.json();
        if (data.result) setBrands(data.result);
      } catch (err) {
        console.error("Lỗi lấy danh sách hãng:", err);
      }
    };
    fetchBrands();
  }, []);

  const submit = (e) => {
    e?.preventDefault();
    if (onSearch) onSearch({ keyword: keyword || "" });
  };

  return (
    <form onSubmit={submit} className="w-full max-w-4xl mx-auto">
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
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest self-center">
          Gợi ý:
        </span>
        {brands.map((brand) => (
          <button
            key={brand.id}
            type="button"
            onClick={() => {
              setKeyword(brand.name);
              if (onSearch) onSearch({ keyword: brand.name });
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
