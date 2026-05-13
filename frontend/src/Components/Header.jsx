import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  User as UserIcon,
  LogOut,
  ShoppingCart as CartIcon,
  ChevronDown,
  Package,
  Search,
} from "lucide-react";
import cartApi from "../api/cartApi";

const navItems = [
  { label: "Cửa hàng", to: "/store" },
  { label: "Mac", to: "/Category?keyword=mac" },
  { label: "iPad", to: "/Category?keyword=ipad" },
  { label: "iPhone", to: "/Category?keyword=iphone" },
  { label: "Samsung", to: "/Category?keyword=samsung" },
  { label: "Watch", to: "/Category?keyword=watch" },
  { label: "AirPods", to: "/Category?keyword=airpod" },
];

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const checkLoginStatus = () => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    if (token) {
      const storedUserInfo = localStorage.getItem("user");
      if (storedUserInfo) setUserInfo(JSON.parse(storedUserInfo));
    } else {
      setUserInfo(null);
    }
  };

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setCartCount(0);
        return;
      }
      const data = await cartApi.getCart();
      const result = data?.result;

      const items = result?.cartItemResponses || result?.items || [];
      const total = result?.totalItems ?? items.length;

      setCartCount(Number(total) || 0);
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    fetchCartCount();
  }, [location]);

  useEffect(() => {
    const onCartUpdated = () => fetchCartCount();
    window.addEventListener("cartUpdated", onCartUpdated);
    window.addEventListener("storage", onCartUpdated);
    return () => {
      window.removeEventListener("cartUpdated", onCartUpdated);
      window.removeEventListener("storage", onCartUpdated);
    };
  }, []);

  useEffect(() => {
    const keyword = new URLSearchParams(location.search).get("keyword");

    if (location.pathname === "/Category" && keyword) {
      setSearchValue(keyword);
    } else {
      setSearchValue("");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🟢 ĐOẠN ĐÃ ĐƯỢC SỬA: KIỂM TRA NGẦM TRẠNG THÁI KHÓA TÀI KHOẢN (MỖI 3 GIÂY)
  useEffect(() => {
    if (!isLoggedIn) return; // Chỉ chạy khi đã đăng nhập

    const intervalId = setInterval(() => {
      cartApi.getCart().catch(() => {
        // Lỗi 403 (bị khóa) hoặc 401 đã được file api.js (interceptor) xử lý và ép đăng xuất
        // Nên ở đây ta bắt catch để không bị văng chữ đỏ ra console
      });
    }, 3000);

    // Dọn dẹp bộ đếm khi Component bị hủy hoặc người dùng vừa đăng xuất
    return () => clearInterval(intervalId);
  }, [isLoggedIn]); // 👈 Lắng nghe sự thay đổi của biến isLoggedIn

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleSearchSubmit = () => {
    const keyword = searchValue.trim();

    if (!keyword) return;

    navigate(`/Category?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserInfo(null);
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#121212] shadow-2xl border-b border-gray-800"
          : "bg-[#121212]/95 backdrop-blur-md border-b border-gray-900"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tighter text-white">
            TechZone
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const currentKeyword =
                  new URLSearchParams(location.search).get("keyword") || "";
                const targetKeyword =
                  new URL(to, window.location.origin).searchParams.get(
                    "keyword",
                  ) || "";
                const isQueryActive =
                  location.pathname === "/Category" &&
                  currentKeyword === targetKeyword;
                const active = isActive || isQueryActive;

                return `relative px-4 py-1 text-sm transition-all duration-300 ${
                  active
                    ? "text-white font-bold"
                    : "text-gray-400 hover:text-white"
                }`;
              }}
            >
              {({ isActive }) => {
                const currentKeyword =
                  new URLSearchParams(location.search).get("keyword") || "";
                const targetKeyword =
                  new URL(to, window.location.origin).searchParams.get(
                    "keyword",
                  ) || "";
                const active =
                  isActive ||
                  (location.pathname === "/Category" &&
                    currentKeyword === targetKeyword);
                return (
                  <>
                    {label}
                    {active && (
                      <span className="absolute bottom-[-18px] left-0 right-0 h-[2px] bg-blue-500 rounded-full animate-in fade-in zoom-in duration-300"></span>
                    )}
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#1c1c1e] border border-gray-800 rounded-full px-3 py-1.5 gap-2 hover:border-gray-600 transition">
            <Search className="h-4 w-4 text-gray-400" />

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm sản phẩm..."
              className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-44"
            />

            {searchValue && (
              <button
                onClick={handleSearchSubmit}
                className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 transition"
              >
                Tìm
              </button>
            )}
          </div>
          {isLoggedIn ? (
            <>
              <Link to="/shopping-cart" className="relative p-2 group">
                <CartIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-[#121212]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full bg-[#1c1c1e] px-3 py-1.5 border border-gray-800 hover:border-gray-600 transition-all"
                >
                  <UserIcon className="h-4 w-4 text-gray-300" />
                  <ChevronDown
                    className={`h-3 w-3 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-[#1c1c1e] border border-gray-800 p-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-gray-800 mb-1">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                        Tài khoản
                      </p>
                      <p className="text-sm font-medium text-white truncate">
                        {userInfo?.username || "Thành viên"}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#2c2c2e] rounded-lg transition-colors"
                    >
                      <UserIcon className="h-4 w-4" /> Hồ sơ cá nhân
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#2c2c2e] rounded-lg transition-colors"
                    >
                      <Package className="h-4 w-4" /> Lịch sử đặt hàng
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-t border-gray-800 mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/signin"
              className="rounded-full bg-white px-5 py-1.5 text-sm font-bold text-black hover:bg-gray-200 transition-colors"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
