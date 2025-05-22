import {
  Box, Button, Container, Flex, HStack, Text, Input, useColorMode, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Icon,
  Divider, Tooltip
} from '@chakra-ui/react';
import { Link, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser, FaUsers, FaClipboardList, FaReceipt, FaChartLine, FaSignOutAlt, FaTicketAlt } from "react-icons/fa";
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

  const isManager = hasPermission("manager");

  const goToInventory = () => {
    navigate('/inventory');
  };

  const goToPromotions = () => {
    navigate('/promotions');
  };

  return (
    <Box position="sticky" top="0" zIndex="999" bg={bg} boxShadow="sm" w="100%">
      <Container maxW="1140px" px={4} py={2}>
        <Flex h={16} alignItems="center" justifyContent="space-between" flexDir={{ base: "column", sm: "row" }} px={2}>
          <Text fontSize={{ base: "22", sm: "28" }} fontWeight="bold" textTransform="uppercase" textAlign="center" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
            <Link to="/">Sukem Store 🛒</Link>
          </Text>

          <Input placeholder="Tìm tên sản phẩm..." onChange={handleChange} bg={useColorModeValue("white", "gray.700")} w={{ base: "100%", sm: "500px" }} />

          <HStack spacing={2}>
            {isManager && (
              <>
                <Tooltip label="Quản lý khuyến mãi" hasArrow>
                  <Button 
                    onClick={goToPromotions} 
                    bg={buttonBg}
                    _hover={{ bg: buttonHoverBg }}
                    shadow="sm"
                  >
                    <Icon as={FaTicketAlt} size="20"/>
                  </Button>
                </Tooltip>
                
                <Tooltip label="Quản lý kho hàng" hasArrow>
                  <Button 
                    onClick={goToInventory} 
                    bg={buttonBg}
                    _hover={{ bg: buttonHoverBg }}
                    shadow="sm"
                  >
                    <Icon as={FiDatabase} size="20"/>
                  </Button>
                </Tooltip>
              </>
            )}
            
            <Tooltip label={colorMode === "light" ? "Chế độ tối" : "Chế độ sáng"} hasArrow>
              <Button 
                onClick={toggleColorMode}
                bg={buttonBg}
                _hover={{ bg: buttonHoverBg }}
                shadow="sm"
              >
                {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
              </Button>
            </Tooltip>
            
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
                
                <MenuItem icon={<FaReceipt />} onClick={onTransactionHistoryOpen}>
                  Lịch sử giao dịch
                </MenuItem>
                
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