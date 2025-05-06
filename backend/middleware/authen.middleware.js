import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET="raet";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Không có token, truy cập bị từ chối" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};
