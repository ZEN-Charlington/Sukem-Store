// App.jsx
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "./store/user";

// Import các trang và components
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RegisterPage from "./pages/RegisterPage";
import PermissionGuard from "./components/PermissionGuard";
import Navbar from "./components/NavBar/Navbar";

// Component bảo vệ route yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    verify();
  }, [checkAuth]);

  if (isChecking) {
    return <Box textAlign="center" py={10}>Đang kiểm tra...</Box>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      <Routes>
        {/* Trang chủ - tất cả người dùng đã đăng nhập đều có thể truy cập */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar onSearch={setSearchKeyword} />
              <HomePage searchKeyword={searchKeyword} />
            </ProtectedRoute>
          }
        />
        
        {/* Trang tạo sản phẩm - yêu cầu quyền manager */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <PermissionGuard requiredRole="manager">
                <Navbar onSearch={setSearchKeyword} />
                <CreatePage />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        
        {/* Các trang không yêu cầu đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Box>
  );
}

export default App;