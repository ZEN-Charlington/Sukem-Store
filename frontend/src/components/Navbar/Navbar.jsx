// components/NavBar/Navbar.jsx
import {
  Box, Button, Container, Flex, HStack, Text, Input, useColorMode, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Icon,
  Divider, Tooltip
} from '@chakra-ui/react';
import { Link, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser, FaUsers, FaClipboardList, FaReceipt, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import { FiDatabase } from "react-icons/fi";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { useAuthStore } from "../../store/user";
import { useDisclosure } from '@chakra-ui/react';
import AuditLogs from './AuditLogs';
import TransactionHistory from './TransactionHistory';
import RevenueStatistics from './RevenueStatistics';
import UserManagement from './UserManagement';

const Navbar = ({ onSearch }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.100", "gray.900");
  const buttonBg = useColorModeValue("white", "gray.800");
  const buttonHoverBg = useColorModeValue("gray.100", "gray.700");
  const navigate = useNavigate();
  const { logout, user, hasPermission } = useAuthStore();
  
  // Modal controls
  const { 
    isOpen: isAuditLogOpen, 
    onOpen: onAuditLogOpen, 
    onClose: onAuditLogClose 
  } = useDisclosure();
  
  const {
    isOpen: isTransactionHistoryOpen,
    onOpen: onTransactionHistoryOpen,
    onClose: onTransactionHistoryClose
  } = useDisclosure();

  const {
    isOpen: isRevenueStatisticsOpen,
    onOpen: onRevenueStatisticsOpen,
    onClose: onRevenueStatisticsClose
  } = useDisclosure();
  const {
    isOpen: isUserManagementOpen,
    onOpen: onUserManagementOpen,
    onClose: onUserManagementClose
  } = useDisclosure();

  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Kiểm tra quyền truy cập
  const isManager = hasPermission("manager");

  // Chuyển hướng đến trang quản lý kho
  const goToInventory = () => {
    navigate('/inventory');
  };

  return (
    <Box position="sticky" top="0" zIndex="999" bg={bg} boxShadow="sm" w="100%">
      <Container maxW="1140px" px={4} py={2}>
        <Flex h={16} alignItems="center" justifyContent="space-between" flexDir={{ base: "column", sm: "row" }} px={2}>
          {/* Logo */}
          <Text fontSize={{ base: "22", sm: "28" }} fontWeight="bold" textTransform="uppercase" textAlign="center" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
            <Link to="/">Sukem Store 🛒</Link>
          </Text>

          {/* Thanh Tìm kiếm */}
          <Input placeholder="Tìm tên sản phẩm..." onChange={handleChange} bg={useColorModeValue("white", "gray.700")} w={{ base: "100%", sm: "500px" }} />

          {/* Nút quản lý kho, đổi màu và tài khoản */}
          <HStack spacing={2}>
            {/* Chỉ hiển thị nút quản lý kho cho manager */}
            {isManager && (
                <Button 
                  onClick={goToInventory} 
                  bg={buttonBg}
                  _hover={{ bg: buttonHoverBg }}
                  shadow="sm"
                >
                  <Icon as={FiDatabase} size="20"/>
                </Button>
            )}
            <Button 
              onClick={toggleColorMode}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              shadow="sm"
            >
              {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
            </Button>
            
            {/* Menu quản lý tài khoản */}
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                shadow="sm"
              >
                <Icon as={FaUser} />
              </MenuButton>
              <MenuList>
                <Text px={3} py={1} fontSize="sm" color="gray.500">
                  Xin chào, {user?.name || user?.email || "Pháp sư vô danh"}
                </Text>
                <Text px={3} py={1} fontSize="sm" color="gray.500">
                  Vai trò: {user?.role === "manager" ? "Quản lý" : "Nhân viên"}
                </Text>
                <Divider my={1} />
                
                {/* Hiển thị menu Lịch sử giao dịch cho cả manager và worker */}
                <MenuItem icon={<FaReceipt />} onClick={onTransactionHistoryOpen}>
                  Lịch sử giao dịch
                </MenuItem>
                
                {/* Chỉ hiển thị các tính năng quản lý đặc biệt cho manager */}
                {isManager && (
                  <>
                    <MenuItem icon={<FaClipboardList />} onClick={onAuditLogOpen}>
                      Nhật ký chỉnh sửa
                    </MenuItem>
                    <MenuItem icon={<FaChartLine />} onClick={onRevenueStatisticsOpen}>
                      Thống kê doanh thu
                    </MenuItem>
                    <MenuItem icon={<FaUsers />} onClick={onUserManagementOpen}>
                      Quản lý người dùng
                    </MenuItem>
                  </>
                )}
                
                <Divider my={1} />
                <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                  Đăng xuất
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
      <AuditLogs isOpen={isAuditLogOpen} onClose={onAuditLogClose} />
      <TransactionHistory isOpen={isTransactionHistoryOpen} onClose={onTransactionHistoryClose} />
      <RevenueStatistics isOpen={isRevenueStatisticsOpen} onClose={onRevenueStatisticsClose} />
      <UserManagement isOpen={isUserManagementOpen} onClose={onUserManagementClose} />
    </Box>
  );
};

export default Navbar;