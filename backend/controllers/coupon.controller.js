// controllers/coupon.controller.js
import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";

// Tạo coupon tự động sau khi tạo hóa đơn (được gọi từ hoadon controller)
export const createCouponFromInvoice = async (invoiceId, totalAmount, session = null) => {
  try {
    const discountPercent = Coupon.calculateDiscountPercent(totalAmount);
    
    if (discountPercent === 0) {
      return null; // Không đủ điều kiện tạo coupon
    }

    // Generate unique code
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      code = Coupon.generateCode();
      const existing = await Coupon.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      throw new Error("Không thể tạo mã coupon duy nhất");
    }

    // Tạo ngày hết hạn (30 ngày từ hôm nay)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const couponData = {
      code,
      discountPercent,
      minOrderValue: 0, // Coupon có thể dùng cho bất kỳ đơn hàng nào
      expiryDate,
      createdFromInvoice: invoiceId
    };

    let newCoupon;
    if (session) {
      newCoupon = await Coupon.create([couponData], { session });
      newCoupon = newCoupon[0];
    } else {
      newCoupon = await Coupon.create(couponData);
    }

    return newCoupon;
  } catch (error) {
    console.error("Lỗi khi tạo coupon từ hóa đơn:", error.message);
    throw error;
  }
};

// Lấy danh sách coupon
export const getCoupons = async (req, res) => {
  try {
    const { isUsed, isExpired } = req.query;
    let filter = {};
    
    if (isUsed !== undefined) {
      filter.isUsed = isUsed === 'true';
    }
    
    if (isExpired !== undefined) {
      const now = new Date();
      if (isExpired === 'true') {
        filter.expiryDate = { $lt: now };
      } else {
        filter.expiryDate = { $gte: now };
      }
    }

    const coupons = await Coupon.find(filter)
      .populate("createdFromInvoice", "invoiceNumber totalAmount date")
      .populate("usedInInvoice", "invoiceNumber totalAmount date")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách coupon:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Kiểm tra và áp dụng coupon
export const applyCoupon = async (req, res) => {
  const { code, totalAmount } = req.body;

  if (!code || totalAmount == null) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập mã coupon và tổng tiền hóa đơn"
    });
  }

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Mã coupon không tồn tại"
      });
    }

    if (!coupon.isValid()) {
      const reason = coupon.isUsed ? "đã được sử dụng" : "đã hết hạn";
      return res.status(400).json({
        success: false,
        message: `Mã coupon ${reason}`
      });
    }

    if (totalAmount < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng phải có giá trị tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ`
      });
    }

    const discountAmount = Math.round(totalAmount * (coupon.discountPercent / 100));
    const finalAmount = totalAmount - discountAmount;

    res.status(200).json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          discountAmount,
          expiryDate: coupon.expiryDate
        },
        originalAmount: totalAmount,
        discountAmount,
        finalAmount
      }
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng coupon:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const useCoupon = async (code, invoiceId, userId, session = null) => {
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
      .session(session);

    if (!coupon || !coupon.isValid()) {
      throw new Error("Mã coupon không hợp lệ");
    }

    // Cập nhật coupon
    coupon.isUsed = true;
    coupon.usedInInvoice = invoiceId;
    coupon.usedDate = new Date();
    
    await coupon.save({ session });
    return coupon;
  } catch (error) {
    console.error("Lỗi khi sử dụng coupon:", error.message);
    throw error;
  }
};

// Lấy thông tin coupon theo code
export const getCouponByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
      .populate("createdFromInvoice", "invoiceNumber totalAmount date")
      .populate("usedInInvoice", "invoiceNumber totalAmount date");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Mã coupon không tồn tại"
      });
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin coupon:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Xóa coupon (chỉ manager)
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      message: "Coupon ID không hợp lệ"
    });
  }

  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy coupon"
      });
    }

    if (coupon.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa coupon đã được sử dụng"
      });
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Đã xóa coupon thành công"
    });
  } catch (error) {
    console.error("Lỗi khi xóa coupon:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};