import { useState, useEffect } from "react";
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

const EditProductModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    initialPrice: "",
    storage: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateProduct } = useProductStore();
  const toast = useToast();
  
  useEffect(() => {
    if (product && isOpen) {
      resetFormData();
    }
  }, [product, isOpen]);

  const resetFormData = () => {
    setFormData({
      name: product.name || "",
      price: product.price ? product.price.toString() : "",
      initialPrice: product.initialPrice ? product.initialPrice.toString() : "",
      storage: product.storage ? product.storage.toString() : "",
      image: product.image || "",
    });
    setErrors({});
  };
  const handleClose = () => {
    // Reset form data khi đóng modal
    resetFormData();
    onClose();
  };

  const handleNumberChange = (e, field) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setFormData({ ...formData, [field]: rawValue });
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

  const getDisplayValue = (field) => {
    if (!formData[field]) return "";
    return formatNumberWithCommas(formData[field]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (!formData.price) {
      newErrors.price = "Giá bán là bắt buộc";
    } else if (parseInt(formData.price) <= 0) {
      newErrors.price = "Giá bán phải lớn hơn 0";
    }
    
    if (!formData.initialPrice) {
      newErrors.initialPrice = "Giá nhập là bắt buộc";
    } else if (parseInt(formData.initialPrice) <= 0) {
      newErrors.initialPrice = "Giá nhập phải lớn hơn 0";
    }
    
    if (!formData.storage && formData.storage !== "0") {
      newErrors.storage = "Số lượng tồn kho là bắt buộc";
    } else if (parseInt(formData.storage) < 0) {
      newErrors.storage = "Số lượng tồn kho không được âm";
    }
    
    if (!formData.image.trim()) {
      newErrors.image = "Đường dẫn hình ảnh là bắt buộc";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedProduct = {
        name: formData.name,
        price: parseInt(formData.price || 0),
        initialPrice: parseInt(formData.initialPrice || 0),
        storage: parseInt(formData.storage || 0),
        image: formData.image,
      };
      
      const { success, message } = await updateProduct(product._id, updatedProduct);
      
      if (success) {
        showSuccess("Đã chỉnh sửa sản phẩm!");
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
        description: "Đã xảy ra lỗi khi cập nhật sản phẩm",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Chỉnh sửa sản phẩm</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={errors.name}>
              <FormLabel>Tên sản phẩm</FormLabel>
              <Input
                placeholder="Nhập tên sản phẩm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              <FormErrorMessage>{errors.image}</FormErrorMessage>
            </FormControl>
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
            Lưu thay đổi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProductModal;