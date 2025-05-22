// models/promotion.model.js
import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID là bắt buộc"],
  },
  discountPercent: {
    type: Number,
    required: [true, "Phần trăm giảm giá là bắt buộc"],
    min: [1, "Giảm giá tối thiểu 1%"],
    max: [100, "Giảm giá tối đa 100%"]
  },
  startDate: {
    type: Date,
    required: [true, "Ngày bắt đầu là bắt buộc"],
  },
  endDate: {
    type: Date,
    required: [true, "Ngày kết thúc là bắt buộc"],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: "Ngày kết thúc phải sau ngày bắt đầu"
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    required: [true, "Tiêu đề khuyến mãi là bắt buộc"],
    trim: true,
    maxlength: [100, "Tiêu đề không vượt quá 100 ký tự"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Mô tả không vượt quá 500 ký tự"]
  }
}, { 
  timestamps: true 
});
promotionSchema.index({ productId: 1, startDate: 1, endDate: 1 });
promotionSchema.methods.isValidNow = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

export default mongoose.model("Promotion", promotionSchema);