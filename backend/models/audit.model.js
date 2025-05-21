// models/audit.model.js
import mongoose from "mongoose";

// Sub-schema cho dữ liệu trước và sau thay đổi
const DataSnapshotSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  initialPrice: { type: Number }, // Thêm trường giá nhập
  storage: { type: Number },      // Thêm trường tồn kho
  image: { type: String },
}, { _id: false });

const auditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'UPDATE_STORAGE'], // Thêm UPDATE_STORAGE
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Dữ liệu trước thao tác: với DELETE/UPDATE/UPDATE_STORAGE
  oldData: {
    type: DataSnapshotSchema,
    default: {},
  },
  // Dữ liệu sau thao tác: với CREATE/UPDATE/UPDATE_STORAGE
  newData: {
    type: DataSnapshotSchema,
    default: {},
  },
});

const AuditLog = mongoose.model("AuditLog", auditSchema);
export default AuditLog;