import axios from 'axios';

const VIETQR_API_KEY = "756e00ff-a2e5-410b-a437-0bd6ecaca476";
const VIETQR_CLIENT_ID = "5fa0c829-1c36-43ca-98c3-2e9b70f14287";

/**
 * Tạo QR chuyển khoản sử dụng VietQR API
 * @param {Object} params - Thông tin thanh toán
 * @param {number} params.amount - Số tiền thanh toán
 * @param {string} params.invoiceNumber - Mã hóa đơn 
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const generateBankQR = async (params) => {
  const { amount, invoiceNumber } = params;
  
  try {
    const bankInfo = {
      accountNo: "1030979625",
      accountName: "LAM TIEU MINH",
      acqId: 970436,
      amount: amount,
      addInfo: `Thanh toan hoa don Sukem Store`,
      format: "text",
      template: "compact"
    };
    
    const response = await axios.post(
      'https://api.vietqr.io/v2/generate', 
      bankInfo,
      {
        headers: {
          'x-api-key': VIETQR_API_KEY,
          'x-client-id': VIETQR_CLIENT_ID,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } else {
      return {
        success: false,
        data: null,
        error: 'Không nhận được dữ liệu QR'
      };
    }
  } catch (error) {
    console.error("Lỗi khi tạo mã QR:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || 'Không thể kết nối đến dịch vụ QR'
    };
  }
};

/**
 * Lấy thông tin chuyển khoản để hiển thị
 * @returns {Object} - Thông tin ngân hàng
 */
export const getBankInfo = () => {
  return {
    bankName: "Vietcombank",
    accountName: "LAM TIEU MINH",
    accountNumber: "1030979625"
  };
};