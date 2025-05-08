// components/PermissionGuard.jsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/user";
import { Box, Center, VStack, Icon, Text, Button } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";

const PermissionGuard = ({ requiredRole, children }) => {
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  if (!user || !hasPermission(requiredRole)) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Icon as={FaLock} fontSize="6xl" color="red.500" />
          <Text fontSize="xl" fontWeight="bold">
            Bạn không có quyền truy cập chức năng này
          </Text>
          <Text color="gray.500">
            Tính năng này chỉ dành cho tài khoản có vai trò {requiredRole === "manager" ? "Quản lý" : "Nhân viên"}.
          </Text>
          <Button colorScheme="blue" onClick={() => navigate("/")}>
            Quay về trang chủ
          </Button>
        </VStack>
      </Center>
    );
  }

  return children;
};

export default PermissionGuard;