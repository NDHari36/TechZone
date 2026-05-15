import { useState, useEffect, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  MessageSquare,
  Send,
  Info,
  ChevronDown,
  Plus,
} from "lucide-react";
import productApi from "../api/productApi";
import { CompareContext } from "../Components/CompareContext";

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
  "Dung lượng còn lại (khả dụng) khoảng",
  "Danh bạ",
  "Độ phân giải camera sau",
  "Quay phim camera sau",
  "Đèn Flash camera sau",
  "Tính năng camera sau",
  "Độ phân giải camera trước",
  "Tính năng camera trước",
  "Công nghệ màn hình",
  "Độ phân giải màn hình",
  "Màn hình rộng",
  "Độ sáng tối đa",
  "Mặt kính cảm ứng",
  "Dung lượng pin",
  "Loại pin",
  "Hỗ trợ sạc tối đa",
  "Sạc kèm theo máy",
  "Công nghệ pin",
  "Bảo mật nâng cao",
  "Tính năng đặc biệt",
  "Kháng nước, bụi",
  "Ghi âm",
  "Xem phim",
  "Nghe nhạc",
  "Mạng di động",
  "SIM",
  "Wifi",
  "GPS",
  "Bluetooth",
  "Cổng kết nối/sạc",
  "Jack tai nghe",
  "Kết nối khác",
  "Thiết kế",
  "Chất liệu",
  "Kích thước, khối lượng",
  "Thời điểm ra mắt",
];

