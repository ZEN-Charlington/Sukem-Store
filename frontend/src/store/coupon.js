import { create } from "zustand";

export const useCouponStore = create((set) => ({
  coupons: [],
  setCoupons: (coupons) => set({ coupons }),
  
  fetchCoupons: async (filters = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/api/coupons?${queryParams}` : "/api/coupons";
    
    try {
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        set({ coupons: data.data });
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách coupon:", error);
      return { success: false, message: "Lỗi server" };
    }
  },
  
  applyCoupon: async (code, totalAmount) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code, totalAmount }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Lỗi khi áp dụng coupon:", error);
      return { success: false, message: "Lỗi server" };
    }
  },
  
  getCouponByCode: async (code) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    try {
      const res = await fetch(`/api/coupons/${code}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin coupon:", error);
      return { success: false, message: "Lỗi server" };
    }
  },
  
  deleteCoupon: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        set((state) => ({
          coupons: state.coupons.filter(coupon => coupon._id !== id)
        }));
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi xóa coupon:", error);
      return { success: false, message: "Lỗi server" };
    }
  }
}));