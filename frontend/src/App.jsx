// App.jsx
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "./store/user";

// Import các trang và components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import InventoryPage from "./pages/InventoryPage";
import Navbar from "./components/NavBar/Navbar";

function App() {
  // QUAN TRỌNG: Không thay đổi thứ tự các hooks trong component
  const [searchKeyword, setSearchKeyword] = useState("");
  
  // Sử dụng useAuthStore trước khi khai báo các hooks khác
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  
  // Đảm bảo useState luôn được gọi trong mọi render, không nên phụ thuộc vào điều kiện
  const [isChecking, setIsChecking] = useState(true);

  // Đảm bảo useEffect luôn được gọi trong mọi render
  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true);
      await checkAuth();
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuth]);

  // Sử dụng biến để điều kiện thay vì return sớm
  const renderContent = () => {
    if (isChecking) {
      return <Box textAlign="center" py={10}>Đang kiểm tra xác thực...</Box>;
    }

    return (
      <Routes>
        {/* Các trang không yêu cầu đăng nhập */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
        />
        
        <Route 
          path="/forgot-password" 
          element={isAuthenticated ? <Navigate to="/" /> : <ForgotPasswordPage />} 
        />

        {/* Trang chủ - yêu cầu đăng nhập */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <>
                <Navbar onSearch={setSearchKeyword} />
                <HomePage searchKeyword={searchKeyword} />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        {/* Trang quản lý kho - yêu cầu đăng nhập và quyền manager */}
        <Route
          path="/inventory"
          element={
            isAuthenticated ? (
              user?.role === "manager" ? (
                <>
                  <Navbar onSearch={setSearchKeyword} />
                  <InventoryPage />
                </>
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Chuyển hướng các route khác về trang đăng nhập hoặc trang chủ */}
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} 
        />
      </Routes>
    );
  };

  // Đảm bảo cấu trúc component nhất quán
  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      {renderContent()}
    </Box>
  );
}

export default App;