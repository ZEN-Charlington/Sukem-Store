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
  Image,
  Badge,
} from "@chakra-ui/react";
import { usePromotionStore } from "../../store/promotion";
import { formatVND } from "../../Utils/FormatUtils";
import { FiAlertTriangle } from "react-icons/fi";

const DeletePromotionModal = ({ isOpen, onClose, promotion }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePromotion } = usePromotionStore();
  const toast = useToast();

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deletePromotion(promotion._id);
      
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
        description: "Đã xảy ra lỗi khi xóa khuyến mãi",
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

  if (!promotion) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.500">Xóa khuyến mãi</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="start">
            <Alert status="error" variant="left-accent">
              <AlertIcon as={FiAlertTriangle} />
              <VStack align="start" spacing={1}>
                <AlertTitle>Bạn có chắc chắn muốn xóa khuyến mãi này?</AlertTitle>
                <AlertDescription>
                  Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn khuyến mãi khỏi hệ thống.
                </AlertDescription>
              </VStack>
            </Alert>
            
            <Box p={4} borderWidth="1px" borderRadius="md" width="100%">
              <VStack spacing={3} align="start">
                <HStack>
                  <Image
                    src={promotion.productId?.image}
                    fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif"
                    alt={promotion.productId?.name}
                    boxSize="50px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{promotion.productId?.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatVND(promotion.productId?.price)}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="100px">Tiêu đề:</Text>
                  <Text>{promotion.title}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="100px">Giảm giá:</Text>
                  <Badge colorScheme="orange" variant="solid">
                    -{promotion.discountPercent}%
                  </Badge>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="100px">Thời gian:</Text>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack>
                  <Text fontWeight="semibold" width="100px">Mô tả:</Text>
                  <Text fontSize="sm">{promotion.description}</Text>
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

export default DeletePromotionModal;