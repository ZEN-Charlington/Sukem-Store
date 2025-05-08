import { 
    Box,
    VStack,
    HStack, 
    Text, 
    Table, 
    Thead, 
    Tbody, 
    Tr, 
    Th, 
    Td,
    IconButton,
    Icon,
    Tooltip,
    Spacer
  } from "@chakra-ui/react";
  import { FaShoppingCart, FaReceipt, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
  import { forwardRef, useRef } from "react";
  import { formatVND} from '../../Utils/FormatUtils';
  const Cart = forwardRef(({ 
    cart, 
    increaseQuantity, 
    decreaseQuantity, 
    removeItem,
    bgHover,
    textColor
  }, ref) => {
    const updateTimeoutRef = useRef(null);
    const isUpdatingRef = useRef(false);
  
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
              {cart.items.map((item, index) => (
                <Tr key={`${item.productId}-${index}`}>
                  <Td maxWidth="200px">
                    <Text noOfLines={2} wordBreak="break-word">
                      {item.productName}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <HStack spacing={1} justifyContent="flex-end">
                      <IconButton
                        icon={<FaMinus />}
                        size="xs"
                        aria-label="Giảm số lượng"
                        onClick={() => decreaseQuantity(index)}
                      />
                      <Text px={1} minWidth="20px" textAlign="center">{item.quantity}</Text>
                      <IconButton
                        icon={<FaPlus />}
                        size="xs"
                        aria-label="Tăng số lượng"
                        onClick={() => increaseQuantity(index)}
                      />
                    </HStack>
                  </Td>
                  <Td isNumeric whiteSpace="nowrap">{formatVND(item.price)}</Td>
                  <Td isNumeric whiteSpace="nowrap">{formatVND(item.total)}</Td>
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
              ))}
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
          <Text fontWeight="bold">{formatVND(cart.totalAmount)}</Text>
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