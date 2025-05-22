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
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  VStack,
  Stack,
  useToast,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { usePromotionStore } from "../../store/promotion";

const PromotionModal = ({ isOpen, onClose, promotion, products, onSuccess }) => {
  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    description: "",
    discountPercent: 10,
    startDate: "",
    endDate: "",
    isActive: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { createPromotion, updatePromotion } = usePromotionStore();
  const toast = useToast();

  useEffect(() => {
    if (promotion) {
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      
      setFormData({
        productId: promotion.productId._id,
        title: promotion.title,
        description: promotion.description,
        discountPercent: promotion.discountPercent,
        startDate: startDate.toISOString().slice(0, 16),
        endDate: endDate.toISOString().slice(0, 16),
        isActive: promotion.isActive,
      });
    } else {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      setFormData({
        productId: "",
        title: "",
        description: "",
        discountPercent: 10,
        startDate: now.toISOString().slice(0, 16),
        endDate: tomorrow.toISOString().slice(0, 16),
        isActive: true,
      });
    }
    setErrors({});
  }, [promotion, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productId) newErrors.productId = "Vui lòng chọn sản phẩm";
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }
    
    if (formData.discountPercent < 1 || formData.discountPercent > 90) {
      newErrors.discountPercent = "Phần trăm giảm giá phải từ 1% đến 90%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const promotionData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      const result = promotion 
        ? await updatePromotion(promotion._id, promotionData)
        : await createPromotion(promotionData);
      
      if (result.success) {
        toast({
          title: promotion ? "Cập nhật thành công" : "Tạo thành công",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
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
        description: "Đã xảy ra lỗi khi xử lý khuyến mãi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {promotion ? "Sửa khuyến mãi" : "Tạo khuyến mãi mới"}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={errors.productId}>
              <FormLabel>Sản phẩm <Text as="span" color="red.500">*</Text></FormLabel>
              <Select
                placeholder="Chọn sản phẩm"
                value={formData.productId}
                onChange={(e) => handleInputChange("productId", e.target.value)}
              >
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - {product.price?.toLocaleString('vi-VN')}đ
                  </option>
                ))}
              </Select>
              {errors.productId && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.productId}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={errors.title}>
              <FormLabel>Tiêu đề khuyến mãi <Text as="span" color="red.500">*</Text></FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nhập tiêu đề khuyến mãi"
              />
              {errors.title && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.title}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Mô tả</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Nhập mô tả khuyến mãi"
                rows={3}
              />
            </FormControl>

            <FormControl isInvalid={errors.discountPercent}>
              <FormLabel>Phần trăm giảm giá (%) <Text as="span" color="red.500">*</Text></FormLabel>
              <NumberInput
                value={formData.discountPercent}
                onChange={(value) => handleInputChange("discountPercent", parseInt(value) || 0)}
                min={1}
                max={90}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.discountPercent && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.discountPercent}
                </Text>
              )}
            </FormControl>

            <Stack direction={{ base: "column", md: "row" }} spacing={4}>
              <FormControl isInvalid={errors.startDate} flex="1">
                <FormLabel fontSize="sm">Ngày bắt đầu <Text as="span" color="red.500">*</Text></FormLabel>
                <Input
                  type="datetime-local"
                  size="sm"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
                {errors.startDate && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {errors.startDate}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={errors.endDate} flex="1">
                <FormLabel fontSize="sm">Ngày kết thúc <Text as="span" color="red.500">*</Text></FormLabel>
                <Input
                  type="datetime-local"
                  size="sm"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
                {errors.endDate && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {errors.endDate}
                  </Text>
                )}
              </FormControl>
            </Stack>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="promotion-active" mb="0" flex="1">
                Kích hoạt khuyến mãi
              </FormLabel>
              <Switch
                id="promotion-active"
                isChecked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>

            {Object.keys(errors).length > 0 && (
              <Alert status="error" size="sm">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Vui lòng kiểm tra lại thông tin đã nhập
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText={promotion ? "Đang cập nhật..." : "Đang tạo..."}
          >
            {promotion ? "Cập nhật" : "Tạo khuyến mãi"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PromotionModal;