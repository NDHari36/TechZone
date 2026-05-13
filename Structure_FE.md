frontend/
│
├── node_modules/ # Thư viện tải về
├── public/ # Các tệp tĩnh
│ └── images/ # Hình ảnh
└── src/ # Source code chính
│
├── api/ # Nơi chứa các hàm gọi API (Axios/Fetch)
│ ├── api.js
│ ├── authApi.js
│ ├── cartApi.js
│ ├── couponApi.js
│ ├── dashboardApi.js
│ ├── orderApi.js
│ ├── productApi.js
│ └── userApi.js
│
├── Components/ # Các UI component dùng chung
│ ├── admin/ # Component dành riêng cho trang admin
│ ├── Banner.jsx
│ ├── CategoryGrid.jsx
│ ├── CompareBar.jsx
│ ├── CompareContext.jsx
│ ├── Header.jsx
│ ├── HomePage.jsx
│ ├── inforpage.jsx
│ ├── ProductCard.jsx
│ ├── ProductcsList.jsx
│ ├── ScrollToTop.jsx
│ ├── SearchFilter.jsx
││
├── Pages/ # Các component đóng vai trò là Trang (Pages)
│ ├── Category.jsx
│ ├── Compare.jsx
│ ├── Details.jsx
│ ├── Home.jsx
│ ├── Landing.jsx
│ ├── OrderDetail.jsx
│ ├── Orders.jsx
│ ├── Payment.jsx
│ ├── Profile.jsx
│ ├── ShoppingCart.jsx
│ ├── Signin.jsx
│ ├── Signup.jsx
│ └── User.jsx
│
├── App.jsx # Component gốc/Layout chính chứa các Route
├── index.css # Style CSS toàn cục
├── main.jsx # Entry point của React (nơi render App vào DOM)
└── ProtectedRoute.jsx # Component bọc các route cần xác thực đăng nhập
