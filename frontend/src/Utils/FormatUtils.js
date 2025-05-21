// Utils/FormatUtils.js

/**
 * Format số thành định dạng tiền VNĐ
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} - Chuỗi đã định dạng theo tiền VNĐ
 */
export const formatVND = (amount) => {
  // Xử lý giá trị không hợp lệ
  if (amount === undefined || amount === null) return "0 đ";
  
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format số với dấu chấm phân cách hàng nghìn (định dạng Việt Nam)
 * @param {number|string} number - Số cần định dạng
 * @returns {string} - Chuỗi đã định dạng với dấu chấm phân cách
 */
export const formatNumberWithCommas = (number) => {
  // Xử lý giá trị không hợp lệ
  if (number === undefined || number === null) return "0";
  
  // Chuyển về string để xử lý an toàn
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Format số với dấu phẩy phân cách hàng nghìn (định dạng quốc tế)
 * @param {number|string} value - Giá trị cần format
 * @return {string} - Chuỗi đã format
 */
export const formatNumberWithInternationalCommas = (value) => {
  // Kiểm tra giá trị null hoặc undefined
  if (value === undefined || value === null) return "0";
  
  // Chuyển về string trước khi thao tác
  const valueStr = String(value);
  
  // Tách thành parts dựa vào dấu thập phân (nếu có)
  const parts = valueStr.split('.');
  
  // Format phần nguyên với dấu phẩy
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Nối lại với phần thập phân (nếu có)
  return parts.join('.');
};