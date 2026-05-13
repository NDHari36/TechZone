import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Image as ImageIcon,
  X,
  PlusCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import productApi from "../../api/productApi";
import brandApi from "../../api/brandApi";

const defaultSpecs = [
  { group_name: "Cấu hình & Bộ nhớ", name: "Hệ điều hành", value_text: "" },
  { group_name: "Cấu hình & Bộ nhớ", name: "Chip xử lý (CPU)", value_text: "" },
  { group_name: "Cấu hình & Bộ nhớ", name: "Tốc độ CPU", value_text: "" },
  {
    group_name: "Cấu hình & Bộ nhớ",
    name: "Chip đồ họa (GPU)",
    value_text: "",
  },
  { group_name: "Cấu hình & Bộ nhớ", name: "RAM", value_text: "" },
  {
    group_name: "Cấu hình & Bộ nhớ",
    name: "Dung lượng lưu trữ",
    value_text: "",
  },
  {
    group_name: "Cấu hình & Bộ nhớ",
    name: "Dung lượng còn lại (khả dụng) khoảng",
    value_text: "",
  },
  { group_name: "Cấu hình & Bộ nhớ", name: "Danh bạ", value_text: "" },
  {
    group_name: "Camera & Màn hình",
    name: "Độ phân giải camera sau",
    value_text: "",
  },
  {
    group_name: "Camera & Màn hình",
    name: "Quay phim camera sau",
    value_text: "",
  },
  {
    group_name: "Camera & Màn hình",
    name: "Đèn Flash camera sau",
    value_text: "",
  },
  {
    group_name: "Camera & Màn hình",
    name: "Tính năng camera sau",
    value_text: "",
  },
  {
    group_name: "Camera & Màn hình",
    name: "Độ phân giải camera trước",
    value_text: "",
  },
  {
    group_name: "Camera & Màn hình",
    name: "Tính năng camera trước",
    value_text: "",
  },
  {
    group_name: "Camera & Màn hình",
    name: "Công nghệ màn hình",
    value_text: "",
  },
  {
    group_name: "Camera & Màn hình",
    name: "Độ phân giải màn hình",
    value_text: "",
  },
  { group_name: "Camera & Màn hình", name: "Màn hình rộng", value_text: "" },
  { group_name: "Camera & Màn hình", name: "Độ sáng tối đa", value_text: "" },
  { group_name: "Camera & Màn hình", name: "Mặt kính cảm ứng", value_text: "" },
  { group_name: "Pin & Sạc", name: "Dung lượng pin", value_text: "" },
  { group_name: "Pin & Sạc", name: "Loại pin", value_text: "" },
  { group_name: "Pin & Sạc", name: "Hỗ trợ sạc tối đa", value_text: "" },
  { group_name: "Pin & Sạc", name: "Sạc kèm theo máy", value_text: "" },
  { group_name: "Pin & Sạc", name: "Công nghệ pin", value_text: "" },
  { group_name: "Tiện ích", name: "Bảo mật nâng cao", value_text: "" },
  { group_name: "Tiện ích", name: "Tính năng đặc biệt", value_text: "" },
  { group_name: "Tiện ích", name: "Kháng nước, bụi", value_text: "" },
  { group_name: "Tiện ích", name: "Ghi âm", value_text: "" },
  { group_name: "Tiện ích", name: "Xem phim", value_text: "" },
  { group_name: "Tiện ích", name: "Nghe nhạc", value_text: "" },
  { group_name: "Kết nối", name: "Mạng di động", value_text: "" },
  { group_name: "Kết nối", name: "SIM", value_text: "" },
  { group_name: "Kết nối", name: "Wifi", value_text: "" },
  { group_name: "Kết nối", name: "GPS", value_text: "" },
  { group_name: "Kết nối", name: "Bluetooth", value_text: "" },
  { group_name: "Kết nối", name: "Cổng kết nối/sạc", value_text: "" },
  { group_name: "Kết nối", name: "Jack tai nghe", value_text: "" },
  { group_name: "Kết nối", name: "Kết nối khác", value_text: "" },
  { group_name: "Thiết kế & Chất liệu", name: "Thiết kế", value_text: "" },
  { group_name: "Thiết kế & Chất liệu", name: "Chất liệu", value_text: "" },
  {
    group_name: "Thiết kế & Chất liệu",
    name: "Kích thước, khối lượng",
    value_text: "",
  },
  {
    group_name: "Thiết kế & Chất liệu",
    name: "Thời điểm ra mắt",
    value_text: "",
  },
];

