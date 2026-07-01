import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import ResetPass from "./Pages/ForgotPass";

function AppContent() {
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(VITE_SOCKET_URL);

    socket.on("force_logout", (data) => {
      console.log("force_logout:", data);

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const currentUser = JSON.parse(storedUser);

      if (Number(currentUser.id) === Number(data.userId)) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        alert("Tài khoản của bạn vừa bị khóa");
        navigate("/signin");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [VITE_SOCKET_URL, navigate]);

  return (
    <>
      <ScrollToTop />
      <Header />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/store" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Category" element={<Catogory />} />
        <Route path="/product/detail/:id" element={<Details />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/reset-password" element={<ResetPass />} />

        <Route
          path="/Shopping-Cart"
          element={
            <ProtectedRoute>
              <ShoppingCart />
            </ProtectedRoute>
          }
        />
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
    </>
  );
}

function App() {
  return (
    <CompareProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CompareProvider>
  );
}

export default App;
