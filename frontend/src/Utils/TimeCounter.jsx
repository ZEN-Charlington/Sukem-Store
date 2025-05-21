// utils/TimeCounter.jsx
import { useState, useEffect, useRef, memo } from "react";
import { Text } from "@chakra-ui/react";

// Hook quản lý đồng hồ đếm ngược cho hóa đơn
export const useTimeCounter = (initialMinutes = 15, onTimeout) => {
  // Lưu trữ các bộ đếm đang hoạt động
  const timers = useRef({});
  // Lưu trữ thông tin thời gian còn lại
  const remainingTime = useRef({});
  // Lưu state cho việc re-render
  const [timerTick, setTimerTick] = useState(0);

  // Bắt đầu đếm ngược cho một hóa đơn cụ thể
  const startTimer = (invoiceId) => {
    // Nếu timer đã tồn tại, không tạo mới
    if (timers.current[invoiceId]) {
      return;
    }

    // Thời gian kết thúc = thời gian hiện tại + số phút đếm ngược
    const endTime = Date.now() + initialMinutes * 60 * 1000;
    remainingTime.current[invoiceId] = {
      minutes: initialMinutes,
      seconds: 0,
      endTime
    };

    // Tạo interval để cập nhật thời gian mỗi giây
    timers.current[invoiceId] = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, endTime - now);

      if (timeLeft === 0) {
        // Nếu hết thời gian, dừng timer và gọi callback
        clearInterval(timers.current[invoiceId]);
        delete timers.current[invoiceId];
        delete remainingTime.current[invoiceId];
        
        if (onTimeout) {
          onTimeout(invoiceId);
        }
      } else {
        // Cập nhật thời gian còn lại
        const minutes = Math.floor(timeLeft / (60 * 1000));
        const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
        
        remainingTime.current[invoiceId] = {
          minutes,
          seconds,
          endTime
        };
        
        // Trigger re-render
        setTimerTick(prev => prev + 1);
      }
    }, 1000);
  };
  
  // Dừng đếm ngược cho một hóa đơn
  const stopTimer = (invoiceId) => {
    if (timers.current[invoiceId]) {
      clearInterval(timers.current[invoiceId]);
      delete timers.current[invoiceId];
      delete remainingTime.current[invoiceId];
    }
  };
  
  // Lấy thời gian còn lại của một hóa đơn
  const getRemainingTime = (invoiceId) => {
    return remainingTime.current[invoiceId];
  };
  
  // Dọn dẹp tất cả timers khi component unmount
  useEffect(() => {
    return () => {
      Object.keys(timers.current).forEach(id => {
        clearInterval(timers.current[id]);
      });
      timers.current = {};
      remainingTime.current = {};
    };
  }, []);
  
  return {
    startTimer,
    stopTimer,
    getRemainingTime
  };
};

// Component hiển thị thời gian còn lại
export const TimeDisplay = memo(({ invoiceId, getRemainingTime }) => {
  const [, forceUpdate] = useState(0);
  
  // Cập nhật UI mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const time = getRemainingTime(invoiceId);
  
  if (!time) return null;
  
  const { minutes, seconds } = time;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  const color = minutes < 1 ? "red.500" : minutes < 5 ? "orange.500" : "green.500";
  
  return (
    <Text fontSize="xs" color={color} fontWeight="medium">
      {formattedTime}
    </Text>
  );
});

export default useTimeCounter;