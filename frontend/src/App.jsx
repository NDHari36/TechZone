import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";

import ProtectedRoute from "./ProtectedRoute";
import { CompareProvider } from "./Components/CompareContext";
import CompareBar from "./Components/CompareBar";
import ScrollToTop from "./Components/ScrollToTop";

import Home from "./Pages/Home";
import Landing from "./Pages/Landing";
import Header from "./Components/Header";
import SignIn from "./Pages/Signin";
import SignUp from "./Pages/Signup";
import ShoppingCart from "./Pages/ShoppingCart";
import Catogory from "./Pages/Category";
import Profile from "./Pages/Profile";
import Details from "./Pages/Details";
import Payment from "./Pages/Payment";
import Orders from "./Pages/Orders";
import OrderDetail from "./Pages/OrderDetail";
import Admin from "./Components/admin/Admin";
import Compare from "./Pages/Compare";

const socket = io("http://localhost:8081");

function App() {
  useEffect(() => {
    socket.on("force_logout", (data) => {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      try {
        const currentUser = JSON.parse(userStr);

        if (Number(currentUser.id) === Number(data.userId)) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");

          window.dispatchEvent(new Event("storage"));

          alert(
            "Tài khoản của bạn vừa bị Quản trị viên khóa. Bạn đã bị đăng xuất!",
          );
          window.location.href = "/signin";
        }
      } catch (err) {
        console.error("Lỗi khi ép đăng xuất:", err);
      }
    });

    return () => {
      socket.off("force_logout");
    };
  }, []);

  return (
    <CompareProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Header />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/store" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/Category" element={<Catogory />} />
          <Route path="/Shopping-Cart" element={<ShoppingCart />} />
          <Route path="/Details/:id" element={<Details />} />
          <Route path="/product/detail/:id" element={<Details />} />
          <Route path="/compare" element={<Compare />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pay"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowAdminOnly={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>

        <CompareBar />
      </BrowserRouter>
    </CompareProvider>
  );
}

export default App;
