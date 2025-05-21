// components/NavBar/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Alert, AlertIcon, Box, Text, Badge, 
  Select, useToast, Button, useColorModeValue, Flex, IconButton,
  FormControl, FormLabel, Input, InputGroup, InputRightElement, FormErrorMessage,
  useDisclosure
} from '@chakra-ui/react';
import { useAuthStore } from '../../store/user';
import { formatDateTime } from '../../utils/DateTimeUtils';
import { FaTrashAlt, FaPlusCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

// Modal tạo người dùng mới (sử dụng register từ store)
const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên không được để trống';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Người dùng đã được tạo thành công',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'worker'
        });
        
        // Đóng modal và reload danh sách người dùng
        onClose();
        if (onUserCreated) onUserCreated();
      } else {
        toast({
          title: 'Lỗi',
          description: result.message || 'Không thể tạo người dùng',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi khi tạo người dùng',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tạo người dùng mới</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={errors.name} mb={4}>
            <FormLabel>Họ tên</FormLabel>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ tên"
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={errors.email} mb={4}>
            <FormLabel>Email</FormLabel>
            <Input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={errors.password} mb={4}>
            <FormLabel>Mật khẩu</FormLabel>
            <InputGroup>
              <Input 
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>Vai trò</FormLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="worker">Nhân viên</option>
              <option value="manager">Quản lý</option>
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>
            Tạo người dùng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Modal xác nhận xóa người dùng
const DeleteConfirmModal = ({ isOpen, onClose, user, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Không có hàm deleteUser trong store, tạm thời cho hiển thị thông báo thành công
      toast({
        title: "Chức năng chưa hoàn thiện",
        description: "Chức năng xóa người dùng đang được phát triển",
        status: "info",
        duration: 3000,
        isClosable: true
      });
      
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Xác nhận xóa</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Bạn có chắc chắn muốn xóa người dùng <Text as="span" fontWeight="bold">{user?.name}</Text> ({user?.email})?
          </Text>
          <Alert status="warning" mt={4}>
            <AlertIcon />
            Hành động này không thể hoàn tác.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose} isDisabled={isDeleting}>
            Hủy
          </Button>
          <Button colorScheme="red" onClick={handleDelete} isLoading={isDeleting}>
            Xóa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const UserManagement = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user: currentUser, getAllUsers, updateUserRole, hasPermission, register } = useAuthStore();
  const toast = useToast();
  
  const bgRole = useColorModeValue('gray.100', 'gray.700');
  
  // Modal tạo người dùng mới
  const { 
    isOpen: isCreateModalOpen, 
    onOpen: onCreateModalOpen, 
    onClose: onCreateModalClose 
  } = useDisclosure();
  
  // Modal xác nhận xóa người dùng
  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure();
  
  // Người dùng được chọn để xóa
  const [userToDelete, setUserToDelete] = useState(null);
  
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
  
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    onDeleteModalOpen();
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
    <>
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
              <>
                <Flex justifyContent="flex-end" mb={4}>
                  <Button 
                    leftIcon={<FaPlusCircle />} 
                    colorScheme="green" 
                    onClick={onCreateModalOpen}
                  >
                    Thêm người dùng
                  </Button>
                </Flex>
                
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
                                  mr={2}
                                >
                                  <option value="worker">Nhân viên</option>
                                  <option value="manager">Quản lý</option>
                                </Select>
                                {user._id !== currentUser?._id && (
                                  <IconButton
                                    icon={<FaTrashAlt />}
                                    colorScheme="red"
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Xóa người dùng"
                                    onClick={() => handleDeleteClick(user)}
                                  />
                                )}
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
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Modal tạo người dùng mới sử dụng register */}
      <CreateUserModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        onUserCreated={fetchUsers}
      />
      
      {/* Modal xác nhận xóa người dùng */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        user={userToDelete}
        onDelete={() => {}}
      />
    </>
  );
};

export default UserManagement;