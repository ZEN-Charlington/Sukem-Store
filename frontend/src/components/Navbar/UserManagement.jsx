// components/NavBar/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Alert, AlertIcon, Box, Text, Badge, 
  Select, useToast, Button, useColorModeValue, Flex
} from '@chakra-ui/react';
import { useAuthStore } from '../../store/user';
import { formatDateTime } from '../../utils/DateTimeUtils';

const UserManagement = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user: currentUser, getAllUsers, updateUserRole, hasPermission } = useAuthStore();
  const toast = useToast();
  
  const bgRole = useColorModeValue('gray.100', 'gray.700');
  
  // Kiểm tra quyền quản lý
  const isManager = hasPermission("manager");

  useEffect(() => {
    if (isOpen && isManager) {
      fetchUsers();
    }
  }, [isOpen, isManager]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAllUsers();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message || "Không thể lấy danh sách người dùng.");
      }
    } catch (error) {
      setError("Lỗi kết nối với server.");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setIsUpdating(true);

    try {
      const result = await updateUserRole(userId, newRole);
      
      if (result.success) {
        // Cập nhật danh sách người dùng
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, role: newRole } : user
          )
        );

        toast({
          title: "Thành công",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể cập nhật vai trò người dùng",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Hiển thị badge cho vai trò người dùng
  const getRoleBadge = (role) => {
    return (
      <Badge 
        colorScheme={role === "manager" ? "green" : "blue"}
        px={2}
        py={1}
        borderRadius="full"
      >
        {role === "manager" ? "Quản lý" : "Nhân viên"}
      </Badge>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="90%">
        <ModalHeader textAlign="center">Quản lý người dùng</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isManager ? (
            <Alert status="error" variant="solid" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Không có quyền truy cập!</Text>
                <Text>Tính năng này chỉ dành cho tài khoản có vai trò Quản lý.</Text>
              </Box>
            </Alert>
          ) : isLoading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
            </Box>
          ) : error ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" colorScheme="blue" size="md">
                <Thead>
                  <Tr>
                    <Th>Họ tên</Th>
                    <Th>Email</Th>
                    <Th>Vai trò</Th>
                    <Th>Ngày tạo</Th>
                    <Th>Thao tác</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <Tr key={user._id}>
                        <Td>{user.name}</Td>
                        <Td>{user.email}</Td>
                        <Td>{getRoleBadge(user.role)}</Td>
                        <Td>{formatDateTime(user.createdAt)}</Td>
                        <Td>
                          <Flex align="center">
                            <Select
                              size="sm"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              isDisabled={isUpdating || user._id === currentUser?._id}
                              bg={bgRole}
                              w="150px"
                            >
                              <option value="worker">Nhân viên</option>
                              <option value="manager">Quản lý</option>
                            </Select>
                          </Flex>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5} textAlign="center">
                        Không có người dùng nào.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Đóng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserManagement;