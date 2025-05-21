// components/inventory/CreateProductModal.jsx
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
  InputGroup,
  InputRightElement,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useProductStore } from "../../store/product";
import { formatNumberWithCommas } from "../../Utils/FormatUtils";

const CreateProductModal = ({ isOpen, onClose }) => {
  // State
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    initialPrice: "",
    storage: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks
  const { createProduct } = useProductStore();
  const toast = useToast();

  // Xử lý số
  const handleNumberChange = (e, field) => {
    // Chỉ cho phép nhập số
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setNewProduct({ ...newProduct, [field]: rawValue });
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

  // Hiển thị số đã format - đã sửa lỗi
  const getDisplayValue = (field) => {
    if (!newProduct[field]) return "";
    return formatNumberWithCommas(newProduct[field]);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!newProduct.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (!newProduct.price) {
      newErrors.price = "Giá bán là bắt buộc";
    } else if (parseInt(newProduct.price) <= 0) {
      newErrors.price = "Giá bán phải lớn hơn 0";
    }
    
    if (!newProduct.initialPrice) {
      newErrors.initialPrice = "Giá nhập là bắt buộc";
    } else if (parseInt(newProduct.initialPrice) <= 0) {
      newErrors.initialPrice = "Giá nhập phải lớn hơn 0";
    }
    
    if (!newProduct.storage && newProduct.storage !== "0") {
      newErrors.storage = "Số lượng tồn kho là bắt buộc";
    } else if (parseInt(newProduct.storage) < 0) {
      newErrors.storage = "Số lượng tồn kho không được âm";
    }
    
    if (!newProduct.image.trim()) {
      newErrors.image = "Đường dẫn hình ảnh là bắt buộc";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { success, message } = await createProduct({
        ...newProduct,
        price: parseInt(newProduct.price || 0),
        initialPrice: parseInt(newProduct.initialPrice || 0),
        storage: parseInt(newProduct.storage || 0),
      });
      
      if (success) {
        showSuccess("Đã thêm mới sản phẩm!");
        resetForm();
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
        description: "Đã xảy ra lỗi khi tạo sản phẩm",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      initialPrice: "",
      storage: "",
      image: "",
    });
    setErrors({});
  };

  // Hủy và đóng modal
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Thêm sản phẩm mới</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={errors.name}>
              <FormLabel>Tên sản phẩm</FormLabel>
              <Input
                placeholder="Nhập tên sản phẩm"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={errors.price}>
              <FormLabel>Giá bán</FormLabel>
              <InputGroup>
                <Input
                  placeholder="Nhập giá bán"
                  value={getDisplayValue("price")}
                  onChange={(e) => handleNumberChange(e, "price")}
                />
                <InputRightElement pointerEvents="none" children="đ" />
              </InputGroup>
              <FormErrorMessage>{errors.price}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={errors.initialPrice}>
              <FormLabel>Giá nhập</FormLabel>
              <InputGroup>
                <Input
                  placeholder="Nhập giá nhập"
                  value={getDisplayValue("initialPrice")}
                  onChange={(e) => handleNumberChange(e, "initialPrice")}
                />
                <InputRightElement pointerEvents="none" children="đ" />
              </InputGroup>
              <FormErrorMessage>{errors.initialPrice}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={errors.storage}>
              <FormLabel>Số lượng tồn kho</FormLabel>
              <Input
                placeholder="Nhập số lượng tồn kho"
                value={getDisplayValue("storage")}
                onChange={(e) => handleNumberChange(e, "storage")}
              />
              <FormErrorMessage>{errors.storage}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={errors.image}>
              <FormLabel>Hình ảnh</FormLabel>
              <Input
                placeholder="Nhập đường dẫn hình ảnh"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              />
              <FormErrorMessage>{errors.image}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleCancel}>
            Hủy
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Tạo sản phẩm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateProductModal;