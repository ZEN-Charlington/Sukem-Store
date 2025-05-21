// components/inventory/AddStockModal.jsx
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
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  FormErrorMessage,
  Box,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { useProductStore } from "../../store/product";
import { formatNumberWithCommas } from "../../Utils/FormatUtils";

const AddStockModal = ({ isOpen, onClose, product }) => {
  // State
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks
  const { updateStorage } = useProductStore();
  const toast = useToast();

  // Xử lý số
  const handleQuantityChange = (e) => {
    // Chỉ cho phép nhập số
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setQuantity(rawValue);
    setError("");
  };

  const showSuccess = (message) => {
    toast({
      title: "Thành công",
      description: message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Hiển thị số đã format
  const getDisplayQuantity = () => {
    if (!quantity) return "";
    return formatNumberWithCommas(quantity);
  };

  // Tính toán số lượng sau khi nhập - đã sửa lỗi
  const getNewTotal = () => {
    if (!product) return 0;
    
    // Đảm bảo product.storage và quantity đều là số
    const currentStorage = parseInt(product.storage || 0);
    const addQuantity = parseInt(quantity || 0);
    
    return currentStorage + addQuantity;
  };

  // Validate form
  const validateForm = () => {
    if (!quantity) {
      setError("Số lượng nhập thêm là bắt buộc");
      return false;
    }
    
    if (parseInt(quantity) <= 0) {
      setError("Số lượng nhập thêm phải lớn hơn 0");
      return false;
    }
    
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Chỉ gửi lên một số nguyên dương
      const parsedQuantity = parseInt(quantity || "0");
      if (parsedQuantity <= 0) {
        setError("Số lượng nhập thêm phải lớn hơn 0");
        setIsSubmitting(false);
        return;
      }
      
      const { success, message } = await updateStorage(product._id, parsedQuantity);
      
      if (success) {
        showSuccess("Đã nhập thêm hàng!");
        setQuantity("");
        onClose();
      } else {
        toast({
          title: "Lỗi",
          description: message || "Cập nhật không thành công",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi cập nhật số lượng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form khi đóng modal
  const handleClose = () => {
    setQuantity("");
    setError("");
    onClose();
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Nhập thêm hàng</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box p={3} borderWidth="1px" borderRadius="md">
              <VStack spacing={2} align="start">
                <HStack>
                  <Text fontWeight="semibold" width="120px">Tên sản phẩm:</Text>
                  <Text>{product.name}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="120px">Tồn kho hiện tại:</Text>
                  <Text>{formatNumberWithCommas(product.storage || 0)}</Text>
                </HStack>
              </VStack>
            </Box>
            
            <Divider />
            
            <FormControl isRequired isInvalid={!!error}>
              <FormLabel>Số lượng nhập thêm</FormLabel>
              <Input
                placeholder="Nhập số lượng"
                value={getDisplayQuantity()}
                onChange={handleQuantityChange}
              />
              <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
            
            <Box p={3} borderWidth="1px" borderRadius="md" bg={useColorModeValue("blue.50", "blue.900")}>
              <HStack>
                <Text fontWeight="semibold" width="120px">Tồn kho mới:</Text>
                <Text fontWeight="bold">{formatNumberWithCommas(getNewTotal())}</Text>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Hủy
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Cập nhật số lượng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddStockModal;