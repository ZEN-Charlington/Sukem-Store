// routes/promotion.route.js
import express from "express";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionByProduct
} from "../controllers/promotion.controller.js";
import { protect } from "../middleware/authen.middleware.js";
import { checkRole } from "../middleware/checkRole.middleware.js";

const router = express.Router();

// Lấy danh sách promotion
router.get("/", getPromotions);

// Lấy promotion theo product ID
router.get("/product/:productId", getPromotionByProduct);

// Tạo promotion mới (chỉ manager)
router.post("/", protect, checkRole(["manager"]), createPromotion);

// Cập nhật promotion (chỉ manager)
router.put("/:id", protect, checkRole(["manager"]), updatePromotion);

// Xóa promotion (chỉ manager)
router.delete("/:id", protect, checkRole(["manager"]), deletePromotion);

export default router;