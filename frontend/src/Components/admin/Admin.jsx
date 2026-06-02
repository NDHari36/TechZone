import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import ProductManager from "./ProductManager";
import UserManager from "./UserManager";
import OrderManager from "./OrderManager";
import {
  Users,
  Package,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  PieChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [activeTab, setActiveTab] = useState(
    sessionStorage.getItem("adminActiveTab") || "dashboard",
  );
  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: <PieChart size={20} /> },
    { id: "products", label: "Quản lý Sản phẩm", icon: <Package size={20} /> },
    { id: "users", label: "Quản lý Người dùng", icon: <Users size={20} /> },
    {
      id: "orders",
      label: "Quản lý Đơn hàng",
      icon: <ShoppingCart size={20} />,
    },
  ];
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-md">
            <LayoutDashboard size={24} />
          </div>
          <span className="font-black text-2xl text-gray-900 uppercase tracking-tight">
            TechZone
          </span>
        </div>

        <nav className="p-5 space-y-3 flex-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">
            Menu Quản Trị
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-gray-900 text-white shadow-lg translate-x-1"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-gray-100">
          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              sessionStorage.removeItem("adminActiveTab");
              setActiveTab("dashboard");
              navigate("/signin");
            }}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-bold text-red-600 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="absolute inset-0 pb-10">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "products" && <ProductManager />}
          {activeTab === "users" && <UserManager />}
          {activeTab === "orders" && <OrderManager />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
