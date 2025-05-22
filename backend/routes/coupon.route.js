// routes/coupon.route.js
import express from "express";
import {
  getCoupons,
  applyCoupon,
  getCouponByCode,
  deleteCoupon
} from "../controllers/coupon.controller.js";
import { protect } from "../middleware/authen.middleware.js";
import { checkRole } from "../middleware/checkRole.middleware.js";

const router = express.Router();

// Lấy danh sách coupon
router.get("/", getCoupons);

// Kiểm tra và áp dụng coupon 
router.post("/apply", protect, applyCoupon);

// Lấy thông tin coupon theo code
router.get("/:code", getCouponByCode);

// Xóa coupon (chỉ manager)
router.delete("/:id", protect, checkRole(["manager"]), deleteCoupon);

export default router;