// controllers/audit.controller.js
import AuditLog from "../models/audit.model.js";

export const getAuditLogs = async (req, res) => {
  try {
    // Lấy logs, sort theo thời gian, populate user và thông tin product hiện tại
    const logs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .populate("user", "name email")
      .populate("productId", "name price initialPrice storage image")
      .exec();

    // Định dạng lại để frontend dễ xử lý
    const formattedLogs = logs.map(log => {
      const oldData = log.oldData || {};
      const newData = log.newData || {};
      const current = log.productId || {};

      // Xác định loại hành động để định dạng mô tả phù hợp
      let actionDescription = "";
      if (log.action === "CREATE") {
        actionDescription = "Tạo sản phẩm mới";
      } else if (log.action === "UPDATE") {
        actionDescription = "Cập nhật thông tin sản phẩm";
      } else if (log.action === "DELETE") {
        actionDescription = "Xóa sản phẩm";
      } else if (log.action === "UPDATE_STORAGE") {
        // Tính toán số lượng thay đổi
        const oldStorage = oldData.storage || 0;
        const newStorage = newData.storage || 0;
        const difference = newStorage - oldStorage;
        
        if (difference > 0) {
          actionDescription = `Nhập thêm ${difference} sản phẩm vào kho`;
        } else if (difference < 0) {
          actionDescription = `Giảm ${Math.abs(difference)} sản phẩm trong kho`;
        } else {
          actionDescription = "Cập nhật số lượng tồn kho (không thay đổi)";
        }
      }

      return {
        user: log.user?.name || "Người dùng không tồn tại hoặc đã bị xóa",
        action: log.action,
        actionDescription: actionDescription,
        // Tên sản phẩm hiện tại (từ populate) hoặc fallback về newData.name
        product: current.name || newData.name || "Sản phẩm không tồn tại hoặc đã bị xóa",
        timestamp: log.timestamp,
        // Trả về đầy đủ snapshot trước và sau để frontend tùy ý render detail
        changes: {
          old: {
            name: oldData.name,
            price: oldData.price,
            initialPrice: oldData.initialPrice,
            storage: oldData.storage,
            image: oldData.image,
          },
          new: {
            name: newData.name,
            price: newData.price,
            initialPrice: newData.initialPrice,
            storage: newData.storage,
            image: newData.image,
          }
        }
      };
    });

    res.status(200).json({ success: true, data: formattedLogs });
  } catch (error) {
    console.error("Lỗi khi lấy audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy audit logs",
      error: error.message,
    });
  }
};

// Xóa toàn bộ audit logs trong collection
export const deleteAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.status(200).json({ success: true, message: "Đã xóa tất cả audit logs." });
  } catch (error) {
    console.error("Lỗi khi xóa audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa audit logs",
      error: error.message,
    });
  }
};