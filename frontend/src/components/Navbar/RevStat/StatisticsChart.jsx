import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatisticsChart = ({ filter, receipts }) => {
  const [chartData, setChartData] = useState([]);
  
  const tooltipBg = useColorModeValue('white', 'gray.700');
  const tooltipColor = useColorModeValue('black', 'white');
  const cardBg = useColorModeValue('white', 'gray.700');

  // Process chart data whenever filter or receipts change
  useEffect(() => {
    if (!receipts) return;
    
    let processedChartData = [];
    
    // Process data based on selected time period
    switch (filter) {
      case 'today':
        processedChartData = groupReceiptsByHours(receipts);
        break;
      case 'thisWeek':
        processedChartData = groupReceiptsByDays(receipts);
        break;
      case 'thisMonth':
        processedChartData = groupReceiptsByWeeks(receipts);
        break;
      case 'thisYear':
        processedChartData = groupReceiptsByMonths(receipts);
        break;
      default:
        processedChartData = [];
    }
    
    setChartData(processedChartData);
  }, [filter, receipts]);

  // Group receipts by hours for the daily chart
  const groupReceiptsByHours = (receipts) => {
    const now = new Date();
    // Filter receipts for today
    const todayReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate.toDateString() === now.toDateString();
    });
    
    const hourlyData = {};
    
    // Initialize hours from 0 to 23
    for (let i = 0; i < 24; i++) {
      const hourKey = `${i}:00`;
      hourlyData[hourKey] = 0;
    }
    
    todayReceipts.forEach(receipt => {
      const receiptDate = new Date(receipt.date);
      const hour = receiptDate.getHours();
      const hourKey = `${hour}:00`;
      
      hourlyData[hourKey] = (hourlyData[hourKey] || 0) + receipt.totalAmount;
    });
    
    // Convert to array format for chart
    return Object.keys(hourlyData)
      .filter(hour => parseInt(hour) >= 6 && parseInt(hour) < 24) // Only business hours
      .map(hour => ({
        time: hour,
        revenue: hourlyData[hour]
      }));
  };

  // Group receipts by days for the weekly chart
  const groupReceiptsByDays = (receipts) => {
    const now = new Date();
    // Filter receipts for this week
    const thisWeekReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      const daysDiff = Math.floor((now - receiptDate) / (1000 * 60 * 60 * 24));
      return daysDiff < 7; // Last 7 days
    });
    
    const dailyData = {};
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    // Initialize days
    for (let i = 0; i < 7; i++) {
      dailyData[dayNames[i]] = 0;
    }
    
    thisWeekReceipts.forEach(receipt => {
      const receiptDate = new Date(receipt.date);
      const dayIndex = receiptDate.getDay(); // 0 is Sunday
      const dayName = dayNames[dayIndex];
      
      dailyData[dayName] = (dailyData[dayName] || 0) + receipt.totalAmount;
    });
    
    // Convert to array format for chart
    return dayNames.map(day => ({
      time: day,
      revenue: dailyData[day]
    }));
  };

  // Group receipts by weeks for the monthly chart - ĐÃ CẢI THIỆN
  const groupReceiptsByWeeks = (receipts) => {
    const now = new Date();
    // Filter receipts for this month
    const thisMonthReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate.getMonth() === now.getMonth() && 
             receiptDate.getFullYear() === now.getFullYear();
    });
    
    // Tạo mảng tên tuần theo format "Tuần 1", "Tuần 2", v.v.
    const weekLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5'];
    
    // Khởi tạo dữ liệu với tất cả các tuần trong tháng (luôn hiển thị đủ 4-5 tuần)
    const weeklyData = {};
    weekLabels.forEach(week => {
      weeklyData[week] = 0;
    });
    
    // Tính số ngày trong tháng hiện tại
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Kiểm tra xem tháng hiện tại có tuần thứ 5 không
    const hasWeek5 = daysInMonth > 28;
    
    thisMonthReceipts.forEach(receipt => {
      const receiptDate = new Date(receipt.date);
      // Xác định ngày trong tháng
      const day = receiptDate.getDate();
      
      // Phân chia theo tuần trong tháng
      let weekLabel;
      if (day <= 7) {
        weekLabel = 'Tuần 1';
      } else if (day <= 14) {
        weekLabel = 'Tuần 2';
      } else if (day <= 21) {
        weekLabel = 'Tuần 3';
      } else if (day <= 28) {
        weekLabel = 'Tuần 4';
      } else {
        weekLabel = 'Tuần 5';
      }
      
      weeklyData[weekLabel] = (weeklyData[weekLabel] || 0) + receipt.totalAmount;
    });
    
    // Chuyển đổi thành định dạng mảng cho biểu đồ
    // Nếu tháng không có tuần 5, bỏ tuần 5 khỏi dữ liệu
    const result = weekLabels
      .filter(week => hasWeek5 || week !== 'Tuần 5')
      .map(week => ({
        time: week,
        revenue: weeklyData[week]
      }));
    
    return result;
  };

  // Group receipts by months for the yearly chart
  const groupReceiptsByMonths = (receipts) => {
    const now = new Date();
    // Filter receipts for this year
    const thisYearReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate.getFullYear() === now.getFullYear();
    });
    
    const monthlyData = {};
    
    // Initialize months
    for (let i = 1; i <= 12; i++) {
      monthlyData[`T${i}`] = 0;
    }
    
    thisYearReceipts.forEach(receipt => {
      const receiptDate = new Date(receipt.date);
      const month = receiptDate.getMonth() + 1; // 0-indexed
      const monthKey = `T${month}`;
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + receipt.totalAmount;
    });
    
    // Convert to array format for chart
    return Object.keys(monthlyData).map(month => ({
      time: month,
      revenue: monthlyData[month]
    }));
  };

  // Format number as Vietnamese currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', 'đ');
  };

  // Calculate dynamic Y axis max value
  const getYAxisMaxValue = () => {
    if (!chartData || chartData.length === 0) return 1000000;
    
    const maxRevenue = Math.max(...chartData.map(item => item.revenue));
    return maxRevenue * 1.1; // Max value + 10%
  };

  return (
    <Box 
      mb={6} 
      p={4} 
      borderRadius="lg" 
      boxShadow="sm" 
      height="400px" 
      bg={cardBg}
    >
      <Heading size="md" mb={4}>Biểu đồ doanh thu theo thời gian</Heading>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis 
              domain={[0, getYAxisMaxValue()]}
              tickFormatter={(value) => {
                const billion = 1000000000;
                const million = 1000000;
                const thousand = 1000;
                
                if (value >= billion) {
                  return `${(value / billion).toFixed(1)}tỷ`;
                } else if (value >= million) {
                  return `${(value / million).toFixed(1)}tr`;
                } else if (value >= thousand) {
                  return `${(value / thousand).toFixed(0)}k`;
                }
                return value;
              }} 
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value)} 
              contentStyle={{
                backgroundColor: tooltipBg,
                color: tooltipColor,
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4299E1" 
              strokeWidth={2} 
              name="Doanh thu" 
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Flex height="90%" alignItems="center" justifyContent="center">
          <Text>Không có dữ liệu để hiển thị</Text>
        </Flex>
      )}
    </Box>
  );
};

export default StatisticsChart;