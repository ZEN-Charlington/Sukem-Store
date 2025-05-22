// controllers/authen.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const EMAIL_USERNAME = process.env.EMAIL_USERNAME || "minhlam1610.work@gmail.com";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "jhnn nfcl yygn npxw";
const EMAIL_FROM = process.env.EMAIL_FROM || "minhlam1610.work@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET || "raeT";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "4h";
const RESET_TOKEN_EXPIRE = process.env.RESET_TOKEN_EXPIRE || 15;

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD
  }
});

export const registerUser = async (req, res) => {
  const { name, email, password, role = "worker" } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu."
    });
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userRole = role === "manager" && req.user?.role !== "manager" ? "worker" : role;
    
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword,
      role: userRole 
    });
    
    await newUser.save();
    
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    if (err.code === 11000 && err.keyPattern.email) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại." });
    }
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu." });
  }
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email không tồn tại." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Sai mật khẩu." });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: "Đăng nhập thành công"
    });
  } catch (error) {
    console.error("Login error", error.message);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const verifyToken = async (req, res) => {
  try {
    // Middleware protect đã xác thực token và gán req.user
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng"
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Email không tồn tại trong hệ thống." 
      });
    }
    
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const resetToken = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRE * 60 * 1000; // RESET_TOKEN_EXPIRE phút
    await user.save();
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: user.email,
      subject: "Sukem Store - Đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #3182ce;">Sukem Store</h2>
            </div>
            <h1 style="color: #333;">Xin chào ${user.name}</h1>
            <h2 style="color: #555;">Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.</h2>
            <p style="font-size: 18px; color: #000;">Mã xác minh của bạn là:</p>
            <p style="font-size: 32px; font-weight: bold; color: #2c3e50; text-align: center;">${resetCode}</p>
            <p style="font-size: 14px; color: #777; margin-top: 30px;">Mã xác minh có hiệu lực trong ${RESET_TOKEN_EXPIRE} phút.</p>
            <p style="font-size: 14px; color: #777;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          </div>
        </div>
      `
    };
    
    // Gửi email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({
      success: true,
      message: "Email đặt lại mật khẩu đã được gửi."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi gửi email đặt lại mật khẩu."
    });
  }
};

/**
 * Xác minh mã reset
 * Kiểm tra mã xác minh và tạo token để đặt lại mật khẩu
 */
export const verifyResetCode = async (req, res) => {
  const { email, resetCode } = req.body;
  
  try {
    // Hash mã để so sánh với database
    const resetToken = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    
    const user = await User.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Mã xác minh không hợp lệ hoặc đã hết hạn."
      });
    }
    
    // Tạo token để dùng cho bước đặt lại mật khẩu
    const verifiedToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    
    return res.status(200).json({
      success: true,
      message: "Mã xác minh hợp lệ.",
      resetToken: verifiedToken
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server."
    });
  }
};

/**
 * Đặt lại mật khẩu
 * Sử dụng token từ bước xác minh để đặt mật khẩu mới
 */
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  
  try {
    // Xác minh token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    
    // Tìm user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại."
      });
    }
    
    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Cập nhật mật khẩu và xóa token reset
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ."
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Lỗi server."
    });
  }
};

/**
 * Lấy danh sách tất cả người dùng (chỉ cho manager)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt");
    
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * Cập nhật vai trò của người dùng (chỉ cho manager)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!["manager", "worker"].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Vai trò không hợp lệ. Phải là 'manager' hoặc 'worker'." 
      });
    }
    
    // Không thể thay đổi vai trò của chính mình để tránh bị khóa
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể thay đổi vai trò của chính mình"
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    
    user.role = role;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: `Đã cập nhật vai trò người dùng thành ${role}`
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật vai trò:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * Thăng cấp người dùng thành manager (chỉ dành cho manager hiện tại)
 */
export const promoteToManager = async (req, res) => {
  try {
    // Chỉ manager hiện tại mới có thể thăng cấp người khác
    if (req.user.role !== "manager") {
      return res.status(403).json({ 
        success: false, 
        message: "Bạn không có quyền thực hiện chức năng này" 
      });
    }
    
    const { userId } = req.params;
    
    // Không thể thăng cấp chính mình
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể thăng cấp chính mình"
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    
    user.role = "manager";
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "Đã thăng cấp người dùng thành Manager"
    });
  } catch (error) {
    console.error("Promote error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};