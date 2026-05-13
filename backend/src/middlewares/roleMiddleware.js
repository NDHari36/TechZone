const roleMiddleware = (...allowedRoleIds) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Chưa đăng nhập!",
      });
    }

    if (!allowedRoleIds.includes(req.user.role_id)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập!",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
