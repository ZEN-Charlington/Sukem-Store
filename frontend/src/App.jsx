import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "./store/user";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import InventoryPage from "./pages/InventoryPage";
import PromotionPage from "./pages/PromotionPage";
import Navbar from "./components/NavBar/Navbar";

function App() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true);
      await checkAuth();
      setIsChecking(false);
    };
    verifyAuth();
  }, [checkAuth]);

  const renderContent = () => {
    if (isChecking) {
      return <Box textAlign="center" py={10}>Đang kiểm tra xác thực...</Box>;
    }

    return (
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
        />
        
        <Route 
          path="/forgot-password" 
          element={isAuthenticated ? <Navigate to="/" /> : <ForgotPasswordPage />} 
        />

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

        <Route
          path="/promotions"
          element={
            isAuthenticated ? (
              user?.role === "manager" ? (
                <>
                  <Navbar onSearch={setSearchKeyword} />
                  <PromotionPage />
                </>
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
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
        
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} 
        />
      </Routes>
    );
  };

  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
      {renderContent()}
    </Box>
  );
}

export default App;