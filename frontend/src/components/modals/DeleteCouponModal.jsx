import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
} from "@chakra-ui/react";
import { useCouponStore } from "../../store/coupon";
import { formatVND } from "../../Utils/FormatUtils";
import { FiAlertTriangle } from "react-icons/fi";

const DeleteCouponModal = ({ isOpen, onClose, coupon }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteCoupon } = useCouponStore();
  const toast = useToast();

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteCoupon(coupon._id);
      
      if (result.success) {
        toast({
          title: "Xóa thành công",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa coupon",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!coupon) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.500">Xóa coupon</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="start">
            <Alert status="error" variant="left-accent">
              <AlertIcon as={FiAlertTriangle} />
              <VStack align="start" spacing={1}>
                <AlertTitle>Bạn có chắc chắn muốn xóa coupon này?</AlertTitle>
                <AlertDescription>
                  Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn coupon khỏi hệ thống.
                </AlertDescription>
              </VStack>
            </Alert>
            
            <Box p={4} borderWidth="1px" borderRadius="md" width="100%">
              <VStack spacing={3} align="start">
                <HStack>
                  <Text fontWeight="semibold" width="120px">Mã coupon:</Text>
                  <Text fontFamily="mono" fontWeight="bold" fontSize="lg">
                    {coupon.code}
                  </Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="120px">Giảm giá:</Text>
                  <Badge colorScheme="green" variant="solid">
                    -{coupon.discountPercent}%
                  </Badge>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="120px">Hóa đơn gốc:</Text>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">
                      {coupon.createdFromInvoice?.invoiceNumber}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatVND(coupon.createdFromInvoice?.totalAmount)}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="120px">Hạn sử dụng:</Text>
                  <Text fontSize="sm">
                    {formatDate(coupon.expiryDate)}
                  </Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="120px">Trạng thái:</Text>
                  <Badge colorScheme={coupon.isUsed ? "gray" : "green"}>
                    {coupon.isUsed ? "Đã sử dụng" : "Còn hiệu lực"}
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            colorScheme="red"
            onClick={handleConfirmDelete}
            isLoading={isDeleting}
          >
            Xác nhận xóa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteCouponModal;