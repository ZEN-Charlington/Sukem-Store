// models/coupon.model.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Mã coupon là bắt buộc"],
    unique: true,
    trim: true,
    length: [8, "Mã coupon phải có đúng 8 ký tự"],
    uppercase: true
  },
  discountPercent: {
    type: Number,
    required: [true, "Phần trăm giảm giá là bắt buộc"],
    min: [1, "Giảm giá tối thiểu 1%"],
    max: [30, "Giảm giá tối đa 30%"]
  },
  minOrderValue: {
    type: Number,
    required: [true, "Giá trị đơn hàng tối thiểu là bắt buộc"],
    min: [0, "Giá trị đơn hàng tối thiểu phải >= 0"]
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date,
    required: [true, "Ngày hết hạn là bắt buộc"]
  },
  createdFromInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HoaDon",
    required: [true, "Hóa đơn tạo coupon là bắt buộc"]
  },
  usedInInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HoaDon",
    default: null
  },
  usedDate: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

couponSchema.index({ isUsed: 1, expiryDate: 1 });

// Method để check coupon còn hợp lệ không
couponSchema.methods.isValid = function() {
  const now = new Date();
  return !this.isUsed && now <= this.expiryDate;
};

// Static method để generate random code
couponSchema.statics.generateCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Static method để tính phần trăm giảm giá dựa trên tổng hóa đơn
couponSchema.statics.calculateDiscountPercent = function(totalAmount) {
  if (totalAmount >= 3000000) return 30; // >= 3 triệu: 30%
  if (totalAmount >= 2000000) return 25; // >= 2 triệu: 25%
  if (totalAmount >= 1500000) return 20; // >= 1.5 triệu: 20%
  if (totalAmount >= 1000000) return 15; // >= 1 triệu: 15%
  if (totalAmount >= 500000) return 10;  // >= 500k: 10%
  return 0; // Dưới 500k không tạo coupon
};

export default mongoose.model("Coupon", couponSchema);