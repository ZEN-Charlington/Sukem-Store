// routes/product.routes.js
import express from "express";
import { 
  getProducts, 
  createProducts, 
  updateProduct, 
  deleteProduct,
  updateStorage
} from "../controllers/product.controller.js";
import { protect } from "../middleware/authen.middleware.js";
import { checkRole } from "../middleware/checkRole.middleware.js";

const router = express.Router();

// Tất cả người dùng đều có thể xem sản phẩm
router.get("/", getProducts);

// Chỉ manager mới có thể thêm, cập nhật, xóa sản phẩm
router.post("/", protect, checkRole(["manager"]), createProducts);
router.put("/:id", protect, checkRole(["manager"]), updateProduct);
router.delete("/:id", protect, checkRole(["manager"]), deleteProduct);
router.put("/:id/storage", protect, checkRole(["manager"]), updateStorage);

export default router;