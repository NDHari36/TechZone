// Script để thêm 5 tablet (lần thứ 3)

const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbIltPV05FUl0iXSwidXNlcmlkIjoyLCJzdWIiOiJiaW5oIiwiaWF0IjoxNzY1MzEzOTY2LCJleHAiOjE3NjU0MjE5NjZ9.CEL6a0xETiXs53q6n-_rpAyanaeGe8vYmOTcIsQsaDM';
const localImageUrl = 'http://localhost:5173/images/393218017_386328890623716_826243591427603935_n.jpg';

const productsToAdd = [
  {
    name: "iPad Pro 11\" M2",
    color: "Space Gray",
    storage: "256GB",
    price: 24990000,
    description: "iPad Pro 11 inch với chip M2, Apple Pencil support.",
    isActive: true,
    brandId: 1,
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
    description: "Samsung Galaxy Tab S9 với Snapdragon 8 Gen 2.",
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
    description: "iPad Air 6th generation với chip M2.",
    isActive: true,
    brandId: 1,
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
    description: "Lenovo Tab M11 Pro với MediaTek, màn hình 11.5 inch OLED.",
    isActive: true,
    brandId: 3,
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
    description: "iPad 10th generation - entry-level tablet.",
    isActive: true,
    brandId: 1,
    categoryId: 3,
    stock: "20",
    specs: [
      { name: "CPU", value: "Apple A14 Bionic" },
      { name: "RAM", value: "4GB" },
      { name: "Màn hình", value: "10.9 inch Liquid Retina, 2360x1640" },
      { name: "Pin", value: "28.6-Wh" }
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
        // Bỏ qua
      }
    }

    if (!response.ok) {
      console.error(`❌ Lỗi: "${product.name}": HTTP ${response.status}`);
      return false;
    }

    const productId = data?.result?.id || data?.id || '?';
    console.log(`✅ Thêm: "${product.name}" (ID: ${productId})`);
    return true;
  } catch (error) {
    console.error(`❌ Lỗi: "${product.name}": ${error.message}`);
    return false;
  }
}

async function addAllProducts() {
  console.log('🚀 Thêm 5 tablet...\n');

  let successCount = 0;
  for (const product of productsToAdd) {
    const success = await addProduct(product, accessToken);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Kết quả: ${successCount}/${productsToAdd.length} tablet`);
}

addAllProducts();
