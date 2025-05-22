import {
  Box, HStack, VStack, Input, Button, Text, Badge, Alert, AlertIcon, AlertDescription, useToast, Collapse, Icon, Divider, useColorModeValue
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTag, FaTimes, FaPercent } from "react-icons/fa";
import { useCouponStore } from "../../store/coupon";
import { formatVND } from "../../Utils/FormatUtils";

const CouponInput = ({ 
  totalAmount, 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon,
  textColor
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const { applyCoupon } = useCouponStore();
  const toast = useToast();

  const responsiveTextColor = useColorModeValue("gray.600", "gray.300");
  const successBg = useColorModeValue("green.100", "green.900");
  const successTextColor = useColorModeValue("green.600", "green.300");
  const successBorderColor = useColorModeValue("green.400", "green.500");
  const percentIconColor = useColorModeValue("green.600", "green.300");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã coupon");
      return;
    }

    setIsLoading(true);
    setCouponError("");

    try {
      const result = await applyCoupon(couponCode.toUpperCase(), totalAmount);
      
      if (result.success) {
        onCouponApplied(result.data);
        setCouponCode("");
        toast({
          title: "Áp dụng mã giảm giá thành công",
          description: `Giảm ${result.data.coupon.discountPercent}% - Tiết kiệm ${formatVND(result.data.discountAmount)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setCouponError(result.message);
      }
    } catch (error) {
      setCouponError("Có lỗi xảy ra khi áp dụng mã giảm giá");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponError("");
    toast({
      title: "Đã hủy mã giảm giá",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Divider my={3} />
      <VStack spacing={3} align="stretch">
        <HStack>
          <Icon as={FaTag} color="orange.500" />
          <Text fontWeight="semibold" color={textColor}>Mã giảm giá</Text>
        </HStack>

        {!appliedCoupon ? (
          <VStack spacing={2} align="stretch">
            <HStack>
              <Input
                placeholder="Nhập mã giảm giá (8 ký tự)"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                maxLength={8}
                size="sm"
                isDisabled={isLoading}
                textTransform="uppercase"
              />
              <Button
                onClick={handleApplyCoupon}
                isLoading={isLoading}
                loadingText="Kiểm tra"
                colorScheme="orange"
                size="sm"
                minW="80px"
                isDisabled={!couponCode.trim() || totalAmount <= 0}
              >
                Áp dụng
              </Button>
            </HStack>

            <Collapse in={!!couponError}>
              <Alert status="error" size="sm" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">{couponError}</AlertDescription>
              </Alert>
            </Collapse>
          </VStack>
        ) : (
          <VStack spacing={2} align="stretch">
            <Box 
              p={3} 
              bg={successBg} 
              borderRadius="md" 
              borderLeft="4px solid" 
              borderColor={successBorderColor}
            >
              <HStack justify="space-between" align="start">
                <VStack spacing={1} align="start" flex={1}>
                  <HStack>
                    <Badge colorScheme="green" variant="solid">
                      {appliedCoupon.coupon.code}
                    </Badge>
                    <HStack spacing={1}>
                      <Icon as={FaPercent} boxSize="12px" color={percentIconColor} />
                      <Text fontSize="sm" fontWeight="bold" color={successTextColor}>
                        -{appliedCoupon.coupon.discountPercent}%
                      </Text>
                    </HStack>
                  </HStack>
                  <VStack spacing={1} align="start">
                    <Text fontSize="md" color={responsiveTextColor}>
                      Tiết kiệm: {formatVND(Math.round(totalAmount * (appliedCoupon.coupon.discountPercent / 100)))}
                    </Text>
                  </VStack>
                </VStack>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={handleRemoveCoupon}
                  aria-label="Hủy mã giảm giá"
                  leftIcon={<FaTimes />}
                >
                  Hủy
                </Button>
              </HStack>
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default CouponInput;