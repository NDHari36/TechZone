import { useContext, useEffect, useState, useRef } from "react";
import { CompareContext } from "../Components/CompareContext";
import productApi from "../api/productApi";
import {
  Loader,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Plus,
  Search as SearchIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Compare() {
  const { compareList, addToCompare, removeFromCompare } =
    useContext(CompareContext);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [brands, setBrands] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const [openGroups, setOpenGroups] = useState({
    "SO SÁNH NHANH": true,
    "Cấu hình & Bộ nhớ": false,
    "Camera & Màn hình": false,
    "Pin & Sạc": false,
    "Tiện ích": false,
    "Kết nối": false,
    "Thiết kế & Chất liệu": false,
  });

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  useEffect(() => {
    const fetchCompareData = async () => {
      setLoading(true);
      try {
        const requests = compareList.map((item) => productApi.getById(item.id));
        const responses = await Promise.all(requests);
        setProductsData(responses.map((res) => res.result || res));
      } catch (error) {
        console.error("Lỗi lấy data so sánh:", error);
      } finally {
        setLoading(false);
      }
    };

    if (compareList.length > 0) {
      fetchCompareData();
    } else {
      setProductsData([]);
      setLoading(false);
    }
  }, [compareList]);

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
        setSearchResults([]);
        setShowDropdown(false);
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
    addToCompare(formattedProduct, true);
    setIsSearchOpen(false);
    setKeyword("");
    setShowDropdown(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader className="animate-spin inline-block mr-2" /> Đang tải thông
        số...
      </div>
    );

  if (productsData.length === 0 && !isSearchOpen)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="p-10 bg-white rounded-2xl shadow-sm text-center border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Chưa có sản phẩm
          </h2>
          <p className="text-gray-500 mb-6">
            Bạn chưa chọn sản phẩm nào để so sánh.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/store")}
              className="px-6 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Về trang sản phẩm
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>
    );

  const GROUP_ORDER = [
    "Cấu hình & Bộ nhớ",
    "Camera & Màn hình",
    "Pin & Sạc",
    "Tiện ích",
    "Kết nối",
    "Thiết kế & Chất liệu",
  ];

  const SPEC_ITEM_ORDER = [
    "Hệ điều hành",
    "Chip xử lý (CPU)",
    "Tốc độ CPU",
    "Chip đồ họa (GPU)",
    "RAM",
    "Dung lượng lưu trữ",
    "Độ phân giải camera sau",
    "Tính năng camera sau",
    "Độ phân giải camera trước",
    "Công nghệ màn hình",
    "Độ phân giải màn hình",
    "Màn hình rộng",
    "Dung lượng pin",
    "Loại pin",
    "Hỗ trợ sạc tối đa",
    "Thiết kế",
    "Chất liệu",
    "Kích thước, khối lượng",
  ];

  const globalGroups = {};

  productsData.forEach((prod) => {
    const variant = prod.variants?.[0] || {};
    const specs = variant.product_variant_specs || prod.specs || [];

    if (variant.ram)
      specs.push({
        group_name: "Cấu hình & Bộ nhớ",
        name: "RAM",
        value_text: variant.ram,
      });
    if (variant.storage)
      specs.push({
        group_name: "Cấu hình & Bộ nhớ",
        name: "Dung lượng lưu trữ",
        value_text: variant.storage,
      });

    specs.forEach((spec) => {
      const rawGroup = String(spec.group_name || "Thông số khác").trim();
      const matchedGroup =
        GROUP_ORDER.find((go) => go.toLowerCase() === rawGroup.toLowerCase()) ||
        rawGroup;
      const specName = String(spec.name || "").trim();

      if (!globalGroups[matchedGroup]) globalGroups[matchedGroup] = new Set();
      globalGroups[matchedGroup].add(specName);
    });
  });

  const sortedGroupNames = Object.keys(globalGroups).sort((a, b) => {
    const idxA = GROUP_ORDER.indexOf(a);
    const idxB = GROUP_ORDER.indexOf(b);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const sortedGlobalGroups = {};
  sortedGroupNames.forEach((gName) => {
    sortedGlobalGroups[gName] = Array.from(globalGroups[gName]).sort((a, b) => {
      let idxA = SPEC_ITEM_ORDER.indexOf(a);
      let idxB = SPEC_ITEM_ORDER.indexOf(b);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });
  });

  const getQuickCompareData = (prod) => {
    const variant = prod.variants?.[0] || {};
    const specs = variant.product_variant_specs || prod.specs || [];
    const findSpec = (nameKeywords) => {
      const found = specs.find((s) =>
        nameKeywords.some((k) =>
          s.name?.toLowerCase().includes(k.toLowerCase()),
        ),
      );
      return found ? `${found.value_text} ${found.unit || ""}`.trim() : null;
    };

    const bullets = [];
    const screenTech = findSpec(["Công nghệ màn hình"]);
    const screenSize = findSpec(["Màn hình rộng", "Kích thước màn hình"]);
    if (screenTech || screenSize)
      bullets.push(
        `Màn hình: ${[screenTech, screenSize].filter(Boolean).join(", ")}`,
      );
    const cpu = findSpec(["Chip xử lý", "CPU"]);
    if (cpu) bullets.push(`Chip: ${cpu}`);
    if (variant.ram) bullets.push(`RAM: ${variant.ram}`);
    if (variant.storage) bullets.push(`Dung lượng: ${variant.storage}`);
    const camSau = findSpec(["camera sau"]);
    if (camSau) bullets.push(`Camera sau: ${camSau}`);
    const camTruoc = findSpec(["camera trước"]);
    if (camTruoc) bullets.push(`Camera trước: ${camTruoc}`);
    const battery = findSpec(["Dung lượng pin", "Pin"]);
    const charge = findSpec(["Hỗ trợ sạc", "Sạc"]);
    if (battery || charge)
      bullets.push(`Pin: ${[battery, charge].filter(Boolean).join(", ")}`);

    return bullets;
  };

  const getSpecValue = (prod, groupName, specName) => {
    const variant = prod.variants?.[0] || {};
    if (specName === "RAM" && variant.ram) return variant.ram;
    if (specName === "Dung lượng lưu trữ" && variant.storage)
      return variant.storage;

    const specs = variant.product_variant_specs || prod.specs || [];
    const found = specs.find((s) => {
      const matchGroup =
        (s.group_name || "Thông số khác").toLowerCase() ===
        groupName.toLowerCase();
      const matchName = (s.name || "").toLowerCase() === specName.toLowerCase();
      return matchGroup && matchName;
    });
    return found ? `${found.value_text} ${found.unit || ""}`.trim() : "-";
  };

  return (
    <>
      <main className="max-w-[1200px] mx-auto px-4 py-10 bg-white min-h-screen mb-20">
        <h1 className="text-3xl font-black mb-8 text-gray-900">
          SO SÁNH SẢN PHẨM
        </h1>

        {productsData.length > 0 && (
          <div className="border-t border-l border-gray-200 rounded-tl-xl overflow-hidden shadow-sm">
            <div className="flex bg-white">
              <div className="w-[250px] flex-shrink-0 border-r border-b border-gray-200 p-4 flex items-end">
                <span className="text-gray-400 text-sm font-medium italic">
                  Thông số kỹ thuật
                </span>
              </div>

              {productsData.map((prod) => (
                <div
                  key={prod.id}
                  className="flex-1 min-w-[250px] border-r border-b border-gray-200 relative p-6 flex flex-col items-center text-center bg-white group"
                >
                  <button
                    onClick={() => removeFromCompare(prod.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1.5 transition-colors"
                    title="Xóa khỏi so sánh"
                  >
                    <X size={18} />
                  </button>

                  <div className="w-40 h-40 mb-4 flex items-center justify-center">
                    <img
                      src={
                        prod.images?.[0]?.image_url ||
                        prod.thumbnailUrl ||
                        "/images/img.jpg"
                      }
                      alt={prod.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-[15px] mb-2 h-10 line-clamp-2 leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xl font-black text-red-600 mb-4">
                    {Number(
                      prod.variants?.[0]?.price ||
                        prod.min_price ||
                        prod.price ||
                        0,
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </p>
                  <button
                    onClick={() => navigate(`/product/detail/${prod.id}`)}
                    className="mt-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 w-full transition-colors"
                  >
                    Mua ngay
                  </button>
                </div>
              ))}

              {[...Array(3 - productsData.length)].map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  onClick={() => setIsSearchOpen(true)}
                  className="flex-1 min-w-[250px] border-r border-b border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-400 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                >
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 group-hover:border-blue-300 rounded-full flex items-center justify-center mb-3 transition-colors">
                    <Plus
                      size={24}
                      className="text-gray-400 group-hover:text-blue-500"
                    />
                  </div>
                  <span className="text-sm font-bold">Thêm sản phẩm</span>
                </div>
              ))}
            </div>

            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleGroup("SO SÁNH NHANH")}
                className="w-full flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {openGroups["SO SÁNH NHANH"] ? (
                  <ChevronUp size={20} className="text-gray-500 mr-2" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500 mr-2" />
                )}
                <span className="font-black text-[15px] uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  SO SÁNH NHANH{" "}
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                </span>
              </button>

              {openGroups["SO SÁNH NHANH"] && (
                <div className="flex bg-white">
                  <div className="w-[250px] flex-shrink-0 border-r border-gray-200 p-4 py-6 bg-white">
                    <span className="text-gray-700 font-medium">
                      So sánh nhanh
                    </span>
                  </div>

                  {productsData.map((prod) => {
                    const bullets = getQuickCompareData(prod);
                    return (
                      <div
                        key={prod.id}
                        className="flex-1 min-w-[250px] border-r border-gray-200 p-6"
                      >
                        <ul className="space-y-4">
                          {bullets.map((bullet, idx) => (
                            <li
                              key={idx}
                              className="flex items-start text-sm text-gray-700"
                            >
                              <span className="mr-2 mt-0.5 text-gray-400">
                                •
                              </span>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: bullet.replace(
                                    /^(.*?):/,
                                    "<strong>$1:</strong>",
                                  ),
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}

                  {[...Array(3 - productsData.length)].map((_, idx) => (
                    <div
                      key={`empty-quick-${idx}`}
                      className="flex-1 min-w-[250px] border-r border-gray-200 bg-gray-50"
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {sortedGroupNames.map((groupName) => {
              const isOpen = openGroups[groupName];
              const specNames = sortedGlobalGroups[groupName];

              return (
                <div key={groupName} className="border-b border-gray-200">
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="w-full flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {isOpen ? (
                      <ChevronUp size={20} className="text-gray-500 mr-2" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500 mr-2" />
                    )}
                    <span className="font-black text-[15px] uppercase tracking-wider text-gray-900">
                      {groupName}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="bg-white">
                      {specNames.map((specName, specIdx) => (
                        <div
                          key={specIdx}
                          className={`flex ${specIdx !== specNames.length - 1 ? "border-b border-gray-100" : ""}`}
                        >
                          <div className="w-[250px] flex-shrink-0 border-r border-gray-200 p-4">
                            <span className="text-gray-700 text-[14px]">
                              {specName}
                            </span>
                          </div>

                          {productsData.map((prod) => (
                            <div
                              key={prod.id}
                              className="flex-1 min-w-[250px] border-r border-gray-200 p-4 flex items-center"
                            >
                              <span className="text-gray-900 text-[14px] font-medium leading-relaxed">
                                {getSpecValue(prod, groupName, specName)}
                              </span>
                            </div>
                          ))}

                          {[...Array(3 - productsData.length)].map((_, idx) => (
                            <div
                              key={`empty-spec-${idx}`}
                              className="flex-1 min-w-[250px] border-r border-gray-200 bg-gray-50"
                            ></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

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
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider ml-3">
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
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest self-center">
                    Gợi ý:
                  </span>
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

export default Compare;
