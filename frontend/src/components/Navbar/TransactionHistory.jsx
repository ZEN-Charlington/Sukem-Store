// components/NavBar/TransactionHistory.jsx
import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Alert, AlertIcon, Box, Text, Badge, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { useReceiptStore } from '../../store/receipt'; 
import { useAuthStore } from '../../store/user';
import { formatDateTime } from '../../utils/DateTimeUtils';
import { formatVND } from '../../Utils/FormatUtils';

const TransactionHistory = ({ isOpen, onClose }) => {
  const { receipts, fetchReceipts } = useReceiptStore();
  const { hasPermission } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const noteBgColor = useColorModeValue('gray.50', 'gray.700');

  // Không cần kiểm tra quyền để xem lịch sử giao dịch - cả worker và manager đều có thể xem
  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    }
  }, [isOpen]);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchReceipts();
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu hóa đơn");
      console.error("Error loading invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sắp xếp hóa đơn theo thời gian giảm dần (mới nhất lên đầu)
  const sortedReceipts = React.useMemo(() => {
    if (!receipts || receipts.length === 0) return [];
    return [...receipts].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [receipts]);

  // Hiển thị danh sách sản phẩm và ghi chú
  const renderProducts = (products, note) => {
    if (!products || products.length === 0) return "Không có sản phẩm";
    
    return (
      <Box width="100%" style={{ minWidth: "300px" }}>
        <Accordion allowToggle allowMultiple={false}>
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Xem {products.length} sản phẩm và ghi chú</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel p={2} transition="height 0.3s ease-in-out, opacity 0.3s ease-in-out">
              <Box overflowX="auto">
                <Table size="sm" variant="simple" layout="fixed" width="100%">
                  <Thead>
                    <Tr>
                      <Th width="32%">Tên SP</Th>
                      <Th width="23%" isNumeric>Giá</Th>
                      <Th width="20%" isNumeric>SL</Th>
                      <Th width="25%" isNumeric>Tg.tiền</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((product, idx) => (
                      <Tr key={idx}>
                        <Td width="40%" style={{ wordBreak: "break-word" }}>{product.productName}</Td>
                        <Td width="20%" isNumeric style={{ whiteSpace: "nowrap" }}>{formatVND(product.price)}</Td>
                        <Td width="15%" isNumeric>{product.quantity}</Td>
                        <Td width="25%" isNumeric style={{ whiteSpace: "nowrap" }}>{formatVND(product.total)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                
                {/* Hiển thị ghi chú */}
                {note && (
                  <Box mt={3} p={2} bg={noteBgColor} borderRadius="md">
                    <Text fontWeight="medium" mb={1}>Ghi chú:</Text>
                    <Text>{note}</Text>
                  </Box>
                )}
              </Box>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    );
  };

  // Hiển thị badge cho phương thức thanh toán
  const getPaymentMethodBadge = (method) => {
    let colorScheme;
    switch (method) {
      case "Tiền mặt":
        colorScheme = "green";
        break;
      case "Chuyển khoản":
        colorScheme = "blue";
        break;
      case "Thẻ tín dụng":
        colorScheme = "purple";
        break;
      default:
        colorScheme = "gray";
    }
    return <Badge colorScheme={colorScheme}>{method}</Badge>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="90%">
        <ModalHeader textAlign="center">Lịch sử giao dịch</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
            </Box>
          ) : error ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" colorScheme="blue" size="md" layout="fixed" style={{ tableLayout: "fixed" }}>
                <Thead>
                  <Tr>
                    <Th width="12%">Mã H.Đơn</Th>
                    <Th width="15%">Thời gian</Th>
                    <Th width="15%">Người tạo</Th>
                    <Th width="12%">Phương thức</Th>
                    <Th width="12%" isNumeric style={{ whiteSpace: "nowrap" }}>Tổng tiền</Th>
                    <Th width="34%">Sản phẩm</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedReceipts && sortedReceipts.length > 0 ? (
                    sortedReceipts.map((receipt) => (
                      <Tr key={receipt._id}>
                        <Td fontWeight="medium">{receipt.invoiceNumber}</Td>
                        <Td>{formatDateTime(receipt.date)}</Td>
                        <Td>
                          {receipt.userId?.name || receipt.userId?.email || receipt.userId || "N/A"}
                        </Td>
                        <Td>{getPaymentMethodBadge(receipt.paymentMethod)}</Td>
                        <Td isNumeric fontWeight="bold" style={{ whiteSpace: "nowrap" }}>
                          {formatVND(receipt.totalAmount)}
                        </Td>
                        <Td width="300px">{renderProducts(receipt.products, receipt.note)}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={6} textAlign="center">
                        Không có hóa đơn nào.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TransactionHistory;