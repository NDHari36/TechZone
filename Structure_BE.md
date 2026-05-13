backend/
│
├── database/ # Lưu CSDL
├── node_modules/ # Thư viện tải về
├── src/ # Source code chính
│ ├── config/ # Cấu hình hệ thống
│ │ └── db.js # Kết nối MySQL (host, user, pass)
│ │
│ ├── controllers/ # Xử lý logic nghiệp vụ
│ │ ├── addressController.js
│ │ ├── authController.js
│ │ ├── cartController.js
│ │ ├── couponsController.js
│ │ ├── dashboardController.js
│ │ ├── orderController.js
│ │ ├── productController.js
│ │ └── userController.js
│ │
│ ├── middlewares/ # Middleware trung gian
│ │ ├── authMiddleware.js
│ │ ├── roleMiddleware.js
│ │ └── uploadMiddleware.js
│ │
│ ├── models/ # Giao tiếp trực tiếp với DB
│ │ ├── addressModel.js
│ │ ├── cartModel.js
│ │ ├── couponModel.js
│ │ ├── dashboardModel.js
│ │ ├── orderModel.js
│ │ ├── productModel.js
│ │ └── userModel.js
│ │
│ ├── routes/ # Định nghĩa API endpoints
│ │ ├── authRoutes.js
│ │ ├── cartRoutes.js
│ │ ├── couponRoutes.js
│ │ ├── dashboardRoutes.js
│ │ ├── orderRoutes.js
│ │ ├── productRoutes.js
│ │ └── userRoutes.js
│
├── uploads/ # Lưu ảnh
├── .env # Biến môi trường
├── package.json # Thư viện
└── server.js # Entry point
