import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Image,
  Box,
  Text,
  VStack,
  Flex,
  Spinner,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { generateBankQR, getBankInfo } from "../../Utils/BankUtils";

const QrPayment = ({ isOpen, onClose, cart, onCompletePayment }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const bankInfo = getBankInfo();

  const bgContent = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgInfo = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (isOpen && cart) {
      loadQRCode();
    }
  }, [isOpen, cart]);

  // Nếu cart không tồn tại, không render gì cả
  if (!cart) {
    return null;
  }

  const loadQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Thêm null check cho cart.totalAmount
      const amount = cart?.totalAmount || 0;
      const invoiceNumber = cart?.invoiceNumber || "unknown";
      
      const result = await generateBankQR({
        amount: amount,
        invoiceNumber: invoiceNumber
      });

      if (result.success) {
        setQrData(result.data);
      } else {
        setError(result.error || "Không thể tạo mã QR thanh toán");
      }
    } catch (e) {
      setError("Đã xảy ra lỗi khi kết nối tới dịch vụ QR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePayment = () => {
    if (onCompletePayment) {
      onCompletePayment();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgContent}>
        <ModalHeader>Thanh toán chuyển khoản</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Box textAlign="center" py={4} color="red.500">
              <Text>{error}</Text>
              <Button mt={4} colorScheme="blue" onClick={loadQRCode}>
                Thử lại
              </Button>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {qrData?.qrDataURL && (
                <Box textAlign="center">
                  <Image
                    src={qrData.qrDataURL}
                    alt="QR Code"
                    boxSize="250px"
                    objectFit="contain"
                    mx="auto"
                  />
                </Box>
              )}

              <Box p={4} bg={bgInfo} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                <VStack spacing={3} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">Ngân hàng:</Text>
                    <Text>{bankInfo.bankName}</Text>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">Chủ tài khoản:</Text>
                    <Text>{bankInfo.accountName}</Text>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">Số tài khoản:</Text>
                    <Text>{bankInfo.accountNumber}</Text>
                  </Flex>

                  <Divider />

                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">Số tiền:</Text>
                    <Text fontWeight="bold">
                      {(cart?.totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">Nội dung: </Text>
                    <Text fontSize="sm">Thanh toán hóa đơn Sukem Store </Text>
                  </Flex>
                </VStack>
              </Box>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Quét mã QR hoặc chuyển khoản thủ công với thông tin trên
              </Text>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleCompletePayment}>
            Xác nhận đã thanh toán
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QrPayment;