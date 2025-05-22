import mongoose from "mongoose";

// Store Name có thể là một giá trị cố định hoặc lấy từ cấu hình
const storeName = "Sukem Store";  // Bạn có thể thay đổi theo môi trường hoặc cấu hình.

const hoaDonSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,  
    unique: true,    // Đảm bảo số hóa đơn là duy nhất
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,  // Lưu người thanh toán (nhân viên)
  },
  storeName: {
    type: String,
    default: storeName,  // Cửa hàng cố định
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      image: {
        type: String,  // Đảm bảo lưu đường dẫn hình ảnh của sản phẩm
        required: true,
      },
      total: {
        type: Number,
        required: true, 
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  appliedCouponCode: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ["Chưa thanh toán", "Đã thanh toán", "Đang xử lý"],
    default: "Chưa thanh toán",
  },
  paymentMethod: {
    type: String,
    enum: ["Tiền mặt", "Chuyển khoản", "Thẻ tín dụng"],
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
});

const HoaDon = mongoose.model("HoaDon", hoaDonSchema);

export default HoaDon;