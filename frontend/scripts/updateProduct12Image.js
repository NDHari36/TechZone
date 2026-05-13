// Usage:
// 1) Place your image at: public/images/hamster.jpg (so Vite serves it at http://localhost:5173/images/hamster.jpg)
// 2) Run: node scripts/updateProduct12Image.js YOUR_BEARER_TOKEN

const token = process.argv[2] || process.env.AUTH_TOKEN;
if (!token) {
  console.error('Missing token. Usage: node scripts/updateProduct12Image.js YOUR_BEARER_TOKEN');
  process.exit(1);
}

const productId = 12; // update this id if needed
const imageUrl = 'http://localhost:5173/images/hamster.jpg';

const body = {
  name: 'Iphone',
  color: 'Đỏ đen trắng',
  storage: '256GB',
  price: 18990000,
  description: 'Iphone trùm thế giới.',
  isActive: true,
  brandId: 1,
  categoryId: 1,
  specs: [
    { name: 'Screen', value: '6.2 inch Dynamic AMOLED 2X, 120Hz' },
    { name: 'Chip', value: 'Exynos 2400' },
    { name: 'Battery', value: '4000 mAh' },
  ],
  images: [
    { imageUrl, primary: true, sortOrder: 1 },
  ],
  // also set thumbnailUrl if your API uses it
  thumbnailUrl: imageUrl,
};

(async () => {
  try {
    const res = await fetch(`http://localhost:8081/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Update failed:', res.status, text);
      process.exit(2);
    }

    try {
      const data = JSON.parse(text);
      console.log('Update successful:', JSON.stringify(data, null, 2));
    } catch {
      console.log('Update response:', text);
    }
  } catch (err) {
    console.error('Request error:', err);
    process.exit(3);
  }
})();
