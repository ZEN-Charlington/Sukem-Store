// utils/DateTimeUtils.js

/**
 * Định dạng ngày giờ theo kiểu Việt Nam
 * @param {Date|string|number} dateInput - Ngày cần định dạng (Date object, ISO string hoặc timestamp)
 * @param {boolean} includeTime - Có hiển thị giờ phút hay không
 * @returns {string} - Chuỗi ngày giờ đã định dạng
 */
export const formatDateTime = (dateInput, includeTime = true) => {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    
    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) return '';
    
    // Định dạng ngày theo DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let result = `${day}/${month}/${year}`;
    
    // Thêm giờ phút nếu cần
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      result += ` ${hours}:${minutes}`;
    }
    
    return result;
  };
  
  /**
   * Tính khoảng thời gian tương đối (vd: "2 phút trước")
   * @param {Date|string|number} dateInput - Ngày cần tính
   * @returns {string} - Chuỗi thời gian tương đối
   */
  export const getRelativeTime = (dateInput) => {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Các khoảng thời gian
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    
    // Xác định khoảng thời gian phù hợp
    if (diffInSeconds < minute) {
      return 'Vừa xong';
    } else if (diffInSeconds < hour) {
      const minutes = Math.floor(diffInSeconds / minute);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < day) {
      const hours = Math.floor(diffInSeconds / hour);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < week) {
      const days = Math.floor(diffInSeconds / day);
      return `${days} ngày trước`;
    } else if (diffInSeconds < month) {
      const weeks = Math.floor(diffInSeconds / week);
      return `${weeks} tuần trước`;
    } else if (diffInSeconds < year) {
      const months = Math.floor(diffInSeconds / month);
      return `${months} tháng trước`;
    } else {
      const years = Math.floor(diffInSeconds / year);
      return `${years} năm trước`;
    }
  };
  
  /**
   * Chuyển đổi ngày thành định dạng hiển thị thân thiện
   * @param {Date|string|number} dateInput - Ngày cần định dạng
   * @returns {string} - Chuỗi ngày đã định dạng (VD: "Hôm nay", "Hôm qua", "24/05/2024")
   */
  export const getFriendlyDate = (dateInput) => {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    const today = new Date();
    
    // Đặt giờ phút giây về 0 để so sánh ngày
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(todayOnly);
    yesterdayOnly.setDate(todayOnly.getDate() - 1);
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hôm nay';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Hôm qua';
    } else {
      return formatDateTime(date, false);
    }
  };
  
  /**
   * Tạo chuỗi định dạng cho thời gian chi tiết
   * @param {Date|string|number} dateInput - Ngày cần định dạng
   * @returns {string} - Chuỗi thời gian chi tiết (VD: "Thứ 2, 24/05/2024 15:30")
   */
  export const getDetailedDateTime = (dateInput) => {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    
    // Mảng thứ trong tuần
    const weekdays = [
      'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 
      'Thứ 5', 'Thứ 6', 'Thứ 7'
    ];
    
    const weekday = weekdays[date.getDay()];
    const formattedDate = formatDateTime(date, true);
    
    return `${weekday}, ${formattedDate}`;
  };
  
  /**
   * Hàm tạo ngày trong tương lai hoặc quá khứ
   * @param {number} days - Số ngày (dương: tương lai, âm: quá khứ)
   * @returns {Date} - Đối tượng Date mới
   */
  export const getDateWithOffset = (days = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };