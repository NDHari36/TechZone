// Script để thêm 20 sản phẩm đa dạng vào database với local image
// Chạy bằng: node scripts/seedProducts.js
// Bạn có thể chỉnh sửa token trong biến accessToken nếu cần

const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbIltPV05FUl0iXSwidXNlcmlkIjoyLCJzdWIiOiJiaW5oIiwiaWF0IjoxNzY1MzEzOTY2LCJleHAiOjE3NjU0MjE5NjZ9.CEL6a0xETiXs53q6n-_rpAyanaeGe8vYmOTcIsQsaDM';

// URL ảnh local từ Vite public folder
const localImageUrl = 'http://localhost:5173/images/393218017_386328890623716_826243591427603935_n.jpg';

const productsToAdd = [
  // ===== ĐIỆN THOẠI (categoryId: 1) =====
  {
    name: "iPhone 15 Pro",
    color: "Space Black",
    storage: "256GB",
    price: 29990000,
    description: "iPhone 15 Pro với chip A17 Pro, camera 48MP, màn hình 6.1 inch Super Retina XDR.",
    isActive: true,
    brandId: 1,
    categoryId: 1,
    stock: "12",
    specs: [
      { name: "Màn hình", value: "6.1 inch Super Retina XDR, 120Hz" },
      { name: "Chip", value: "Apple A17 Pro" },
      { name: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
      { name: "Pin", value: "3349 mAh, 20W Fast Charging" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "iPhone 14 Plus",
    color: "Blue",
    storage: "128GB",
    price: 24990000,
    description: "iPhone 14 Plus với chip A15 Bionic, màn hình 6.7 inch Super Retina XDR lớn.",
    isActive: true,
    brandId: 1,
    categoryId: 1,
    stock: "15",
    specs: [
      { name: "Màn hình", value: "6.7 inch Super Retina XDR, 60Hz" },
      { name: "Chip", value: "Apple A15 Bionic" },
      { name: "Camera", value: "12MP Dual Camera System" },
      { name: "Pin", value: "4325 mAh" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Samsung Galaxy S24",
    color: "Phantom Black",
    storage: "256GB",
    price: 22990000,
    description: "Samsung Galaxy S24 với Snapdragon 8 Gen 3, AI features, màn hình 6.2 inch Dynamic AMOLED.",
    isActive: true,
    brandId: 2,
    categoryId: 1,
    stock: "18",
    specs: [
      { name: "Màn hình", value: "6.2 inch Dynamic AMOLED 2X, 120Hz" },
      { name: "Chip", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "50MP Main + 12MP + 10MP" },
      { name: "Pin", value: "4000 mAh, 25W Fast Charging" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Google Pixel 8",
    color: "Obsidian",
    storage: "128GB",
    price: 19990000,
    description: "Google Pixel 8 với Google Tensor G3, AI photography, màn hình 6.2 inch OLED.",
    isActive: true,
    brandId: 3,
    categoryId: 1,
    stock: "10",
    specs: [
      { name: "Màn hình", value: "6.2 inch OLED, 120Hz" },
      { name: "Chip", value: "Google Tensor G3" },
      { name: "Camera", value: "50MP Main + 48MP Ultra Wide" },
      { name: "Pin", value: "4700 mAh, 30W Fast Charging" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Xiaomi 14",
    color: "Silver",
    storage: "512GB",
    price: 18990000,
    description: "Xiaomi 14 với Snapdragon 8 Gen 3, camera Leica, màn hình 6.36 inch AMOLED.",
    isActive: true,
    brandId: 4,
    categoryId: 1,
    stock: "20",
    specs: [
      { name: "Màn hình", value: "6.36 inch AMOLED, 120Hz" },
      { name: "Chip", value: "Snapdragon 8 Gen 3 Leading Version" },
      { name: "Camera", value: "50MP Leica Main + 50MP Ultra Wide + Periscope" },
      { name: "Pin", value: "5000 mAh, 90W Fast Charging" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "OnePlus 12",
    color: "Silky Black",
    storage: "256GB",
    price: 17990000,
    description: "OnePlus 12 với Snapdragon 8 Gen 3, OxygenOS 14, camera 50MP + 48MP, pin 5400 mAh.",
    isActive: true,
    brandId: 5,
    categoryId: 1,
    stock: "13",
    specs: [
      { name: "Màn hình", value: "6.7 inch AMOLED, 120Hz" },
      { name: "Chip", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "50MP Main + 48MP Ultra Wide + 64MP Telephoto" },
      { name: "Pin", value: "5400 mAh, 100W Fast Charging" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },

  // ===== LAPTOP (categoryId: 2) =====
  {
    name: "MacBook Pro 14\" M3",
    color: "Space Black",
    storage: "512GB",
    price: 49990000,
    description: "MacBook Pro 14 inch với chip M3, GPU 8-core, màn hình Liquid Retina XDR.",
    isActive: true,
    brandId: 6,
    categoryId: 2,
    stock: "8",
    specs: [
      { name: "CPU", value: "Apple M3 (8-core)" },
      { name: "GPU", value: "8-core GPU" },
      { name: "RAM", value: "8GB Unified Memory" },
      { name: "Màn hình", value: "14 inch Liquid Retina XDR" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Dell XPS 13",
    color: "Platinum",
    storage: "512GB",
    price: 32990000,
    description: "Dell XPS 13 Plus với Intel Core Ultra, màn hình 13.4 inch OLED, siêu nhẹ.",
    isActive: true,
    brandId: 7,
    categoryId: 2,
    stock: "12",
    specs: [
      { name: "CPU", value: "Intel Core Ultra 5" },
      { name: "RAM", value: "16GB LPDDR5X" },
      { name: "SSD", value: "512GB NVMe" },
      { name: "Màn hình", value: "13.4 inch OLED, 3840x2400" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "ASUS Vivobook 15",
    color: "Cool Silver",
    storage: "512GB",
    price: 16990000,
    description: "ASUS Vivobook 15 với AMD Ryzen 7, màn hình 15.6 inch Full HD, pin 12 giờ.",
    isActive: true,
    brandId: 8,
    categoryId: 2,
    stock: "14",
    specs: [
      { name: "CPU", value: "AMD Ryzen 7 7730U" },
      { name: "RAM", value: "16GB DDR5" },
      { name: "SSD", value: "512GB SSD" },
      { name: "Màn hình", value: "15.6 inch FHD, 60Hz" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    color: "Black",
    storage: "256GB",
    price: 34990000,
    description: "Lenovo ThinkPad X1 Carbon Gen 12 - Laptop business nhẹ, bàn phím tuyệt vời.",
    isActive: true,
    brandId: 9,
    categoryId: 2,
    stock: "10",
    specs: [
      { name: "CPU", value: "Intel Core i7-1365U" },
      { name: "RAM", value: "16GB LPDDR5" },
      { name: "SSD", value: "512GB SSD" },
      { name: "Màn hình", value: "14 inch OLED, 2880x1800" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "HP Pavilion 15",
    color: "Natural Silver",
    storage: "512GB",
    price: 15990000,
    description: "HP Pavilion 15 với Intel Core i5, màn hình 15.6 inch, GPU Intel Iris Xe.",
    isActive: true,
    brandId: 10,
    categoryId: 2,
    stock: "16",
    specs: [
      { name: "CPU", value: "Intel Core i5-12500H" },
      { name: "RAM", value: "8GB DDR4" },
      { name: "SSD", value: "512GB SSD" },
      { name: "Màn hình", value: "15.6 inch FHD" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },

  // ===== TABLET (categoryId: 3) =====
  {
    name: "iPad Pro 11\" M2",
    color: "Space Gray",
    storage: "256GB",
    price: 24990000,
    description: "iPad Pro 11 inch với chip M2, Apple Pencil support, màn hình Liquid Retina.",
    isActive: true,
    brandId: 6,
    categoryId: 3,
    stock: "9",
    specs: [
      { name: "CPU", value: "Apple M2" },
      { name: "RAM", value: "8GB" },
      { name: "Màn hình", value: "11 inch Liquid Retina, 2388x1668" },
      { name: "Camera", value: "12MP Wide + 10MP Ultra Wide" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Samsung Galaxy Tab S9",
    color: "Graphite",
    storage: "128GB",
    price: 15990000,
    description: "Samsung Galaxy Tab S9 với Snapdragon 8 Gen 2, màn hình 11 inch AMOLED, S Pen.",
    isActive: true,
    brandId: 2,
    categoryId: 3,
    stock: "13",
    specs: [
      { name: "CPU", value: "Snapdragon 8 Gen 2" },
      { name: "RAM", value: "8GB" },
      { name: "Màn hình", value: "11 inch Dynamic AMOLED 2X, 120Hz" },
      { name: "Pin", value: "8000 mAh" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "iPad Air 6th Gen",
    color: "Purple",
    storage: "128GB",
    price: 16990000,
    description: "iPad Air 6th generation với chip M2, màn hình 11 inch Liquid Retina, 5G.",
    isActive: true,
    brandId: 6,
    categoryId: 3,
    stock: "11",
    specs: [
      { name: "CPU", value: "Apple M2" },
      { name: "RAM", value: "8GB" },
      { name: "Màn hình", value: "11 inch Liquid Retina, 2360x1640" },
      { name: "Kết nối", value: "5G, Wi-Fi 6E" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Lenovo Tab M11 Pro",
    color: "Storm Gray",
    storage: "128GB",
    price: 12990000,
    description: "Lenovo Tab M11 Pro với MediaTek Kompanio 1300T, màn hình 11.5 inch OLED.",
    isActive: true,
    brandId: 9,
    categoryId: 3,
    stock: "14",
    specs: [
      { name: "CPU", value: "MediaTek Kompanio 1300T" },
      { name: "RAM", value: "12GB" },
      { name: "Màn hình", value: "11.5 inch OLED, 2944x1840" },
      { name: "Pin", value: "13000 mAh, 45W" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "iPad (10th Gen)",
    color: "Blue",
    storage: "64GB",
    price: 10990000,
    description: "iPad 10th generation - entry-level tablet với chip A14 Bionic, 10.9 inch.",
    isActive: true,
    brandId: 6,
    categoryId: 3,
    stock: "20",
    specs: [
      { name: "CPU", value: "Apple A14 Bionic" },
      { name: "RAM", value: "4GB" },
      { name: "Màn hình", value: "10.9 inch Liquid Retina, 2360x1640" },
      { name: "Pin", value: "28.6-Wh" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },

  // ===== ĐỒ ĐIỆN TỬ - PHỤ KIỆN (categoryId: 1) =====
  {
    name: "Apple Watch Ultra",
    color: "Titanium",
    storage: "32GB",
    price: 12990000,
    description: "Apple Watch Ultra với màn hình LTPO OLED 49mm, pin 2 ngày, Action button.",
    isActive: true,
    brandId: 6,
    categoryId: 1,
    stock: "7",
    specs: [
      { name: "Màn hình", value: "49mm LTPO OLED" },
      { name: "Chip", value: "S9 SiP" },
      { name: "Pin", value: "Up to 36 hours" },
      { name: "Chống nước", value: "Water resistant to 100m" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Samsung Galaxy Buds Pro",
    color: "Black",
    storage: "5GB",
    price: 4990000,
    description: "Samsung Galaxy Buds Pro - Tai nghe không dây với ANC, âm thanh Hi-Fi.",
    isActive: true,
    brandId: 2,
    categoryId: 1,
    stock: "25",
    specs: [
      { name: "Công nghệ", value: "True Wireless Stereo" },
      { name: "ANC", value: "Active Noise Cancellation" },
      { name: "Pin", value: "5 hours per charge + 20 hours with case" },
      { name: "Codec", value: "SSC (Seamless Codec)" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Sony WH-1000XM5",
    color: "Black",
    storage: "N/A",
    price: 7990000,
    description: "Sony WH-1000XM5 - Tai nghe over-ear với ANC tốt nhất, Hi-Res Audio.",
    isActive: true,
    brandId: 11,
    categoryId: 1,
    stock: "11",
    specs: [
      { name: "Loại", value: "Over-ear Wireless" },
      { name: "ANC", value: "Industry-leading ANC" },
      { name: "Pin", value: "Up to 24 hours" },
      { name: "Âm thanh", value: "Hi-Res Audio" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  },
  {
    name: "Apple AirPods Pro",
    color: "White",
    storage: "N/A",
    price: 5990000,
    description: "Apple AirPods Pro - Tai nghe in-ear với ANC, Spatial Audio, Find My.",
    isActive: true,
    brandId: 6,
    categoryId: 1,
    stock: "18",
    specs: [
      { name: "Tính năng", value: "ANC, Transparency mode, Spatial Audio" },
      { name: "Pin", value: "6 hours + 30 hours with case" },
      { name: "Codec", value: "AAC" },
      { name: "IP rating", value: "IP54" }
    ],
    images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
  }
];

async function addProduct(product, token) {
  try {
    const response = await fetch('http://localhost:8081/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Bỏ qua nếu không parse được
      }
    }

    if (!response.ok) {
      console.error(`❌ Lỗi khi thêm "${product.name}": HTTP ${response.status}`, data?.message || text?.substring(0, 100));
      return false;
    }

    const productId = data?.result?.id || data?.id || '?';
    console.log(`✅ Thêm thành công: "${product.name}" (ID: ${productId})`);
    return true;
  } catch (error) {
    console.error(`❌ Lỗi khi thêm "${product.name}":`, error.message);
    return false;
  }
}

async function addAllProducts() {
  console.log('🚀 Bắt đầu thêm 20 sản phẩm...\n');

  let successCount = 0;
  let failCount = 0;

  for (const product of productsToAdd) {
    const success = await addProduct(product, accessToken);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Delay 500ms giữa các request
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Kết quả cuối cùng:`);
  console.log(`   ✅ Thành công: ${successCount}/${productsToAdd.length}`);
  console.log(`   ❌ Thất bại: ${failCount}/${productsToAdd.length}`);
  
  if (successCount === productsToAdd.length) {
    console.log('\n🎉 Tất cả sản phẩm đã được thêm thành công!');
  }
}

addAllProducts();
