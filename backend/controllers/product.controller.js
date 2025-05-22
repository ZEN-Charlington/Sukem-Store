// controllers/product.controller.js
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import AuditLog from "../models/audit.model.js";

// Lấy danh sách sản phẩm
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Tạo sản phẩm mới và lưu audit log
export const createProducts = async (req, res) => {
  const { name, price, initialPrice, storage, image } = req.body;

  if (!name || price == null || initialPrice == null || storage == null || !image) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đủ các trường thông tin" });
  }

  try {
    // Tạo sản phẩm
    const newProduct = await Product.create({ name, price, initialPrice, storage, image });

    // Ghi audit
    await AuditLog.create({
      user: req.user?._id || null,
      action: "CREATE",
      productId: newProduct._id,
      oldData: {},
      newData: {
        name: newProduct.name,
        price: newProduct.price,
        initialPrice: newProduct.initialPrice,
        storage: newProduct.storage,
        image: newProduct.image,
      }
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    console.error("Lỗi trong quá trình tạo sản phẩm:", error.message);
    res.status(500).json({ success: false, message: "Server đang có lỗi!" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Id sản phẩm không hợp lệ" });
  }

  try {
    const before = await Product.findById(id).lean();
    if (!before) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });

    await AuditLog.create({
      user: req.user?._id || null,
      action: "UPDATE",
      productId: id,
      oldData: {
        name: before.name,
        price: before.price,
        initialPrice: before.initialPrice,
        storage: before.storage,
        image: before.image,
      },
      newData: {
        name: updated.name,
        price: updated.price,
        initialPrice: updated.initialPrice,
        storage: updated.storage,
        image: updated.image,
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    console.error("Lỗi khi cập nhật sản phẩm:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Xóa sản phẩm và lưu audit log
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Id sản phẩm không hợp lệ" });
  }

  try {
    // Lấy dữ liệu trước khi xóa
    const before = await Product.findById(id).lean();
    if (!before) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Xóa sản phẩm
    await Product.findByIdAndDelete(id);

    // Ghi audit log
    await AuditLog.create({
      user: req.user?._id || null,
      action: "DELETE",
      productId: id,
      oldData: {
        name: before.name,
        price: before.price,
        initialPrice: before.initialPrice,
        storage: before.storage,
        image: before.image,
      },
      newData: {}
    });

    res.status(200).json({ success: true, message: "Đã xóa sản phẩm" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Cập nhật số lượng tồn kho
export const updateStorage = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Id sản phẩm không hợp lệ" });
  }
  
  if (quantity == null || quantity < 0) {
    return res.status(400).json({ success: false, message: "Số lượng nhập vào không hợp lệ" });
  }

  try {
    // Lấy snapshot trước khi update
    const before = await Product.findById(id).lean();
    if (!before) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Tính toán số lượng mới
    const newStorage = before.storage + parseInt(quantity);
    
    // Thực hiện update và lấy bản mới
    const updated = await Product.findByIdAndUpdate(
      id, 
      { storage: newStorage }, 
      { new: true }
    );

    // Ghi audit log
    await AuditLog.create({
      user: req.user?._id || null,
      action: "UPDATE_STORAGE",
      productId: id,
      oldData: {
        storage: before.storage
      },
      newData: {
        storage: updated.storage
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng tồn kho:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};