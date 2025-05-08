
/**
 * Format số thành định dạng tiền VNĐ
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} - Chuỗi đã định dạng theo tiền VNĐ
 */
export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  /**
   * Format số với dấu chấm phân cách hàng nghìn
   * @param {number} number - Số cần định dạng
   * @returns {string} - Chuỗi đã định dạng với dấu chấm phân cách
   */
  export const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };