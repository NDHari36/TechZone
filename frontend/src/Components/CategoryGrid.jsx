import productsData from "../data/products.json";

const categories = [
  {
    key: "phones",
    title: "Điện thoại",
    description:
      "Sưu tập điện thoại flagship mới nhất với hiệu năng vượt trội và camera đột phá.",
  },
  {
    key: "laptops",
    title: "Laptop",
    description:
      "Từ máy mỏng nhẹ tới gaming cao cấp, đáp ứng mọi nhu cầu làm việc và giải trí.",
  },
  {
    key: "tablets",
    title: "Tablet",
    description:
      "Thiết kế gọn nhẹ, đa nhiệm mạnh mẽ - lựa chọn hoàn hảo cho học tập và sáng tạo.",
  },
];

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl space-y-12 px-6 py-16">
      {categories.map(({ key, title, description }) => {
        const highlight = productsData[key][0];

        return (
          <div
            key={key}
            id={key}
            className="grid gap-8 rounded-3xl bg-white/80 p-8 shadow-sm backdrop-blur md:grid-cols-2"
          >
            <div className="flex flex-col justify-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
              <p className="text-slate-600">{description}</p>
              <ul className="space-y-2 text-sm text-slate-500">
                {Object.entries(highlight.specs).map(([spec, value]) => (
                  <li key={spec}>
                    <span className="font-semibold capitalize text-slate-700">
                      {spec}:
                    </span>{" "}
                    {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={highlight.image}
                alt={highlight.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                <p className="text-sm uppercase tracking-wide text-blue-200">
                  Sản phẩm nổi bật
                </p>
                <h3 className="text-2xl font-semibold">{highlight.name}</h3>
                <p className="text-sm text-blue-100">{highlight.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default CategoryGrid;