const GROUP_ORDER = [
  "Cấu hình & Bộ nhớ",
  "Camera & Màn hình",
  "Pin & Sạc",
  "Tiện ích",
  "Kết nối",
  "Thiết kế & Chất liệu",
];

const mergeFormSpecs = (savedSpecs) => {
  const mergedMap = new Map();
  defaultSpecs.forEach((def) => {
    const key = `${def.group_name.trim()}-${def.name.trim()}`.toLowerCase();
    mergedMap.set(key, { ...def });
  });

  if (savedSpecs && Array.isArray(savedSpecs)) {
    savedSpecs.forEach((saved) => {
      if (!saved.name) return;
      const gName = saved.group_name || "Thông số khác";
      const key = `${gName.trim()}-${saved.name.trim()}`.toLowerCase();

      mergedMap.set(key, {
        group_name: gName,
        name: saved.name,
        value_text: saved.value_text || saved.value || "",
        unit: saved.unit || "",
      });
    });
  }
  return Array.from(mergedMap.values());
};

const mergeViewSpecs = (savedSpecs) => {
  if (!savedSpecs || !Array.isArray(savedSpecs)) return [];
  const mergedMap = new Map();
  savedSpecs.forEach((saved) => {
    const val = saved.value_text || saved.value || "";
    if (!saved.name || val.toString().trim() === "") return;
    const gName = saved.group_name || "Thông số khác";
    const key = `${gName.trim()}-${saved.name.trim()}`.toLowerCase();
    mergedMap.set(key, {
      group_name: gName,
      name: saved.name,
      value_text: val,
      unit: saved.unit || "",
    });
  });
  return Array.from(mergedMap.values());
};

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [sortIDproduct, setSortIDproduct] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortStock, setSortStock] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const [formOpenGroups, setFormOpenGroups] = useState({
    "Cấu hình & Bộ nhớ": true,
  });
  const [newGroupInput, setNewGroupInput] = useState("");
  const [activeVariantTab, setActiveVariantTab] = useState(0);

  const toggleFormGroup = (groupName) => {
    setFormOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    new_category: "",
    brand_id: "",
    new_brand: "",
    variants: [
      {
        sku: "",
        price: "",
        total_stock: "",
        ram: "",
        storage: "",
        color: "",
        product_variant_specs: mergeFormSpecs([]),
      },
    ],
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const load = async () => {
    try {
      const res = await productApi.getAll({ page: 1, limit: 10000 });

      let productList = res.result?.content || res.result || [];

      setProducts(productList);

      const uniqueCategories = [];
      const categoryMap = new Map();

      productList.forEach((p) => {
        if (
          p.category_id &&
          p.category_name &&
          !categoryMap.has(p.category_id)
        ) {
          categoryMap.set(p.category_id, true);
          uniqueCategories.push({
            id: p.category_id,
            name: p.category_name,
          });
        }
      });

      setCategories(uniqueCategories);

      const brandRes = await brandApi.getAll().catch(() => ({ result: [] }));

      const rawBrands = brandRes.result || brandRes.data || brandRes || [];

      const formattedBrands = rawBrands.map((b, index) =>
        typeof b === "string" ? { id: index + 1, name: b } : b,
      );

      setBrands(formattedBrands);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSortId = () => {
    setSortIDproduct((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredProducts = products
    .filter((product) => {
      const keyword = searchTerm.toLowerCase();

      const matchSearch =
        product.name?.toLowerCase().includes(keyword) ||
        product.brand_name?.toLowerCase().includes(keyword) ||
        product.category_name?.toLowerCase().includes(keyword);

      const matchCategory =
        !selectedCategory ||
        String(product.category_id) === String(selectedCategory);

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortStock === "asc") {
        return (a.total_stock || 0) - (b.total_stock || 0);
      }

      if (sortStock === "desc") {
        return (b.total_stock || 0) - (a.total_stock || 0);
      }

      if (sortIDproduct === "asc") {
        return a.id - b.id;
      }

      if (sortIDproduct === "desc") {
        return b.id - a.id;
      }

      return 0;
    });
  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...form.variants];
    const updatedVariant = { ...newVariants[index], [field]: value };

    if (field === "ram" || field === "storage") {
      const targetSpecName = field === "ram" ? "RAM" : "Dung lượng lưu trữ";
      updatedVariant.product_variant_specs =
        updatedVariant.product_variant_specs.map((spec) => {
          if (spec.name === targetSpecName) {
            return { ...spec, value_text: value };
          }
          return spec;
        });
    }

    newVariants[index] = updatedVariant;
    setForm({ ...form, variants: newVariants });
  };

  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        {
          sku: "",
          price: "",
          total_stock: "",
          ram: "",
          storage: "",
          color: "",
          product_variant_specs: mergeFormSpecs([]),
        },
      ],
    });
    setActiveVariantTab(form.variants.length);
  };

  const removeVariant = (index) => {
    if (form.variants.length === 1) {
      toast("Phải có ít nhất 1 phiên bản sản phẩm!");
      return;
    }
    const newVariants = form.variants.filter((_, i) => i !== index);
    setForm({ ...form, variants: newVariants });
    if (activeVariantTab >= newVariants.length) {
      setActiveVariantTab(newVariants.length - 1);
    }
  };

  const handleVariantSpecChange = (specIndex, field, value) => {
    const newVariants = [...form.variants];
    const updatedVariant = { ...newVariants[activeVariantTab] };
    const updatedSpecs = [...updatedVariant.product_variant_specs];

    updatedSpecs[specIndex] = { ...updatedSpecs[specIndex], [field]: value };
    updatedVariant.product_variant_specs = updatedSpecs;

    if (field === "value_text") {
      if (updatedSpecs[specIndex].name === "RAM") {
        updatedVariant.ram = value;
      } else if (updatedSpecs[specIndex].name === "Dung lượng lưu trữ") {
        updatedVariant.storage = value;
      }
    }

    newVariants[activeVariantTab] = updatedVariant;
    setForm({ ...form, variants: newVariants });
  };

  const removeVariantSpec = (specIndex) => {
    const newVariants = [...form.variants];
    const updatedVariant = { ...newVariants[activeVariantTab] };
    const updatedSpecs = [...updatedVariant.product_variant_specs];

    updatedSpecs.splice(specIndex, 1);
    updatedVariant.product_variant_specs = updatedSpecs;
    newVariants[activeVariantTab] = updatedVariant;

    setForm({ ...form, variants: newVariants });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category_id: "",
      new_category: "",
      brand_id: "",
      new_brand: "",
      variants: [
        {
          sku: "",
          price: "",
          total_stock: "",
          ram: "",
          storage: "",
          color: "",
          product_variant_specs: mergeFormSpecs([]),
        },
      ],
    });
    setFiles([]);
    setPreviews([]);
    setIsEditing(false);
    setEditingId(null);
    setActiveVariantTab(0);
  };

  const openModalForCreate = () => {
    resetForm();
    setFormOpenGroups({ "Cấu hình & Bộ nhớ": true });
    setIsModalOpen(true);
  };

  const openModalForEdit = async (productSummary, e) => {
    e.stopPropagation();
    try {
      setIsLoadingDetails(true);
      const detailData = await productApi.getById(productSummary.id);
      const product = detailData.result || detailData;

      let loadedVariants = [];

      if (product.variants && product.variants.length > 0) {
        loadedVariants = product.variants.map((v) => {
          const savedSpecsToUse =
            v.product_variant_specs && v.product_variant_specs.length > 0
              ? v.product_variant_specs
              : product.specs || [];

          const finalSpecs = mergeFormSpecs(savedSpecsToUse).map((spec) => {
            if (spec.name === "RAM" && v.ram)
              return { ...spec, value_text: v.ram };
            if (spec.name === "Dung lượng lưu trữ" && v.storage)
              return { ...spec, value_text: v.storage };
            return spec;
          });

          return {
            id: v.id,
            sku: v.sku || "",
            price: v.price || "",
            total_stock: v.quantity || v.inventories?.[0]?.quantity || 0,
            ram: v.ram || "",
            storage: v.storage || "",
            color: v.color || "",
            product_variant_specs: finalSpecs,
          };
        });
      } else {
        loadedVariants = [
          {
            sku: "",
            price: "",
            total_stock: "",
            ram: "",
            storage: "",
            color: "",
            product_variant_specs: mergeFormSpecs(product.specs || []),
          },
        ];
      }

      setForm({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        new_category: "",
        brand_id: product.brand_id || "",
        new_brand: "",
        variants: loadedVariants,
      });

      const firstVarSpecs = loadedVariants[0].product_variant_specs;
      if (firstVarSpecs.length > 0) {
        const uniqueGroups = [
          ...new Set(firstVarSpecs.map((s) => s.group_name)),
        ];
        uniqueGroups.sort((a, b) => {
          const indexA = GROUP_ORDER.indexOf(a);
          const indexB = GROUP_ORDER.indexOf(b);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        const firstGroup = uniqueGroups[0];
        setFormOpenGroups({ [firstGroup]: true });
      } else {
        setFormOpenGroups({ "Cấu hình & Bộ nhớ": true });
      }

      setFiles([]);
      setPreviews(
        product.images ? product.images.map((img) => img.image_url || img) : [],
      );
      setIsEditing(true);
      setEditingId(product.id);
      setActiveVariantTab(0);
      setIsModalOpen(true);
    } catch (err) {
      toast.error("Không thể tải chi tiết sản phẩm: " + err.message);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validVariants = form.variants.filter(
        (v) => v.price !== "" && v.sku !== "",
      );
      if (validVariants.length === 0) {
        toast.success(
          "Vui lòng điền đầy đủ SKU và Giá cho ít nhất 1 phiên bản!",
        );
        return;
      }

      const payload = {
        ...form,
        category_id:
          form.category_id === "new" ? null : Number(form.category_id),
        brand_id: form.brand_id === "new" ? null : Number(form.brand_id),
        variants: validVariants.map((v) => ({
          ...v,
          id: v.id || null,
          price: Number(v.price),
          total_stock: Number(v.total_stock) || 0,
          product_variant_specs: v.product_variant_specs.filter(
            (s) =>
              s.name &&
              s.name.trim() !== "" &&
              (s.value_text || s.value || "").toString().trim() !== "",
          ),
        })),
      };

      if (isEditing) {
        await productApi.update(editingId, payload);

        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("image", files[i]);
            await productApi.uploadImage(editingId, formData);
          }
        }

        toast.success("Cập nhật thành công!");
      } else {
        const response = await productApi.create(payload);
        const newProductId = response.result?.id || response.id;

        if (newProductId && files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("image", files[i]);
            if (i === 0) {
              formData.append("is_primary", 1);
            }

            await productApi.uploadImage(newProductId, formData);
          }
        }

        toast.success("Thêm thành công!");
      }

      closeModal();
      load();
    } catch (err) {
      console.error(
        "🔥 LỖI TỪ BACKEND TRẢ VỀ:",
        err.response?.data || err.response || err,
      );

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        err.message;

      toast.error("Lỗi từ Backend trả về: " + errorMsg);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await productApi.delete(id);
      toast.success("Xóa thành công!");
      if (expandedRowId === id) setExpandedRowId(null);
      load();
    } catch (err) {
      toast.error("Lỗi khi xóa: " + err.message);
    }
  };

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleToggleExpand = async (product) => {
    if (expandedRowId === product.id) {
      setExpandedRowId(null);
      setExpandedDetails(null);
      setSelectedVariantIdx(0);
      return;
    }

    setExpandedRowId(product.id);
    setIsLoadingExpanded(true);
    setExpandedDetails(null);
    setSelectedVariantIdx(0);

    try {
      const detailData = await productApi.getById(product.id);
      const details = detailData.result || detailData;

      if (details.variants && details.variants.length > 0) {
        details.variants = details.variants.map((v) => {
          const specsToUse =
            v.product_variant_specs && v.product_variant_specs.length > 0
              ? v.product_variant_specs
              : details.specs || [];
          return { ...v, product_variant_specs: mergeViewSpecs(specsToUse) };
        });
      }
      setExpandedDetails(details);

      const initialSpecs = details.variants?.[0]?.product_variant_specs || [];
      if (initialSpecs.length > 0) {
        const uniqueGroups = [
          ...new Set(initialSpecs.map((s) => s.group_name || "Thông số khác")),
        ];
        uniqueGroups.sort((a, b) => {
          const indexA = GROUP_ORDER.indexOf(a);
          const indexB = GROUP_ORDER.indexOf(b);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setOpenGroups({ [uniqueGroups[0]]: true });
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết:", err);
    } finally {
      setIsLoadingExpanded(false);
    }
  };

  let viewSortedGroups = [];
  let viewGroupedSpecs = {};
  if (expandedDetails) {
    const activeViewVariant = expandedDetails.variants?.[selectedVariantIdx];
    const viewSpecs = activeViewVariant?.product_variant_specs || [];

    viewGroupedSpecs = viewSpecs.reduce((acc, spec) => {
      const group = spec.group_name || "Thông số khác";
      if (!acc[group]) acc[group] = [];
      acc[group].push(spec);
      return acc;
    }, {});

    viewSortedGroups = Object.keys(viewGroupedSpecs).sort((a, b) => {
      const indexA = GROUP_ORDER.indexOf(a);
      const indexB = GROUP_ORDER.indexOf(b);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  let formGroupedSpecs = {};
  const activeFormSpecs =
    form.variants[activeVariantTab]?.product_variant_specs || [];
  activeFormSpecs.forEach((spec, index) => {
    const group = spec.group_name || "Chưa phân nhóm";
    if (!formGroupedSpecs[group]) formGroupedSpecs[group] = [];
    formGroupedSpecs[group].push({ ...spec, originalIndex: index });
  });

  const formSortedGroups = Object.keys(formGroupedSpecs).sort((a, b) => {
    const indexA = GROUP_ORDER.indexOf(a);
    const indexB = GROUP_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 80,
          right: 20,
        }}
      />{" "}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-gray-900" />
            <h1 className="text-2xl font-black uppercase text-gray-900">
              Quản lý sản phẩm
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72 px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-white"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Tất cả danh mục</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={sortStock}
              onChange={(e) => setSortStock(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Sắp xếp tồn kho</option>
              <option value="asc">Tồn kho tăng dần</option>
              <option value="desc">Tồn kho giảm dần</option>
            </select>

            <button
              onClick={openModalForCreate}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md whitespace-nowrap"
            >
              <Plus size={20} /> Thêm sản phẩm
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoadingDetails && (
            <div className="w-full bg-blue-100 text-blue-700 text-center py-2 text-sm font-bold animate-pulse">
              Đang tải dữ liệu để cập nhật...
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 w-10"></th>
                  <th
                    onClick={handleSortId}
                    className="p-4 font-bold text-center cursor-pointer select-none"
                  >
                    ID {sortIDproduct === "asc" ? "↑" : "↓"}
                  </th>
                  <th className="p-4 font-bold">Hình ảnh</th>
                  <th className="p-4 font-bold">Tên sản phẩm</th>
                  <th className="p-4 font-bold">Giá bán</th>
                  <th className="p-4 font-bold text-center">Tổng Tồn</th>
                  <th className="p-4 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <React.Fragment key={product.id}>
                      <tr
                        onClick={() => handleToggleExpand(product)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          expandedRowId === product.id ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="p-4 text-gray-400">
                          {expandedRowId === product.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-500 font-medium">
                          {product.id}
                        </td>
                        <td className="p-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                            {product.image_url ||
                            (product.images && product.images.length > 0) ? (
                              <img
                                src={
                                  product.image_url ||
                                  product.images?.find((img) => img.is_primary)
                                    ?.image_url ||
                                  product.images?.[0]?.image_url ||
                                  product.images?.[0]
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="text-gray-400" size={20} />
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          {product.name}
                        </td>
                        <td className="p-4 text-red-600 font-bold">
                          {Number(
                            product.min_price || product.price || 0,
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              product.total_stock > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.total_stock || 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => openModalForEdit(product, e)}
                              disabled={isLoadingDetails}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                              title="Sửa"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(product.id, e)}
                              disabled={isLoadingDetails}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedRowId === product.id && (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-0 border-b-2 border-gray-200"
                          >
                            <div className="bg-gray-50/50 p-6 shadow-inner">
                              {isLoadingExpanded ? (
                                <div className="text-center text-gray-500 animate-pulse py-6">
                                  Đang tải dữ liệu chi tiết...
                                </div>
                              ) : expandedDetails ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-gray-800">
                                  <div className="space-y-6">
                                    {expandedDetails.variants?.length > 0 && (
                                      <div>
                                        <h4 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2 mb-4">
                                          Chọn phiên bản để xem chi tiết
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                          {expandedDetails.variants.map(
                                            (v, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() =>
                                                  setSelectedVariantIdx(idx)
                                                }
                                                className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${
                                                  selectedVariantIdx === idx
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                                }`}
                                              >
                                                Biến thể {idx + 1}{" "}
                                                {v.sku ? `(${v.sku})` : ""}
                                              </button>
                                            ),
                                          )}
                                        </div>

                                        {expandedDetails.variants[
                                          selectedVariantIdx
                                        ] &&
                                          (() => {
                                            const selectedVar =
                                              expandedDetails.variants[
                                                selectedVariantIdx
                                              ];
                                            return (
                                              <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-3">
                                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                                  <span className="text-gray-500 font-medium">
                                                    SKU
                                                  </span>
                                                  <span className="font-bold text-gray-900">
                                                    {selectedVar.sku}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                                  <span className="text-gray-500 font-medium">
                                                    Giá bán
                                                  </span>
                                                  <span className="font-bold text-red-600 text-lg">
                                                    {Number(
                                                      selectedVar.price,
                                                    ).toLocaleString(
                                                      "vi-VN",
                                                    )}{" "}
                                                    ₫
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                                  <span className="text-gray-500 font-medium">
                                                    Tồn kho
                                                  </span>
                                                  <span className="font-bold text-gray-900">
                                                    {selectedVar.quantity ||
                                                      selectedVar.total_stock ||
                                                      0}
                                                  </span>
                                                </div>
                                                {(selectedVar.ram ||
                                                  selectedVar.storage ||
                                                  selectedVar.color) && (
                                                  <div className="pt-2 grid grid-cols-3 gap-2 text-center">
                                                    {selectedVar.ram && (
                                                      <div className="bg-gray-50 p-2 rounded-lg">
                                                        <span className="block text-xs text-gray-500 mb-1">
                                                          RAM
                                                        </span>
                                                        <span className="font-bold">
                                                          {selectedVar.ram}
                                                        </span>
                                                      </div>
                                                    )}
                                                    {selectedVar.storage && (
                                                      <div className="bg-gray-50 p-2 rounded-lg">
                                                        <span className="block text-xs text-gray-500 mb-1">
                                                          Bộ nhớ
                                                        </span>
                                                        <span className="font-bold">
                                                          {selectedVar.storage}
                                                        </span>
                                                      </div>
                                                    )}
                                                    {selectedVar.color && (
                                                      <div className="bg-gray-50 p-2 rounded-lg">
                                                        <span className="block text-xs text-gray-500 mb-1">
                                                          Màu sắc
                                                        </span>
                                                        <span className="font-bold">
                                                          {selectedVar.color}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2 mb-4">
                                        Thông tin chung
                                      </h4>
                                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                        <p className="flex items-center">
                                          <span className="w-1/3 text-gray-500 font-medium">
                                            Danh mục:
                                          </span>
                                          <span className="w-2/3 font-semibold text-gray-900">
                                            {expandedDetails.category_name ||
                                              "N/A"}
                                          </span>
                                        </p>
                                        <hr className="border-gray-100" />
                                        <p className="flex items-center">
                                          <span className="w-1/3 text-gray-500 font-medium">
                                            Thương hiệu:
                                          </span>
                                          <span className="w-2/3 font-semibold text-gray-900">
                                            {expandedDetails.brand_name ||
                                              "N/A"}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-gray-800 block mb-2">
                                        Mô tả sản phẩm:
                                      </span>
                                      <div className="bg-white p-4 rounded-xl border border-gray-200 max-h-40 overflow-y-auto leading-relaxed text-gray-600">
                                        {expandedDetails.description ||
                                          "Chưa có bài viết mô tả."}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="font-bold text-blue-700 text-lg border-b border-gray-200 pb-2 flex justify-between items-center">
                                      <span>Thông số kỹ thuật</span>
                                      <span className="text-sm font-normal text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                                        (Biến thể {selectedVariantIdx + 1})
                                      </span>
                                    </h4>

                                    {viewSortedGroups.length > 0 ? (
                                      <div className="flex flex-col gap-3">
                                        {viewSortedGroups.map((groupName) => {
                                          const isOpen = openGroups[groupName];
                                          const specs =
                                            viewGroupedSpecs[groupName] || [];

                                          return (
                                            <div
                                              key={groupName}
                                              className="w-full"
                                            >
                                              <button
                                                onClick={() =>
                                                  toggleGroup(groupName)
                                                }
                                                className={`w-full flex justify-between items-center px-5 py-4 bg-[#f4f6f8] hover:bg-[#e9ecef] transition-colors ${
                                                  isOpen
                                                    ? "rounded-t-lg"
                                                    : "rounded-lg"
                                                }`}
                                              >
                                                <span className="text-gray-800 text-[15px] font-medium">
                                                  {groupName}
                                                </span>
                                                <ChevronDown
                                                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                                                    isOpen ? "rotate-180" : ""
                                                  }`}
                                                />
                                              </button>

                                              {isOpen && (
                                                <div className="bg-white px-5 py-2 border-x border-b border-[#f4f6f8] rounded-b-lg">
                                                  {specs.map((spec, index) => (
                                                    <div
                                                      key={index}
                                                      className="flex items-start py-3 border-b border-gray-100 last:border-b-0"
                                                    >
                                                      <div className="w-1/3 text-gray-600 font-medium text-[14px] pr-4">
                                                        {spec.name}
                                                      </div>
                                                      <div className="w-2/3 text-gray-900 text-[14px]">
                                                        {spec.value_text ||
                                                          spec.value}{" "}
                                                        {spec.unit
                                                          ? spec.unit
                                                          : ""}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-xl text-gray-400">
                                        <Package className="w-10 h-10 mb-2 opacity-50" />
                                        <p>
                                          Biến thể này chưa cập nhật thông số.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-red-500 py-4 font-medium">
                                  Xảy ra lỗi khi tải dữ liệu.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-500">
                      Chưa có sản phẩm nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-black text-gray-900 uppercase flex items-center gap-2">
                {isEditing ? (
                  <Pencil size={24} className="text-blue-600" />
                ) : (
                  <PlusCircle size={24} className="text-blue-600" />
                )}
                {isEditing ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form
                id="productForm"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 border-b pb-3 mb-5 flex items-center gap-2">
                    <Package size={20} className="text-blue-600" /> Thông tin
                    chung
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Tên sản phẩm gốc *
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                          placeholder="VD: iPhone 15 Pro Max"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-gray-700">
                            Danh mục *
                          </label>
                          <select
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">-- Chọn --</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                            <option
                              value="new"
                              className="font-bold text-blue-600"
                            >
                              + Thêm mới...
                            </option>
                          </select>
                          {form.category_id === "new" && (
                            <input
                              type="text"
                              name="new_category"
                              value={form.new_category}
                              onChange={handleChange}
                              required
                              className="w-full p-3 mt-2 border border-blue-300 rounded-xl bg-blue-50 outline-none"
                              placeholder="Nhập tên danh mục"
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-gray-700">
                            Thương hiệu *
                          </label>
                          <select
                            name="brand_id"
                            value={form.brand_id}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">-- Chọn --</option>
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                            <option
                              value="new"
                              className="font-bold text-blue-600"
                            >
                              + Thêm mới...
                            </option>
                          </select>
                          {form.brand_id === "new" && (
                            <input
                              type="text"
                              name="new_brand"
                              value={form.new_brand}
                              onChange={handleChange}
                              required
                              className="w-full p-3 mt-2 border border-blue-300 rounded-xl bg-blue-50 outline-none"
                              placeholder="Nhập tên thương hiệu"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Hình ảnh sản phẩm
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-1" />
                          <p className="text-sm text-gray-600 font-medium">
                            Click hoặc kéo thả ảnh
                          </p>
                        </div>
                        {previews.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto py-2">
                            {previews.map((src, index) => (
                              <img
                                key={index}
                                src={src}
                                alt="preview"
                                className="h-16 w-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Mô tả chi tiết
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 resize-none"
                        placeholder="Nhập mô tả cho sản phẩm..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50">
                  <div className="flex justify-between items-center border-b border-blue-100 pb-3 mb-5">
                    <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                      <Layers size={20} className="text-blue-600" /> Phiên bản
                      bán hàng
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
                    {form.variants.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveVariantTab(idx)}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-all border-b-2 ${
                          activeVariantTab === idx
                            ? "bg-blue-50 text-blue-700 border-blue-600"
                            : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Biến thể {idx + 1} {v.sku ? `(${v.sku})` : ""}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={addVariant}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PlusCircle size={16} /> Thêm biến thể
                    </button>
                  </div>

                  {form.variants[activeVariantTab] &&
                    (() => {
                      const variant = form.variants[activeVariantTab];
                      const index = activeVariantTab;
                      return (
                        <div className="bg-gray-50 p-5 border border-gray-200 rounded-xl relative">
                          {form.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                              title="Xóa phiên bản này"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                          <h4 className="font-bold text-gray-700 mb-4">
                            Thông tin cơ bản
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                Mã SKU *
                              </label>
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "sku",
                                    e.target.value,
                                  )
                                }
                                required
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                Giá bán (₫) *
                              </label>
                              <input
                                type="number"
                                value={variant.price}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                required
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                Tồn kho
                              </label>
                              <input
                                type="number"
                                value={variant.total_stock}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "total_stock",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                RAM
                              </label>
                              <input
                                type="text"
                                value={variant.ram}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "ram",
                                    e.target.value,
                                  )
                                }
                                placeholder="VD: 8GB"
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                Bộ nhớ
                              </label>
                              <input
                                type="text"
                                value={variant.storage}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "storage",
                                    e.target.value,
                                  )
                                }
                                placeholder="VD: 256GB"
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                Màu sắc
                              </label>
                              <input
                                type="text"
                                value={variant.color}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "color",
                                    e.target.value,
                                  )
                                }
                                placeholder="VD: Đen"
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                  <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-bl-xl text-sm shadow-sm">
                    Đang sửa thông số cho: Biến thể {activeVariantTab + 1}
                  </div>

                  <div className="flex justify-between items-center border-b pb-3 mb-5 mt-2">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <Settings size={20} className="text-gray-600" /> Thông số
                      kỹ thuật (Theo phiên bản đang chọn)
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {formSortedGroups.map((groupName) => {
                      const isOpen = formOpenGroups[groupName];
                      const specsInGroup = formGroupedSpecs[groupName] || [];

                      return (
                        <div key={groupName} className="w-full">
                          <button
                            type="button"
                            onClick={() => toggleFormGroup(groupName)}
                            className={`w-full flex justify-between items-center px-5 py-4 bg-[#f4f6f8] hover:bg-[#e9ecef] transition-colors ${
                              isOpen ? "rounded-t-lg" : "rounded-lg"
                            }`}
                          >
                            <span className="text-gray-800 text-[15px] font-medium">
                              {groupName}
                            </span>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>

                          {isOpen && (
                            <div className="bg-white px-5 py-4 border-x border-b border-[#f4f6f8] rounded-b-lg space-y-3">
                              {specsInGroup.map((spec) => (
                                <div
                                  key={spec.originalIndex}
                                  className="flex gap-3 items-center border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                                >
                                  <div className="w-1/3">
                                    <input
                                      type="text"
                                      value={spec.name}
                                      onChange={(e) =>
                                        handleVariantSpecChange(
                                          spec.originalIndex,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Tên (VD: Độ phân giải)"
                                      className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                                    />
                                  </div>
                                  <div className="w-2/3 flex gap-2">
                                    <input
                                      type="text"
                                      value={spec.value_text}
                                      onChange={(e) =>
                                        handleVariantSpecChange(
                                          spec.originalIndex,
                                          "value_text",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Giá trị (VD: 8GB)"
                                      className="flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeVariantSpec(spec.originalIndex)
                                      }
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Xóa"
                                    >
                                      <MinusCircle size={20} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVariants = [...form.variants];
                                    const activeVar = {
                                      ...newVariants[activeVariantTab],
                                    };
                                    activeVar.product_variant_specs = [
                                      ...activeVar.product_variant_specs,
                                    ];
                                    activeVar.product_variant_specs.push({
                                      group_name: groupName,
                                      name: "",
                                      value_text: "",
                                      unit: "",
                                    });
                                    newVariants[activeVariantTab] = activeVar;
                                    setForm({ ...form, variants: newVariants });
                                  }}
                                  className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                                >
                                  <Plus size={16} /> Thêm thông số vào nhóm
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="text"
                        value={newGroupInput}
                        onChange={(e) => setNewGroupInput(e.target.value)}
                        placeholder="Tên nhóm mới (VD: Thiết kế)..."
                        className="flex-1 max-w-[300px] p-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = newGroupInput.trim();
                          if (val) {
                            const newVariants = [...form.variants];
                            const activeVar = {
                              ...newVariants[activeVariantTab],
                            };
                            activeVar.product_variant_specs = [
                              ...activeVar.product_variant_specs,
                            ];
                            activeVar.product_variant_specs.push({
                              group_name: val,
                              name: "",
                              value_text: "",
                              unit: "",
                            });
                            newVariants[activeVariantTab] = activeVar;
                            setForm({ ...form, variants: newVariants });

                            setFormOpenGroups((prev) => ({
                              ...prev,
                              [val]: true,
                            }));
                            setNewGroupInput("");
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <PlusCircle size={16} /> Tạo nhóm
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-gray-200 flex gap-3 justify-end bg-white">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 border border-transparent hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="productForm"
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
              >
                {isEditing ? "Lưu thay đổi" : "Lưu sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
