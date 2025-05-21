// models/product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên sản phẩm là bắt buộc"],
    unique: true,
    trim: true,
    minlength: [1, "Tên phải có ít nhất 1 ký tự"],
    maxlength: [40, "Tên không vượt quá 40 ký tự"]
  },
  price: {
    type: Number,
    required: [true, "Giá sản phẩm là bắt buộc"],
    min: [1, "Giá phải ≥ 1"],
    max: [1000000000, "Giá phải ≤ 1000000000"]
  },
  initialPrice: {
    type: Number,
    required: [true, "Giá ban đầu là bắt buộc"],
    min: [1, "Giá ban đầu phải ≥ 1"],
    max: [1000000000, "Giá ban đầu phải ≤ 1000000000"]
  },
  storage: {
    type: Number,
    required: [true, "Số lượng tồn kho là bắt buộc"],
    default: 0,
    min: [0, "Số lượng tồn kho phải ≥ 0"]
  },
  image: {
    type: String,
    required: [true, "Link ảnh là bắt buộc"]
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);