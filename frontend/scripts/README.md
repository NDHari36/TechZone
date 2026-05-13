# Hướng dẫn thêm sản phẩm vào database

## Bước 1: Lấy Access Token

1. Đăng nhập vào ứng dụng
2. Mở DevTools (F12)
3. Vào Console tab
4. Chạy lệnh:
```javascript
localStorage.getItem('authToken')
```
5. Copy token (bỏ phần "Bearer ")

## Bước 2: Cập nhật token trong script

Mở file `scripts/addProducts.js` và thay dòng:
```javascript
const accessToken = 'YOUR_ACCESS_TOKEN_HERE';
```

Thành:
```javascript
const accessToken = 'YOUR_COPIED_TOKEN_HERE';
```

## Bước 3: Chạy script

Mở terminal tại thư mục gốc và chạy:
```bash
node scripts/addProducts.js
```

## Kết quả

Script sẽ thêm 13 sản phẩm:
- **4 sản phẩm Điện thoại**: iPhone 15 Pro Max, Samsung Galaxy S24 Ultra, Google Pixel 8 Pro, Xiaomi 14 Ultra
- **4 sản phẩm Laptop**: MacBook Pro, Dell XPS 15, ASUS ROG Zephyrus G14, Lenovo ThinkPad X1
- **5 sản phẩm Tablet/iPad**: iPad Pro 12.9", Samsung Galaxy Tab S9, iPad Air, Lenovo Tab P12

## Lưu ý

- Tất cả sản phẩm sẽ được set `isActive: true`
- Hình ảnh sử dụng Unsplash API (free)
- Giá tiền đã convert sang VNĐ
- Có thể thêm/sửa sản phẩm trong mảng `productsToAdd` trước khi chạy script

## Xóa sản phẩm (nếu cần)

Sử dụng Postman hoặc curl:
```bash
curl -X DELETE 'http://localhost:8081/api/products/{productId}' \
  --header 'Authorization: Bearer YOUR_TOKEN'
```

## API Endpoints

- **GET** `/api/products` - Lấy danh sách sản phẩm
- **GET** `/api/products/{id}` - Chi tiết sản phẩm
- **POST** `/api/products` - Thêm sản phẩm (cần token)
- **PUT** `/api/products/{id}` - Sửa sản phẩm (cần token)
- **DELETE** `/api/products/{id}` - Xóa sản phẩm (cần token)