function Details() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [canReview, setCanReview] = useState(false);
  const [validOrderId, setValidOrderId] = useState(null);
  const [selectedStar, setSelectedStar] = useState("all");
  const [openGroups, setOpenGroups] = useState({
    "Cấu hình & Bộ nhớ": true,
  });
  const searchParams = new URLSearchParams(window.location.search);
  const currentOrderId = searchParams.get("orderId");
  const { addToCompare, compareList, setShowBar } = useContext(CompareContext);
  const isComparing = compareList.find((item) => item.id === product?.id);

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  useEffect(() => {
    setShowBar(false);
    const fetchProductAndReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getById(id);
        const prod = data.result || data;
        setProduct(prod);

        if (prod?.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }

        const reviewData = await productApi.getReviews(id);
        const fetchedReviews = Array.isArray(reviewData)
          ? reviewData
          : reviewData.result || [];
        setReviews(
          fetchedReviews.sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
          ),
        );
        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const checkRes = await productApi.checkCanReview(
              id,
              currentOrderId,
            );
            const isCan =
              checkRes.canReview === true || checkRes.data?.canReview === true;
            const returnedOrderId = checkRes.orderId || checkRes.data?.orderId;
            setCanReview(isCan);
            if (returnedOrderId) {
              setValidOrderId(returnedOrderId);
            }
          } catch (e) {
            setCanReview(false);
          }
        }
      } catch (err) {
        console.error("Failed to load product detail", err);
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductAndReviews();
  }, [id, setShowBar]);

  const images = product?.images || [];
  const variants = product?.variants || [];
  const allSpecs = product?.specs || [];

  let currentSpecs = [];
  if (
    selectedVariant?.product_variant_specs &&
    selectedVariant.product_variant_specs.length > 0
  ) {
    currentSpecs = selectedVariant.product_variant_specs;
  } else if (allSpecs.length > 0) {
    currentSpecs = selectedVariant
      ? allSpecs.filter((spec) => spec.variant_id === selectedVariant.id)
      : allSpecs;
  }

  if (currentSpecs.length === 0 && allSpecs.length > 0) {
    currentSpecs = allSpecs;
  }

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const stockCount = selectedVariant?.quantity ?? product?.total_stock ?? 0;
  const inStock = stockCount > 0;

  const currentColor = selectedVariant?.color || "Đang cập nhật";
  const currentStorage = selectedVariant?.storage || "Đang cập nhật";
  const currentRam = selectedVariant?.ram || "";

  const currentLabel = selectedVariant
    ? [currentRam, currentStorage, currentColor].filter(Boolean).join(" - ")
    : "";

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const token = localStorage.getItem("authToken");
      const body = {
        productId: Number(product.id),
        variantId: selectedVariant ? Number(selectedVariant.id) : null,
        quantity: Number(quantity),
      };

      const res = await fetch(
        "https://techzone-api-wkxx.onrender.com/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) throw new Error("Thêm vào giỏ hàng thất bại");

      localStorage.setItem("cartEvent", "updated:" + Date.now());
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      if (quantity < stockCount) setQuantity((prev) => prev + 1);
      else alert(`Kho chỉ còn ${stockCount} sản phẩm`);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) return setQuantity(1);
    if (value > stockCount) {
      alert(`Rất tiếc, kho chỉ còn ${stockCount} sản phẩm`);
      setQuantity(stockCount);
    } else {
      setQuantity(value);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim())
      return alert("Vui lòng nhập nội dung đánh giá!");

    const token = localStorage.getItem("authToken");
    if (!token) return alert("Bạn cần đăng nhập để đánh giá sản phẩm.");

    setIsSubmittingReview(true);
    try {
      const response = await productApi.addReview({
        orderId: Number(validOrderId),
        productId: Number(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      const reviewData = await productApi.getReviews(id);
      const fetchedReviews = Array.isArray(reviewData)
        ? reviewData
        : reviewData.result || reviewData.data || [];
      setReviews(
        fetchedReviews.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        ),
      );
      setReviewForm({ rating: 5, comment: "" });
      setCanReview(false);
      toast.success("Cảm ơn bạn đã đánh giá!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Gửi đánh giá thất bại.";
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };
  const specMap = useMemo(() => {
    const map = new Map();

    currentSpecs.forEach((spec) => {
      const rawGroupName = String(spec.group_name || "Thông số khác").trim();

      const specName = String(spec.name || "").trim();

      const specValue = String(spec.value_text || spec.value || "").trim();

      if (!specName || !specValue) return;

      let finalGroupName = rawGroupName;

      const matchedGroup = GROUP_ORDER.find(
        (go) => go.toLowerCase() === rawGroupName.toLowerCase(),
      );

      if (matchedGroup) {
        finalGroupName = matchedGroup;
      }

      const uniqueKey = `${finalGroupName}-${specName}`.toLowerCase();

      map.set(uniqueKey, {
        group_name: finalGroupName,
        name: specName,
        value_text: specValue,
        unit: spec.unit ? String(spec.unit).trim() : "",
      });
    });

    if (selectedVariant?.ram?.trim()) {
      map.set("cấu hình & bộ nhớ-ram", {
        group_name: "Cấu hình & Bộ nhớ",
        name: "RAM",
        value_text: selectedVariant.ram.trim(),
        unit: "",
      });
    }

    if (selectedVariant?.storage?.trim()) {
      map.set("cấu hình & bộ nhớ-dung lượng lưu trữ", {
        group_name: "Cấu hình & Bộ nhớ",
        name: "Dung lượng lưu trữ",
        value_text: selectedVariant.storage.trim(),
        unit: "",
      });
    }

    return map;
  }, [currentSpecs, selectedVariant]);
  const { groupedSpecs, sortedGroups } = useMemo(() => {
    const groupedSpecs = {};

    specMap.forEach((spec) => {
      if (!groupedSpecs[spec.group_name]) {
        groupedSpecs[spec.group_name] = [];
      }
      groupedSpecs[spec.group_name].push(spec);
    });

    Object.keys(groupedSpecs).forEach((groupName) => {
      groupedSpecs[groupName].sort((a, b) => {
        let idxA = SPEC_ITEM_ORDER.indexOf(a.name);
        let idxB = SPEC_ITEM_ORDER.indexOf(b.name);

        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;

        return idxA - idxB;
      });
    });

    const sortedGroups = Object.keys(groupedSpecs).sort((a, b) => {
      const indexA = GROUP_ORDER.indexOf(a);
      const indexB = GROUP_ORDER.indexOf(b);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

    return { groupedSpecs, sortedGroups };
  }, [currentSpecs, selectedVariant]);
  const handleStarFilter = (star) => () => {
    setSelectedStar(star);
  };
  const filteredReviews = useMemo(() => {
    return selectedStar === "all"
      ? reviews
      : reviews.filter((r) => Number(r.rating) === Number(selectedStar));
  }, [reviews, selectedStar]);
  const avgRating = useMemo(() => {
    return reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;
  }, [reviews]);
  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++;
      }
    });

    return counts;
  }, [reviews]);
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Lỗi: {error}
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Không tìm thấy sản phẩm.
      </div>
    );

  return (
    <main className="min-h-screen bg-white pt-20 pb-10">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 80,
          right: 20,
        }}
      />{" "}
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex justify-between items-center text-sm text-gray-600">
          <div>
            <span className="hover:text-gray-900 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2">/</span>
            <span className="hover:text-gray-900 cursor-pointer">
              {product.category_name || ""}
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>

          <button
            onClick={() => addToCompare(product)}
            disabled={isComparing}
            className={`flex items-center gap-1 px-3 py-1.5 rounded border transition-colors ${
              isComparing
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
          >
            <Plus size={16} />
            {isComparing ? "Đã thêm so sánh" : "So sánh"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-300 flex items-center justify-center hover:shadow-lg transition-shadow duration-300">
              <img
                loading="lazy"
                decoding="async"
                src={
                  images.find((img) => img.is_primary)?.image_url ||
                  images[0]?.image_url ||
                  "/images/img.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {avgRating > 0 ? `${avgRating}/5.0 ` : ""}({reviews.length}{" "}
                  đánh giá)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-3xl font-black text-gray-900">
                {Number(currentPrice).toLocaleString("vi-VN")} ₫
              </span>
              <div className="text-gray-600 mt-2">
                <div>
                  <span className="font-semibold">Màu sắc:</span> {currentColor}
                </div>
                <div>
                  <span className="font-semibold">Bộ nhớ:</span> {currentRam}{" "}
                  {currentRam && "-"} {currentStorage}
                </div>
              </div>
            </div>

            {variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="font-semibold text-gray-900">
                  Chọn phiên bản:
                </span>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v) => {
                    const btnLabel =
                      [v.ram, v.storage, v.color].filter(Boolean).join(" - ") ||
                      `Bản ${v.id}`;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                          selectedVariant?.id === v.id
                            ? "border-gray-900 bg-gray-900 text-white shadow-md"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-900"
                        }`}
                      >
                        {btnLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className={`px-4 py-2 rounded-lg font-semibold text-center w-max ${inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {inStock
                ? `✓ Còn hàng (Chỉ còn ${stockCount} sản phẩm)`
                : "Hết hàng"}
            </div>

            <div
              className={`flex items-center gap-4 ${!inStock ? "opacity-50 pointer-events-none" : ""}`}
            >
              <span className="text-gray-700 font-semibold">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => handleQuantityChange("decrease")}
                  className="px-4 py-2 hover:bg-gray-100 transition border-r border-gray-300 font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleInputChange}
                  className="w-16 text-center font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange("increase")}
                  className="px-4 py-2 hover:bg-gray-100 transition border-l border-gray-300 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${inStock ? "bg-gray-900 hover:bg-gray-800 text-white shadow-md active:scale-95" : "bg-gray-400 text-white cursor-not-allowed"}`}
              >
                <ShoppingCart className="h-6 w-6" />{" "}
                {inStock ? "Thêm vào giỏ" : "Hết hàng"}
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`px-6 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-300 ${isWishlisted ? "bg-red-100 border-red-300 text-red-600" : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"}`}
              >
                <Heart
                  className={`h-6 w-6 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
              <button className="px-6 py-4 rounded-xl font-bold text-lg border-2 border-gray-300 bg-white hover:border-gray-400 text-gray-700 transition-all duration-300">
                <Share2 className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-700">
                <Truck className="h-5 w-5 text-gray-600" />
                <span>Miễn phí vận chuyển cho đơn hàng trên 500K</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Shield className="h-5 w-5 text-gray-600" />
                <span>Bảo hành 12 tháng chính hãng</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <RotateCcw className="h-5 w-5 text-gray-600" />
                <span>Đổi trả trong 30 ngày</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-300 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Mô tả sản phẩm
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-4 italic border-l-4 border-gray-200 pl-4 whitespace-pre-line">
            {product.description}
          </p>
        </div>
        <br />

        {sortedGroups.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-300 p-8 mb-10 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">
              Thông số kỹ thuật {currentLabel ? `(${currentLabel})` : ""}
            </h2>
            <div className="flex flex-col">
              {sortedGroups.map((groupName) => {
                const isOpen = openGroups[groupName];
                const specs = groupedSpecs[groupName];

                return (
                  <div key={groupName} className="mb-3">
                    <button
                      onClick={() => toggleGroup(groupName)}
                      className="w-full flex justify-between items-center px-5 py-3.5 bg-[#f3f4f6] hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span className="font-semibold text-gray-800 text-[16px]">
                        {groupName}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "opacity-100 mt-2 block" : "opacity-0 hidden"
                      }`}
                    >
                      <div className="px-5">
                        {specs.map((spec) => (
                          <div
                            key={`${spec.group_name}-${spec.name}`}
                            className="flex items-start py-3.5 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="w-1/3 text-[#4b5563] font-medium text-[15px] pr-4">
                              {spec.name}
                            </div>
                            <div className="w-2/3 text-gray-900 text-[15px]">
                              {spec.value_text} {spec.unit ? spec.unit : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-300 p-8 mb-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-8 w-8 text-gray-900" />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight m-0">
              Đánh giá sản phẩm
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 mb-8 border-b border-gray-200 pb-8">
            <div className="flex flex-col items-center justify-center md:w-1/3">
              <div className="flex items-center gap-2 text-yellow-500">
                <span className="text-5xl font-black text-gray-900">
                  {avgRating}
                </span>
                <span className="text-xl text-gray-500 font-medium">/5</span>
              </div>
              <div className="flex mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(avgRating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <div className="text-gray-500 mt-2 font-medium">
                {reviews.length} đánh giá
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star];
                const percent =
                  reviews.length > 0
                    ? ((count / reviews.length) * 100).toFixed(1)
                    : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-end gap-1 w-8 text-gray-700 font-medium">
                      {star}{" "}
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    </div>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right text-gray-600 font-medium">
                      {percent}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {canReview ? (
            <form
              onSubmit={handleSubmitReview}
              className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-10"
            >
              <h3 className="font-bold text-gray-900 mb-4">
                Viết đánh giá của bạn
              </h3>
              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">
                  Chất lượng sản phẩm:
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() =>
                        setReviewForm((prev) => ({ ...prev, rating: star }))
                      }
                      className={`h-8 w-8 cursor-pointer transition-colors ${reviewForm.rating >= star ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows="3"
                  placeholder="Mời bạn chia sẻ cảm nhận về sản phẩm..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="absolute bottom-4 right-4 bg-gray-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                  {isSubmittingReview ? "Đang gửi..." : "Gửi"}{" "}
                  <Send size={16} />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-10 flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">
                  Quyền đánh giá sản phẩm
                </h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Để đảm bảo tính khách quan, hệ thống chỉ cho phép khách hàng
                  đã **mua sản phẩm thành công** (đã nhận hàng) và **chưa đánh
                  giá** thực hiện bình luận.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6 min-h-[500px] transition-all duration-300">
            {" "}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setSelectedStar("all")}
                className={`px-4 py-2 rounded-xl border font-semibold transition ${
                  selectedStar === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                }`}
              >
                Tất cả
              </button>

              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={handleStarFilter(star)}
                  className={`px-4 py-2 rounded-xl border font-semibold flex items-center gap-1 transition ${
                    selectedStar === star
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-yellow-500"
                  }`}
                >
                  {star}
                  <Star className="h-4 w-4 fill-current" />
                </button>
              ))}
            </div>
            {reviews.length > 0 ? (
              filteredReviews.slice(0, 10).map((rev) => (
                <div
                  key={`${rev.id}-${rev.created_at}`}
                  className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                      {rev.display_name
                        ? rev.display_name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {rev.display_name || "Khách hàng ẩn danh"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span>•</span>{" "}
                        <span>
                          {" "}
                          {new Date(rev.created_at).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                        </span>{" "}
                        {rev.variant_bought && (
                          <>
                            <span>•</span>{" "}
                            <span>Phân loại: {rev.variant_bought}</span>{" "}
                          </>
                        )}{" "}
                      </div>{" "}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2 pl-12">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                Chưa có đánh giá nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Details;
