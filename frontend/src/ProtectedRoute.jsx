// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowAdminOnly }) => {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (allowAdminOnly && Number(user.role_id) !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
