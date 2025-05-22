import { create } from "zustand";
import { useProductStore } from "./product"; 

export const useReceiptStore = create((set) => ({
    receipts: [],
    setReceipts: (receipts) => set({ receipts }),
    
    createReceipt: async (receiptData) => {
        if (!receiptData.products || !receiptData.userId || !receiptData.paymentMethod) {
            return { success: false, message: "Thiếu thông tin hóa đơn" };
        }
        
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
            
            set((state) => ({ receipts: [...state.receipts, data.data] }));
            const { fetchProducts } = useProductStore.getState();
            await fetchProducts();

            // Return đầy đủ response từ backend, bao gồm coupon
            return {
                success: true, 
                message: data.message, // Message từ backend
                data: data.data,
                coupon: data.coupon // Thêm coupon từ backend
            };
        } catch (error) {
            console.error("Lỗi khi tạo hóa đơn:", error);
            return { success: false, message: "Đã xảy ra lỗi khi tạo hóa đơn" };
        }
    },
    
    fetchReceipts: async () => {
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