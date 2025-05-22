// controllers/hoadon.controller.js
import HoaDon from "../models/hoadon.model.js";
import Product from "../models/product.model.js";
import { createCouponFromInvoice, useCoupon } from "./coupon.controller.js";
import mongoose from "mongoose";

const generateInvoiceNumber = async () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const count = await HoaDon.countDocuments({ date: { $gte: startOfDay, $lt: endOfDay } });
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const countStr = String(count + 1).padStart(2, '0');

  return `${dayStr}${monthStr}-${countStr}`;
};

export const createInvoice = async (req, res) => {
  const { products, userId, paymentMethod, paymentStatus, note, totalAmount, originalAmount, appliedCouponCode } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0 || !userId || !paymentMethod || totalAmount == null) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin hóa đơn hoặc totalAmount" });
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceNumber = await generateInvoiceNumber();
    const newInvoice = new HoaDon({
      invoiceNumber,
      userId,
      products,
      totalAmount,
      paymentMethod,
      paymentStatus,
      note,
      appliedCouponCode: appliedCouponCode || null,
      date: new Date()
    });
    
    await newInvoice.save({ session });

    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: `Sản phẩm ${item.productName} không tồn tại trong kho` });
      }
      if (product.storage === undefined) {
        product.storage = 0;
      }
      
      if (item.quantity > product.storage) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.productName}" không đủ tồn kho (Hiện chỉ còn: ${product.storage} sản phẩm)`
        });
      }
      
      const newStorage = product.storage - item.quantity;
      product.storage = newStorage;
      await product.save({ session });
    }

    if (appliedCouponCode) {
      try {
        await useCoupon(appliedCouponCode, newInvoice._id, userId, session);
      } catch (couponError) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: `Lỗi coupon: ${couponError.message}` 
        });
      }
    }

    await session.commitTransaction();
    session.endSession();

    let generatedCoupon = null;
    if (!appliedCouponCode) {
      try {
        const amountForCoupon = originalAmount || totalAmount;
        generatedCoupon = await createCouponFromInvoice(newInvoice._id, amountForCoupon);
      } catch (couponError) {
        console.error("Lỗi khi tạo coupon:", couponError.message);
        console.error("Stack:", couponError.stack);
      }
    } 
    
    const responseData = {
      success: true, 
      data: newInvoice,
      message: "Hóa đơn đã được tạo thành công"
    };

    if (generatedCoupon) {
      responseData.coupon = {
        code: generatedCoupon.code,
        discountPercent: generatedCoupon.discountPercent,
        expiryDate: generatedCoupon.expiryDate
      };
      responseData.message = `Hóa đơn đã được tạo thành công! Tặng mã giảm giá ${generatedCoupon.code} (${generatedCoupon.discountPercent}%)`;
    }

    res.status(201).json(responseData);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Lỗi khi tạo hóa đơn:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await HoaDon.find()
      .populate("userId", "name email")
      .exec();
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getInvoiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await HoaDon.findById(id)
      .populate("userId", "name email")
      .exec();

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Hóa đơn không tồn tại" });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Lỗi khi lấy hóa đón:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const deleteInvoices = async (req, res) => {
  try {
    const result = await HoaDon.deleteMany({});
    console.log(`Đã xóa ${result.deletedCount} hóa đơn`);
    res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} hóa đơn.`
    });
  } catch (error) {
    console.error("Lỗi khi xóa tất cả hóa đơn:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server khi xóa hóa đơn." });
  }
};