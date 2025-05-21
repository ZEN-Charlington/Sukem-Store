// store/user.js
import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (credentials) => {
    if (!credentials.email || !credentials.password) {
      return { success: false, message: "Vui lòng nhập email và mật khẩu." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch("/api/authen/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!data.success) {
        set({ isLoading: false });
        return { success: false, message: data.message };
      } else {
        localStorage.setItem("token", data.token);
        set({ 
          user: data.user || { name: credentials.name, email: credentials.email, role: data.user?.role || "worker" },
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true, message: "Đăng nhập thành công" };
      }
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  register: async (userData) => {
    if (!userData.name || !userData.email || !userData.password) {
      return { success: false, message: "Vui lòng điền đầy đủ các trường." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch("/api/authen/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      set({ isLoading: false });

      return { 
        success: data.success, 
        message: data.success ? "Đăng ký thành công" : data.message 
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }
    
    try {
      const res = await fetch("/api/authen/verify-token", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        set({ isAuthenticated: true, user: data.user });
        return true;
      } else {
        localStorage.removeItem("token");
        set({ isAuthenticated: false, user: null });
        return false;
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      // Nếu không connect được server, giữ nguyên trạng thái hiện tại
      // THAY ĐỔI: Không tự động đặt isAuthenticated thành true
      return get().isAuthenticated;
    }
  },
  
  // Thêm phương thức quên mật khẩu
  forgotPassword: async (email) => {
    if (!email) {
      return { success: false, message: "Vui lòng nhập email." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch("/api/authen/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      set({ isLoading: false });
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  // Phương thức xác minh mã reset
  verifyResetCode: async (email, resetCode) => {
    if (!email || !resetCode) {
      return { success: false, message: "Vui lòng nhập đầy đủ thông tin." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch("/api/authen/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode }),
      });

      const data = await res.json();
      set({ isLoading: false });
      
      return {
        success: data.success,
        message: data.message,
        resetToken: data.resetToken
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  // Phương thức đổi mật khẩu mới
  resetPassword: async (resetToken, newPassword) => {
    if (!resetToken || !newPassword) {
      return { success: false, message: "Thông tin không hợp lệ." };
    }
    
    set({ isLoading: true });
    
    try {
      const res = await fetch("/api/authen/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await res.json();
      set({ isLoading: false });
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  // Kiểm tra quyền của người dùng - SỬA LẠI để luôn lấy state hiện tại
  hasPermission: (role) => {
    // Lấy state hiện tại từ store
    const { user } = get();
    
    if (!user) return false;
    
    if (role === "manager") {
      return user.role === "manager";
    }
    
    // Worker có thể truy cập các tính năng của worker
    if (role === "worker") {
      return ["worker", "manager"].includes(user.role);
    }
    
    return false;
  },
  
  // Lấy danh sách người dùng (chỉ cho manager)
  getAllUsers: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này." };
    }
    
    try {
      const res = await fetch("/api/authen/users", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      return await res.json();
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      return { success: false, message: "Không thể kết nối server." };
    }
  },
  
  // Cập nhật vai trò người dùng (chỉ cho manager)
  updateUserRole: async (userId, role) => {
    // Kiểm tra người dùng đang đăng nhập
    const { user } = get();
    if (userId === user?._id) {
      return { success: false, message: "Không thể thay đổi vai trò của chính mình." };
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này." };
    }
    
    try {
      const res = await fetch(`/api/authen/users/${userId}/role`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role })
      });
      
      return await res.json();
    } catch (error) {
      console.error("Lỗi khi cập nhật vai trò:", error);
      return { success: false, message: "Không thể kết nối server." };
    }
  }
}));