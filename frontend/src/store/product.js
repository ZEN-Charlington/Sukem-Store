// store/product.js
import { create } from "zustand";

export const useProductStore = create((set) => ({
    products: [],
    setProducts: (products) => set({ products }),
    createProduct: async (newProduct) => {
        if (!newProduct.name || !newProduct.price || !newProduct.initialPrice || 
            !newProduct.storage || !newProduct.image) {
            return {success: false, message:"Vui lòng điền đầy đủ thông tin sản phẩm."}
        }
        
        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            return {success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này."}
        }
        
        const res = await fetch("/api/products", {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${token}` 
            },
            body:JSON.stringify(newProduct),
        });
        const data = await res.json();
        
        if (!data.success) {
            return {success: false, message: data.message}
        }
        
        set((state) => ({ products: [...state.products, data.data] }));
        return {success: true, message:"Sản phẩm mới đã được tạo."}
    }, 
    fetchProducts: async () => {
        const token = localStorage.getItem("token");
        
        const headers = token 
            ? { "Authorization": `Bearer ${token}` } 
            : {};
            
        const res = await fetch("/api/products", {
            headers: headers
        });
        const data = await res.json();
        
        if (data.success) {
            set({ products: data.data });
        }
        return data;
    },
    deleteProduct: async(pid) =>{
        const token = localStorage.getItem("token");
        if (!token) {
            return {success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này."}
        }
        
        const res = await fetch(`/api/products/${pid}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        if(!data.success) return {success: false, message: data.message};

        set((state) => ({ products: state.products.filter((product) => product._id !== pid) }));
        return {success: true, message: data.message};
    },
    updateProduct: async(pid, updatedProduct) =>{
        const token = localStorage.getItem("token");
        if (!token) {
            return {success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này."}
        }
        
        const res = await fetch(`/api/products/${pid}`,{
            method: "PUT",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedProduct),
        });
        const data = await res.json();
        if (!data.success) return {success: false, message: data.message};
        
        set(state => ({ 
            products: state.products.map((product) => (product._id === pid ? data.data : product)),
        }));
        return {success: true, message: data.message};
    },
    updateStorage: async(pid, quantity) =>{
        const token = localStorage.getItem("token");
        if (!token) {
            return {success: false, message: "Bạn cần đăng nhập để thực hiện chức năng này."}
        }
        
        const res = await fetch(`/api/products/${pid}/storage`,{
            method: "PUT",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ quantity }),
        });
        const data = await res.json();
        if (!data.success) return {success: false, message: data.message};
        
        set(state => ({ 
            products: state.products.map((product) => (product._id === pid ? data.data : product)),
        }));
        return {success: true, message: "Đã cập nhật số lượng tồn kho."};
    },
}));