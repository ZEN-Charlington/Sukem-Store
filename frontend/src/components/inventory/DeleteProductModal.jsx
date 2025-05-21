// components/inventory/DeleteProductModal.jsx
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
} from "@chakra-ui/react";
import { useProductStore } from "../../store/product";
import { formatNumberWithCommas, formatVND } from "../../Utils/FormatUtils";
import { FiAlertTriangle } from "react-icons/fi";

const DeleteProductModal = ({ isOpen, onClose, product }) => {
  // State
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Hooks
  const { deleteProduct } = useProductStore();
  const toast = useToast();

  // Submit form
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const { success, message } = await deleteProduct(product._id);
      
      if (success) {
        onClose();
      } else {
        toast({
          title: "Lỗi",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa sản phẩm",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.500">Xóa sản phẩm</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="start">
            <Alert status="error" variant="left-accent">
              <AlertIcon as={FiAlertTriangle} />
              <VStack align="start" spacing={1}>
                <AlertTitle>Bạn có chắc chắn muốn xóa sản phẩm này?</AlertTitle>
                <AlertDescription>
                  Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống.
                </AlertDescription>
              </VStack>
            </Alert>
            
            <Box p={4} borderWidth="1px" borderRadius="md" width="100%">
              <VStack spacing={2} align="start">
                <HStack>
                  <Text fontWeight="semibold" width="100px">Tên sản phẩm:</Text>
                  <Text>{product.name}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="100px">Giá bán:</Text>
                  <Text>{formatVND(product.price || 0)}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="100px">Giá nhập:</Text>
                  <Text>{formatVND(product.initialPrice || 0)}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="100px">Tồn kho:</Text>
                  <Text>{formatNumberWithCommas(product.storage || 0)}</Text>
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

export default DeleteProductModal;