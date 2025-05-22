import { create } from "zustand";

export const usePromotionStore = create((set) => ({
  promotions: [],
  setPromotions: (promotions) => set({ promotions }),
  
  fetchPromotions: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    try {
      const res = await fetch("/api/promotions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        set({ promotions: data.data });
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách promotion:", error);
      return { success: false, message: "Lỗi server" };
    }
  },
  
  createPromotion: async (promotionData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(promotionData),
      });
      const data = await res.json();
      
      if (data.success) {
        set((state) => ({ promotions: [...state.promotions, data.data] }));
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi tạo promotion:", error);
      return { success: false, message: "Lỗi server" };
    }
  },
  
  updatePromotion: async (id, promotionData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(promotionData),
      });
      const data = await res.json();
      
      if (data.success) {
        set((state) => ({
          promotions: state.promotions.map(promotion => 
            promotion._id === id ? data.data : promotion
          )
        }));
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi cập nhật promotion:", error);
      return { success: false, message: "Lỗi server" };
    }
  },
  
  deletePromotion: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Bạn cần đăng nhập" };
    }
    
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        set((state) => ({
          promotions: state.promotions.filter(promotion => promotion._id !== id)
        }));
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi xóa promotion:", error);
      return { success: false, message: "Lỗi server" };
    }
  },
  
  getPromotionByProduct: async (productId) => {
    try {
      const res = await fetch(`/api/promotions/product/${productId}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Lỗi khi lấy promotion theo product:", error);
      return { success: false, message: "Lỗi server" };
    }
  }
}));