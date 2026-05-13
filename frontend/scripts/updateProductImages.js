// Script để cập nhật thumbnail URL của tất cả sản phẩm thành local image
// Chạy bằng: node scripts/updateProductImages.js

const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbIltPV05FUl0iXSwidXNlcmlkIjoyLCJzdWIiOiJiaW5oIiwiaWF0IjoxNzY1MzEzOTY2LCJleHAiOjE3NjU0MjE5NjZ9.CEL6a0xETiXs53q6n-_rpAyanaeGe8vYmOTcIsQsaDM';
const localImageUrl = 'http://localhost:5173/images/393218017_386328890623716_826243591427603935_n.jpg';

async function getProducts() {
  try {
    const response = await fetch('http://localhost:8081/api/products?page=0&size=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    return data.result?.content || data.result || [];
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
}

async function updateProduct(product) {
  try {
    // Create updated product with local image
    const updatedProduct = {
      ...product,
      thumbnailUrl: localImageUrl,
      images: [{ imageUrl: localImageUrl, primary: true, sortOrder: 1 }]
    };

    const response = await fetch(`http://localhost:8081/api/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct),
      credentials: 'include'
    });

    if (!response.ok) {
      console.error(`❌ Lỗi cập nhật "${product.name}": HTTP ${response.status}`);
      return false;
    }

    console.log(`✅ Cập nhật: "${product.name}" với local image`);
    return true;
  } catch (error) {
    console.error(`❌ Lỗi cập nhật "${product.name}":`, error.message);
    return false;
  }
}

async function updateAllProducts() {
  console.log('🚀 Bắt đầu cập nhật thumbnail cho tất cả sản phẩm...\n');

  const products = await getProducts();
  console.log(`📦 Tìm thấy ${products.length} sản phẩm\n`);

  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    const success = await updateProduct(product);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Delay 500ms giữa các request
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Kết quả cuối cùng:`);
  console.log(`   ✅ Thành công: ${successCount}/${products.length}`);
  console.log(`   ❌ Thất bại: ${failCount}/${products.length}`);
  
  if (successCount === products.length) {
    console.log('\n🎉 Tất cả sản phẩm đã được cập nhật thành công!');
  }
}

updateAllProducts();
