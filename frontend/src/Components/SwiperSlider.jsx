import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProductCard from "./ProductCard";

function SwiperSlider({
  items = [],
  slidesPerView = { default: 1.25, md: 2, lg: 3, xl: 4 },
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={slidesPerView.default || 1.25}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      breakpoints={{
        768: {
          slidesPerView: slidesPerView.md || 2,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: slidesPerView.lg || 3,
          spaceBetween: 30,
        },
        1280: {
          slidesPerView: slidesPerView.xl || 4,
          spaceBetween: 32,
        },
      }}
      className="!pb-14 !px-2 product-swiper"
    >
      {items.map((product) => (
        <SwiperSlide key={product.id} className="h-auto py-2">
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default SwiperSlider;
