export const checkRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Không có quyền truy cập, vui lòng đăng nhập"
        });
      }
  
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện chức năng này"
        });
      }
  
      next();
    };
  };