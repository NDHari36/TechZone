// Script để thêm sản phẩm vào database
// Chạy bằng: node scripts/addProducts.js

const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbIltPV05FUl0iXSwidXNlcmlkIjoxLCJzdWIiOiJiaW5oaGhpIiwiaWF0IjoxNzY1MzEyMTE4LCJleHAiOjE3NjU0MjAxMTh9.HxNyJt8-rPiQH66lF4F6YeAuqgcveHvqFkdz_KgAwHo'; // Thay bằng token của bạn
// Nếu backend yêu cầu session cookie (JSESSIONID) đi kèm, đặt giá trị ở đây (ví dụ lấy từ browser hoặc Postman)
const sessionCookie = '';

const productsToAdd = [
  // ===== ĐIỆN THOẠI =====
  {
    name: "iPhone 15 Pro Max",
    color: "Titan Black",
    storage: "256GB",
    price: 32990000,
    description: "iPhone 15 Pro Max với chip A17 Pro, camera 48MP, màn hình 6.7 inch Super Retina XDR.",
    isActive: true,
    brandId: 1,
    categoryId: 1,
    stock: "15",
    specs: [
      { name: "Screen", value: "6.7 inch Super Retina XDR, 120Hz" },
      { name: "Chip", value: "Apple A17 Pro" },
      { name: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
      { name: "Battery", value: "4500 mAh, 25W Fast Charging" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    color: "Phantom Black",
    storage: "512GB",
    price: 35990000,
    description: "Samsung Galaxy S24 Ultra với chip Snapdragon 8 Gen 3, camera 200MP, màn hình 6.8 inch Dynamic AMOLED.",
    isActive: true,
    brandId: 2,
    categoryId: 1,
    stock: "12",
    specs: [
      { name: "Screen", value: "6.8 inch Dynamic AMOLED 2X, 120Hz" },
      { name: "Chip", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "200MP Main + 50MP Ultra Wide + 10MP + 10MP Telephoto" },
      { name: "Battery", value: "5000 mAh, 45W Fast Charging" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "Google Pixel 8 Pro",
    color: "Obsidian",
    storage: "256GB",
    price: 28990000,
    description: "Google Pixel 8 Pro với Google Tensor G3, AI photography, màn hình 6.7 inch OLED.",
    isActive: true,
    brandId: 3,
    categoryId: 1,
    stock: "10",
    specs: [
      { name: "Screen", value: "6.7 inch OLED, 120Hz" },
      { name: "Chip", value: "Google Tensor G3" },
      { name: "Camera", value: "50MP Main + 48MP Ultra Wide + 48MP Telephoto" },
      { name: "Battery", value: "5000 mAh, 37W Fast Charging" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1511686564217-338d3d3dd34d?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "Xiaomi 14 Ultra",
    color: "Silver",
    storage: "512GB",
    price: 24990000,
    description: "Xiaomi 14 Ultra với chip Snapdragon 8 Gen 3, camera Leica, màn hình 6.73 inch.",
    isActive: true,
    brandId: 4,
    categoryId: 1,
    stock: "20",
    specs: [
      { name: "Screen", value: "6.73 inch AMOLED, 120Hz" },
      { name: "Chip", value: "Snapdragon 8 Gen 3 Leading Version" },
      { name: "Camera", value: "50MP Leica Main + 50MP Ultra Wide + 50MP + 50MP Telephoto" },
      { name: "Battery", value: "5300 mAh, 90W Fast Charging" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1516746881803-c2a3e4b00b7d?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },

  // ===== LAPTOP =====
  {
    name: "MacBook Pro 16\" M3 Max",
    color: "Space Gray",
    storage: "512GB",
    price: 79990000,
    description: "MacBook Pro 16 inch với chip M3 Max, GPU 12-core, màn hình Liquid Retina XDR.",
    isActive: true,
    brandId: 5,
    categoryId: 2,
    stock: "8",
    specs: [
      { name: "Processor", value: "Apple M3 Max (12-core CPU, 18-core GPU)" },
      { name: "Memory", value: "24GB Unified Memory" },
      { name: "Storage", value: "512GB SSD" },
      { name: "Display", value: "16 inch Liquid Retina XDR, 3456x2234" },
      { name: "Battery", value: "Up to 18 hours" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "Dell XPS 15",
    color: "Platinum",
    storage: "512GB",
    price: 54990000,
    description: "Dell XPS 15 với Intel Core i7, RTX 4060, màn hình 15.6 inch 4K OLED.",
    isActive: true,
    brandId: 6,
    categoryId: 2,
    stock: "10",
    specs: [
      { name: "Processor", value: "Intel Core i7-13700H" },
      { name: "Memory", value: "16GB DDR5" },
      { name: "Storage", value: "512GB NVMe SSD" },
      { name: "Display", value: "15.6 inch 4K OLED, 3840x2400" },
      { name: "Graphics", value: "NVIDIA RTX 4060" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "ASUS ROG Zephyrus G14",
    color: "Eclipse Gray",
    storage: "1TB",
    price: 69990000,
    description: "ASUS ROG Zephyrus G14 - Gaming laptop siêu mạnh với RTX 4090, màn hình 2.5K 240Hz.",
    isActive: true,
    brandId: 7,
    categoryId: 2,
    stock: "6",
    specs: [
      { name: "Processor", value: "Intel Core i9-13900HX" },
      { name: "Memory", value: "32GB DDR5" },
      { name: "Storage", value: "1TB NVMe SSD" },
      { name: "Display", value: "14 inch 2.5K OLED, 240Hz" },
      { name: "Graphics", value: "NVIDIA RTX 4090" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1588872657840-18491dbba9fa?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    color: "Black",
    storage: "512GB",
    price: 34990000,
    description: "Lenovo ThinkPad X1 Carbon Gen 12 - Laptop business siêu nhẹ, pin 24 giờ.",
    isActive: true,
    brandId: 8,
    categoryId: 2,
    stock: "12",
    specs: [
      { name: "Processor", value: "Intel Core i7-1365U" },
      { name: "Memory", value: "16GB LPDDR5" },
      { name: "Storage", value: "512GB SSD" },
      { name: "Display", value: "14 inch OLED, 2880x1800" },
      { name: "Battery", value: "Up to 24 hours" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },

  // ===== IPAD / TABLET =====
  {
    name: "iPad Pro 12.9\" M2",
    color: "Space Gray",
    storage: "256GB",
    price: 32990000,
    description: "iPad Pro 12.9 inch với chip M2, màn hình Liquid Retina XDR, hỗ trợ Apple Pencil Pro.",
    isActive: true,
    brandId: 1,
    categoryId: 3,
    stock: "10",
    specs: [
      { name: "Processor", value: "Apple M2" },
      { name: "Memory", value: "8GB" },
      { name: "Storage", value: "256GB" },
      { name: "Display", value: "12.9 inch Liquid Retina XDR, 2732x2048" },
      { name: "Camera", value: "12MP Wide + 10MP Ultra Wide" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "Samsung Galaxy Tab S9 Ultra",
    color: "Graphite",
    storage: "256GB",
    price: 24990000,
    description: "Samsung Galaxy Tab S9 Ultra 14.6 inch - Máy tính bảng cao cấp với chip Snapdragon 8 Gen 2.",
    isActive: true,
    brandId: 2,
    categoryId: 3,
    stock: "8",
    specs: [
      { name: "Processor", value: "Snapdragon 8 Gen 2" },
      { name: "Memory", value: "12GB RAM" },
      { name: "Storage", value: "256GB" },
      { name: "Display", value: "14.6 inch AMOLED, 2960x1848" },
      { name: "Camera", value: "13MP Main + 8MP Ultra Wide" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1533092171554-da228d53f9b6?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "iPad Air 6th Gen",
    color: "Purple",
    storage: "128GB",
    price: 16990000,
    description: "iPad Air 6th generation với chip M2, màn hình 11 inch Liquid Retina, kết nối 5G.",
    isActive: true,
    brandId: 1,
    categoryId: 3,
    stock: "15",
    specs: [
      { name: "Processor", value: "Apple M2" },
      { name: "Memory", value: "8GB" },
      { name: "Storage", value: "128GB" },
      { name: "Display", value: "11 inch Liquid Retina, 2360x1640" },
      { name: "Connectivity", value: "5G, Wi-Fi 6E" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1526045431048-9550588827ae?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  },
  {
    name: "Lenovo Tab P12 Pro",
    color: "Storm Gray",
    storage: "256GB",
    price: 18990000,
    description: "Lenovo Tab P12 Pro - Tablet tuyệt vời cho giải trí, chip MediaTek Kompanio 1300T.",
    isActive: true,
    brandId: 8,
    categoryId: 3,
    stock: "10",
    specs: [
      { name: "Processor", value: "MediaTek Kompanio 1300T" },
      { name: "Memory", value: "12GB RAM" },
      { name: "Storage", value: "256GB" },
      { name: "Display", value: "12.6 inch OLED, 2880x1920" },
      { name: "Camera", value: "13MP Main + 13MP Ultra Wide" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1517697313584-7626bde176ad?w=500&h=500&fit=crop",
        primary: true,
        sortOrder: 1
      }
    ]
  }
];

async function addProduct(product, token) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'User-Agent': 'SopPings-DataSeeder/1.0',
      'Origin': 'http://localhost:5173'
    };
    if (sessionCookie && sessionCookie.length > 0) {
      headers['Cookie'] = sessionCookie;
    }

    const response = await fetch('http://localhost:8081/api/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(product)
    });
    // Read raw text first to avoid json parse error on empty responses
    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        // keep data as null but log warning
        console.warn(`⚠️ Không thể parse JSON trả về cho "${product.name}":`, parseErr.message);
      }
    }

    if (!response.ok) {
      // response may not include JSON body; provide useful debug info
      console.error(`❌ Lỗi khi thêm "${product.name}": HTTP ${response.status} ${response.statusText}`,
        data || text || null);
      try {
        // dump headers to help debugging (e.g., any server error header)
        for (const [k, v] of response.headers.entries()) {
          console.debug(`Header: ${k} => ${v}`);
        }
      } catch (hdrErr) {
        console.debug('Không thể đọc headers:', hdrErr.message);
      }
      return false;
    }

    if (data && data.result && (data.result.id || data.result.id === 0)) {
      console.log(`✅ Thêm thành công: "${product.name}" (ID: ${data.result.id})`);
    } else {
      console.log(`✅ Thêm thành công: "${product.name}" (HTTP ${response.status}) - không có ID trả về`);
      if (text) console.debug('Raw response text:', text);
    }
    return true;
  } catch (error) {
    console.error(`❌ Lỗi khi thêm "${product.name}":`, error.message);
    return false;
  }
}

async function addAllProducts() {
  console.log('🚀 Bắt đầu thêm sản phẩm...\n');

  if (accessToken === 'YOUR_ACCESS_TOKEN_HERE') {
    console.error('❌ Lỗi: Vui lòng cập nhật access token trong file này!');
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  for (const product of productsToAdd) {
    const success = await addProduct(product, accessToken);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Delay giữa các request để tránh quá tải / chặn rate-limit
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  console.log(`\n📊 Kết quả: ${successCount} thành công, ${failCount} thất bại`);
}

addAllProducts();
