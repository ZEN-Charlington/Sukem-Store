// routes/authen.route.js
import express from "express";
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  verifyResetCode, 
  resetPassword,
  getAllUsers,
  updateUserRole,
  promoteToManager
} from "../controllers/authen.controller.js";
import { protect } from "../middleware/authen.middleware.js";
import { checkRole } from "../middleware/checkRole.middleware.js"; 
import User from "../models/user.model.js";

const router = express.Router();

// Các routes không yêu cầu xác thực
router.post("/register", registerUser); 
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

// Verify token
router.get("/verify-token", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Lấy thông tin người dùng từ token
    if (!user) {
      return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
    }
    res.status(200).json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Các routes quản lý người dùng (chỉ dành cho manager)
router.get("/users", protect, checkRole(["manager"]), getAllUsers);
router.put("/users/:userId/role", protect, checkRole(["manager"]), updateUserRole);
router.put("/promote/:userId", protect, checkRole(["manager"]), promoteToManager);

export default router;