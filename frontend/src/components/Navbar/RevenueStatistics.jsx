// components/NavBar/RevenueStatistics.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Alert,
  AlertIcon,
  Text,
  Spinner
} from '@chakra-ui/react';
import { useReceiptStore } from '../../store/receipt';
import { useAuthStore } from '../../store/user';
import StatisticsChart from './RevStat/StatisticsChart';
import HotProducts from './RevStat/HotProduct';

const RevenueStatistics = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('today');
  const [receipts, setReceipts] = useState([]);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    orderCount: 0,
    previousPeriodGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuthStore();

  const { fetchReceipts } = useReceiptStore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Kiểm tra quyền - chỉ manager mới có thể xem thống kê doanh thu
  const hasRequiredPermission = hasPermission("manager");

  // Fetch receipts when modal opens
  useEffect(() => {
    const getReceipts = async () => {
      if (!isOpen || !hasRequiredPermission) return;
      
      setLoading(true);
      try {
        const response = await fetchReceipts();
        
        if (!response.success) {
          console.error("Failed to fetch receipts:", response.message);
          setLoading(false);
          return;
        }

        setReceipts(response.data);
        // Initial processing with the current filter
        processRevenueData(response.data, filter);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
      setLoading(false);
    };

    getReceipts();
  }, [isOpen, fetchReceipts, hasRequiredPermission]);

  // Process data when filter changes
  useEffect(() => {
    if (receipts.length > 0) {
      processRevenueData(receipts, filter);
    }
  }, [filter, receipts]);

  // Process revenue data based on filter
  const processRevenueData = (receipts, currentFilter) => {
    const now = new Date();
    let filteredReceipts = [];

    // Filter receipts based on selected time period
    switch (currentFilter) {
      case 'today':
        filteredReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.toDateString() === now.toDateString();
        });
        break;
        
      case 'thisWeek':
        filteredReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          const daysDiff = Math.floor((now - receiptDate) / (1000 * 60 * 60 * 24));
          return daysDiff < 7; // Last 7 days
        });
        break;
        
      case 'thisMonth':
        filteredReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.getMonth() === now.getMonth() && 
                 receiptDate.getFullYear() === now.getFullYear();
        });
        break;
        
      case 'thisYear':
        filteredReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.getFullYear() === now.getFullYear();
        });
        break;
        
      default:
        filteredReceipts = receipts;
    }

    // Calculate total revenue and order count
    const total = filteredReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
    const orderCount = filteredReceipts.length;

    // Calculate previous period growth
    const previousPeriodGrowth = calculatePreviousPeriodGrowth(receipts, currentFilter);

    setRevenueData({
      total,
      orderCount,
      previousPeriodGrowth
    });
  };

  // Calculate growth compared to previous period based on filter
  const calculatePreviousPeriodGrowth = (receipts, currentFilter) => {
    const now = new Date();
    let currentPeriodReceipts = [];
    let previousPeriodReceipts = [];
    
    switch (currentFilter) {
      case 'today':
        // Current period: today
        currentPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.toDateString() === now.toDateString();
        });
        
        // Previous period: yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        previousPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.toDateString() === yesterday.toDateString();
        });
        break;
        
      case 'thisWeek':
        // Current period: this week (last 7 days)
        currentPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          const daysDiff = Math.floor((now - receiptDate) / (1000 * 60 * 60 * 24));
          return daysDiff < 7;
        });
        
        // Previous period: last week (7-14 days ago)
        previousPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          const daysDiff = Math.floor((now - receiptDate) / (1000 * 60 * 60 * 24));
          return daysDiff >= 7 && daysDiff < 14;
        });
        break;
        
      case 'thisMonth':
        // Current period: this month
        currentPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.getMonth() === now.getMonth() && 
                 receiptDate.getFullYear() === now.getFullYear();
        });
        
        // Previous period: last month
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        previousPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.getMonth() === lastMonth.getMonth() && 
                 receiptDate.getFullYear() === lastMonth.getFullYear();
        });
        break;
        
      case 'thisYear':
        // Current period: this year
        currentPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.getFullYear() === now.getFullYear();
        });
        
        // Previous period: last year
        const lastYear = new Date(now);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        previousPeriodReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          return receiptDate.getFullYear() === lastYear.getFullYear();
        });
        break;
    }
    
    const currentTotal = currentPeriodReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
    const previousTotal = previousPeriodReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
    
    // Calculate growth percentage
    if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
    
    return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  };

  // Format number as Vietnamese currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', 'đ');
  };

  // Get period label based on filter
  const getPeriodLabel = () => {
    switch (filter) {
      case 'today':
        return 'ngày hôm qua';
      case 'thisWeek':
        return 'tuần trước';
      case 'thisMonth':
        return 'tháng trước';
      case 'thisYear':
        return 'năm trước';
      default:
        return 'kỳ trước';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Thống kê doanh thu</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!hasRequiredPermission ? (
            // Hiển thị thông báo khi không có quyền
            <Alert status="error" variant="solid" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Không có quyền truy cập!</Text>
                <Text>Tính năng này chỉ dành cho tài khoản có vai trò Quản lý.</Text>
              </Box>
            </Alert>
          ) : loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
              <Text mt={4}>Đang tải dữ liệu...</Text>
            </Box>
          ) : (
            <>
              {/* Filter */}
              <Flex justifyContent="flex-end" mb={4}>
                <Select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)} 
                  width="200px"
                >
                  <option value="today">Hôm nay</option>
                  <option value="thisWeek">Tuần này</option>
                  <option value="thisMonth">Tháng này</option>
                  <option value="thisYear">Năm nay</option>
                </Select>
              </Flex>

              {/* Cards */}
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={6}>
                <Stat p={4} borderRadius="lg" boxShadow="sm" bg={cardBg}>
                  <StatLabel>Tổng doanh thu</StatLabel>
                  <StatNumber>{formatCurrency(revenueData.total)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type={revenueData.previousPeriodGrowth >= 0 ? "increase" : "decrease"} />
                    {Math.abs(revenueData.previousPeriodGrowth)}% so với {getPeriodLabel()}
                  </StatHelpText>
                </Stat>
              <Stat p={4} borderRadius="lg" boxShadow="sm" bg={cardBg}>
                <StatLabel>Tổng đơn hàng</StatLabel>
                <StatNumber>{revenueData.orderCount}</StatNumber>
                <StatHelpText>
                  {revenueData.orderCount > 0 
                    ? `Đơn hàng trung bình: ${formatCurrency(revenueData.total / revenueData.orderCount)}`
                    : 'Chưa có đơn hàng'}
                </StatHelpText>
              </Stat>
            </Grid>

            {/* Chart Component */}
            <StatisticsChart filter={filter} receipts={receipts} />

            {/* Hot Products Component */}
            <HotProducts receipts={receipts} />
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
);
};

export default RevenueStatistics;