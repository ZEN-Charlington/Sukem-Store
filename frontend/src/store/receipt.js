import { create } from "zustand";
import { useProductStore } from "./product"; 

export const useReceiptStore = create((set) => ({
    receipts: [],
    setReceipts: (receipts) => set({ receipts }),
    
    createReceipt: async (receiptData) => {
        // Validate required fields
        if (!receiptData.products || !receiptData.userId || !receiptData.paymentMethod) {
            return { success: false, message: "Thiếu thông tin hóa đơn" };
        }
        
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            return { success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này." };
        }
        
        try {
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(receiptData),
            });
            const data = await res.json();
            
            if (!data.success) {
                return { success: false, message: data.message };
            }
            
            // Cập nhật state với hóa đơn mới
            set((state) => ({ receipts: [...state.receipts, data.data] }));
            const { fetchProducts } = useProductStore.getState();
            await fetchProducts();

            return { success: true, message: "Hóa đơn mới đã được tạo.", data: data.data };
        } catch (error) {
            console.error("Lỗi khi tạo hóa đơn:", error);
            return { success: false, message: "Đã xảy ra lỗi khi tạo hóa đơn" };
        }
    },
    
    fetchReceipts: async () => {
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            return { success: false, message: "Bạn cần đăng nhập để xem hóa đơn." };
        }
        
        try {
            const res = await fetch("/api/invoices", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.success) {
                set({ receipts: data.data });
            }
            return data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hóa đơn:", error);
            return { success: false, message: "Đã xảy ra lỗi khi lấy danh sách hóa đơn" };
        }
    },
    
    getReceiptById: async (id) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            return { success: false, message: "Bạn cần đăng nhập để xem chi tiết hóa đơn." };
        }
        
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            return data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
            return { success: false, message: "Đã xảy ra lỗi khi lấy chi tiết hóa đơn" };
        }
    },
    
    // Nếu bạn cần thêm chức năng xóa hóa đơn
    deleteReceipt: async (receiptId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return { success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này." };
        }
        
        try {
            const res = await fetch(`/api/invoices/${receiptId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (!data.success) return { success: false, message: data.message };
            
            // Cập nhật UI ngay lập tức
            set((state) => ({ 
                receipts: state.receipts.filter((receipt) => receipt._id !== receiptId) 
            }));
            
            return { success: true, message: data.message };
        } catch (error) {
            console.error("Lỗi khi xóa hóa đơn:", error);
            return { success: false, message: "Đã xảy ra lỗi khi xóa hóa đơn" };
        }
    }
}));