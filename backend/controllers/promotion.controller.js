// controllers/promotion.controller.js
import mongoose from "mongoose";
import Promotion from "../models/promotion.model.js";
import Product from "../models/product.model.js";

// Lấy danh sách promotion
export const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({})
      .populate("productId", "name price image")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách promotion:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Tạo promotion mới
export const createPromotion = async (req, res) => {
  const { productId, discountPercent, startDate, endDate, title, description } = req.body;

  if (!productId || !discountPercent || !startDate || !endDate || !title) {
    return res.status(400).json({ 
      success: false, 
      message: "Vui lòng nhập đủ thông tin bắt buộc" 
    });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ 
      success: false, 
      message: "Product ID không hợp lệ" 
    });
  }

  try {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Sản phẩm không tồn tại" 
      });
    }

    // Kiểm tra promotion trùng lặp trong khoảng thời gian
    const overlappingPromotion = await Promotion.findOne({
      productId,
      isActive: true,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (overlappingPromotion) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm đã có promotion trong khoảng thời gian này"
      });
    }

    const newPromotion = await Promotion.create({
      productId,
      discountPercent,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      title,
      description: description || ""
    });

    await newPromotion.populate("productId", "name price image");


    res.status(201).json({ success: true, data: newPromotion });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    console.error("Lỗi khi tạo promotion:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Cập nhật promotion
export const updatePromotion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ 
      success: false, 
      message: "Promotion ID không hợp lệ" 
    });
  }

  try {
    const before = await Promotion.findById(id).lean();
    if (!before) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy promotion" 
      });
    }

    // Nếu có thay đổi productId hoặc thời gian, kiểm tra trùng lặp
    if (req.body.productId || req.body.startDate || req.body.endDate) {
      const productId = req.body.productId || before.productId;
      const startDate = req.body.startDate || before.startDate;
      const endDate = req.body.endDate || before.endDate;

      const overlappingPromotion = await Promotion.findOne({
        _id: { $ne: id },
        productId,
        isActive: true,
        $or: [
          { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
        ]
      });

      if (overlappingPromotion) {
        return res.status(400).json({
          success: false,
          message: "Sản phẩm đã có promotion trong khoảng thời gian này"
        });
      }
    }

    const updated = await Promotion.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    ).populate("productId", "name price image");


    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    console.error("Lỗi khi cập nhật promotion:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Xóa promotion
export const deletePromotion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ 
      success: false, 
      message: "Promotion ID không hợp lệ" 
    });
  }

  try {
    const before = await Promotion.findById(id).lean();
    if (!before) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy promotion" 
      });
    }

    await Promotion.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Đã xóa promotion thành công" 
    });
  } catch (error) {
    console.error("Lỗi khi xóa promotion:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Lấy promotion theo product ID (để hiển thị giá sale)
export const getPromotionByProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ 
      success: false, 
      message: "Product ID không hợp lệ" 
    });
  }

  try {
    const now = new Date();
    const promotion = await Promotion.findOne({
      productId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("productId", "name price image");

    res.status(200).json({ 
      success: true, 
      data: promotion 
    });
  } catch (error) {
    console.error("Lỗi khi lấy promotion theo product:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};