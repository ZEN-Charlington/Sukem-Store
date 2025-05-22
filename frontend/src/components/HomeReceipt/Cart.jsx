import {
  Box, VStack, HStack, Text, Table, Thead, Tbody, Tr, Th, Td, IconButton, Icon, Tooltip, Spacer, Badge, useToast
} from "@chakra-ui/react";
import { FaShoppingCart, FaReceipt, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { forwardRef, useRef } from "react";
import { formatVND } from '../../Utils/FormatUtils';

const Cart = forwardRef(({ 
  cart, 
  increaseQuantity, 
  decreaseQuantity, 
  removeItem,
  bgHover,
  textColor,
  productStorage 
}, ref) => {
  const updateTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const toast = useToast();
  
  const handleRemoveItem = (index) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      removeItem(index);
      isUpdatingRef.current = false;
    }, 10);
  };
  
  const getStorageInfo = (productId) => {
    if (!productStorage || productStorage[productId] === undefined) {
      return 5;
    }
    return Number(productStorage[productId]);
  };
  
  const handleIncreaseQuantity = (index) => {
    const item = cart.items[index];
    const storage = getStorageInfo(item.productId);
    const quantity = Number(item.quantity);
    
    if ((storage > 0 && quantity >= storage) || quantity >= 100) {
      toast({
        title: "Không thể tăng số lượng",
        description: `Số lượng đã đạt giới hạn ${storage > 0 ? `tồn kho (${storage})` : '100'}`,
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    increaseQuantity(index);
  };

  const getItemTotal = (price, quantity) => {
    return Number(price) * Number(quantity);
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack>
        <Icon as={FaShoppingCart} />
        <Text fontWeight="bold" fontSize="lg" color={textColor}>
          Hóa đơn #{cart.id}
        </Text>
        <Spacer />
      </HStack>
      
      <Box overflowY="auto" maxHeight="400px" overflowX="hidden">
        <Table size="sm" variant="simple" layout="fixed" width="100%">
          <Thead>
            <Tr>
              <Th width="35%">Sản phẩm</Th>
              <Th isNumeric width="20%">Số lượng</Th>
              <Th isNumeric width="15%" whiteSpace="nowrap">Đơn giá</Th>
              <Th isNumeric width="20%" whiteSpace="nowrap">Thành tiền</Th>
              <Th width="10%"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {cart.items.map((item, index) => {
              const storage = getStorageInfo(item.productId);
              const quantity = Number(item.quantity);
              const isLowStock = storage > 0 && storage <= 10;
              const isOutOfStock = storage <= 0;
              const isMaxQuantity = 
                (storage > 0 && quantity >= storage) || 
                quantity >= 100;
              
              const itemTotal = getItemTotal(item.price, quantity);
              
              return (
                <Tr key={`${item.productId}-${index}`}>
                  <Td maxWidth="200px">
                    <VStack spacing={1} align="start" transition="none">
                      <Text noOfLines={2} wordBreak="break-word">
                        {item.productName}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color={isLowStock || isOutOfStock ? "red.500" : "gray.500"}
                      >
                        Tồn kho: {storage}  
                        {isLowStock && !isOutOfStock && " (Sắp hết)"}
                        {isOutOfStock && " (Hết hàng)"}
                      </Text>
                    </VStack>
                  </Td>
                  <Td isNumeric>
                    <HStack spacing={1} justifyContent="flex-end">
                      <IconButton
                        icon={<FaMinus />}
                        size="xs"
                        aria-label="Giảm số lượng"
                        onClick={() => decreaseQuantity(index)}
                        isDisabled={quantity <= 1}
                      />
                      <Text px={1} minWidth="20px" textAlign="center">{quantity}</Text>
                      <Box>
                        <IconButton
                          icon={<FaPlus />}
                          size="xs"
                          aria-label="Tăng số lượng"
                          onClick={() => handleIncreaseQuantity(index)}
                          isDisabled={isMaxQuantity}
                        />
                      </Box>
                    </HStack>
                  </Td>
                  <Td isNumeric whiteSpace="nowrap">
                    {item.hasPromotion ? (
                      <VStack spacing={0} align="end">
                        <Text color="red.500" fontWeight="bold">{formatVND(item.price)}</Text>
                        <Text fontSize="xs" color="gray.500" textDecoration="line-through">
                          {formatVND(item.originalPrice)}
                        </Text>
                      </VStack>
                    ) : (
                      formatVND(item.price)
                    )}
                  </Td>
                  <Td isNumeric whiteSpace="nowrap">{formatVND(itemTotal)}</Td>
                  <Td>
                    <Tooltip label="Xóa sản phẩm" hasArrow>
                      <IconButton
                        icon={<FaTrash />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        aria-label="Xóa sản phẩm"
                        onClick={() => handleRemoveItem(index)}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      
      {cart.items.length === 0 && (
        <Box textAlign="center" py={8}>
          <Icon as={FaReceipt} fontSize="4xl" color="gray.300" />
          <Text color="gray.500" mt={2}>Hiện chưa có sản phẩm nào</Text>
        </Box>
      )}

      <HStack justify="space-between">
        <Text fontWeight="bold">Tổng cộng:</Text>
        <Text fontWeight="bold">{formatVND(cart.totalAmount || 0)}</Text>
      </HStack>

      {cart.note && (
        <Box 
          p={2} 
          bg={bgHover} 
          borderRadius="md" 
          borderLeft="4px solid" 
          borderColor="yellow.400"
        >
          <Text fontSize="sm" fontStyle="italic">Ghi chú: {cart.note}</Text>
        </Box>
      )}
    </VStack>
  );
});

export default Cart;