// controllers/hoadon.controller.js
import HoaDon from "../models/hoadon.model.js";
import Product from "../models/product.model.js";
import AuditLog from "../models/audit.model.js";
import mongoose from "mongoose";

// Hàm tiện ích để tạo số hóa đơn theo định dạng DDMM-XX (ví dụ: 2904-02)
const generateInvoiceNumber = async () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;

  // Đặt thời gian bắt đầu và kết thúc ngày để đếm số hóa đơn
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Đếm số hóa đơn trong ngày
  const count = await HoaDon.countDocuments({ date: { $gte: startOfDay, $lt: endOfDay } });

  // Format ngày, tháng và thứ tự (luôn 2 chữ số)
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const countStr = String(count + 1).padStart(2, '0');

  // Kết quả: "DDMM-XX"
  return `${dayStr}${monthStr}-${countStr}`;
};

// Tạo hóa đơn mới và cập nhật số lượng tồn kho
export const createInvoice = async (req, res) => {
  const { products, userId, paymentMethod, paymentStatus, note, totalAmount } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0 || !userId || !paymentMethod || totalAmount == null) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin hóa đơn hoặc totalAmount" });
  }

  // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Tạo số hóa đơn với định dạng mới
    const invoiceNumber = await generateInvoiceNumber();

    // Tạo hóa đơn trên cơ sở dữ liệu
    const newInvoice = new HoaDon({
      invoiceNumber,
      userId,
      products,
      totalAmount,
      paymentMethod,
      paymentStatus,
      note,
      date: new Date()
    });
    
    await newInvoice.save({ session });

    // Cập nhật số lượng tồn kho dựa trên các sản phẩm được mua
    for (const item of products) {
      // Lấy sản phẩm từ database và kiểm tra tồn kho
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        // Nếu sản phẩm không tồn tại, rollback và báo lỗi
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: `Sản phẩm ${item.productName} không tồn tại trong kho` });
      }
      
      // Kiểm tra nếu không có trường storage (tương thích ngược với dữ liệu cũ)
      if (product.storage === undefined) {
        product.storage = 0;
      }
      
      // Kiểm tra nếu số lượng mua lớn hơn tồn kho
      if (item.quantity > product.storage) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.productName}" không đủ tồn kho (Hiện chỉ còn: ${product.storage} sản phẩm)`
        });
      }
      
      // Lưu snapshot trước khi cập nhật
      const oldData = {
        name: product.name,
        price: product.price,
        initialPrice: product.initialPrice,
        storage: product.storage,
        image: product.image
      };
      
      // Cập nhật số lượng tồn kho
      const newStorage = product.storage - item.quantity;
      product.storage = newStorage;
      await product.save({ session });
      
      // Ghi log cho việc cập nhật tồn kho
      await AuditLog.create([{
        user: userId,
        action: "UPDATE_STORAGE",
        productId: product._id,
        oldData: oldData,
        newData: {
          name: product.name,
          price: product.price,
          initialPrice: product.initialPrice,
          storage: newStorage,
          image: product.image
        }
      }], { session });
    }

    // Commit transaction nếu tất cả thao tác thành công
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({ success: true, data: newInvoice });

  } catch (error) {
    // Rollback nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    
    console.error("Lỗi khi tạo hóa đơn:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
  }
};

// Lấy danh sách hóa đơn
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

// Lấy chi tiết một hóa đơn
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
    console.error("Lỗi khi lấy hóa đơn:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Xóa tất cả hóa đơn
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