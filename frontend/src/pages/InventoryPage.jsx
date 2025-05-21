// pages/InventoryPage.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Badge,
  Icon,
  Box,
  Text,
  Flex,
  Heading,
  useToast,
  Spinner,
  Center,
  IconButton,
  useColorModeValue,
  Image,
  Tooltip
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import { formatNumberWithCommas, formatVND } from "../Utils/FormatUtils";
import { FiEdit, FiTrash2, FiPlus, FiPackage, FiAlertCircle, FiXCircle } from "react-icons/fi";
import CreateProductModal from "../components/inventory/CreateProductModal";
import EditProductModal from "../components/inventory/EditProductModal";
import DeleteProductModal from "../components/inventory/DeleteProductModal";
import AddStockModal from "../components/inventory/AddStockModal";

// Các hằng số
const LOW_STOCK_THRESHOLD = 10;

const InventoryPage = () => {
  // State & Hooks
  const { products, fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const toast = useToast();

  // Modals
  const { 
    isOpen: isCreateOpen, 
    onOpen: onCreateOpen, 
    onClose: onCreateClose 
  } = useDisclosure();
  
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  
  const { 
    isOpen: isAddStockOpen, 
    onOpen: onAddStockOpen, 
    onClose: onAddStockClose 
  } = useDisclosure();

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
      setLoading(false);
    };
    
    loadProducts();
  }, [fetchProducts]);

  // Handlers
  const handleEdit = (product) => {
    setSelectedProduct(product);
    onEditOpen();
  };
  
  const handleDelete = (product) => {
    setSelectedProduct(product);
    onDeleteOpen();
  };
  
  const handleAddStock = (product) => {
    setSelectedProduct(product);
    onAddStockOpen();
  };

  // Thông báo thành công chung
  const showSuccess = (message) => {
    toast({
      title: "Thành công",
      description: message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Tính lợi nhuận - đã sửa lỗi
  const calculateProfit = (price, initialPrice) => {
    // Đảm bảo cả hai giá trị đều là số và không phải null/undefined
    const priceValue = price || 0;
    const initialPriceValue = initialPrice || 0;
    return priceValue - initialPriceValue;
  };
  
  const calculateProfitPercent = (price, initialPrice) => {
    // Đảm bảo không chia cho 0 và xử lý giá trị null/undefined
    if (!initialPrice) return 0;
    
    const priceValue = price || 0;
    const initialPriceValue = initialPrice || 0;
    return ((priceValue - initialPriceValue) / initialPriceValue) * 100;
  };
  
  // Màu sắc UI elements
  const tableBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  if (loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="lg">Quản lý kho hàng</Heading>
          <HStack spacing={4}>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onCreateOpen}
            >
              Thêm sản phẩm mới
            </Button>
          </HStack>
        </Flex>
        
        {/* Bảng sản phẩm */}
        <Box
          bg={tableBg}
          shadow="md"
          borderRadius="lg"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Hình ảnh</Th>
                <Th>Tên sản phẩm</Th>
                <Th isNumeric>Giá bán</Th>
                <Th isNumeric>Giá nhập</Th>
                <Th isNumeric>Lợi nhuận</Th>
                <Th isNumeric>Tồn kho</Th>
                <Th>Thao tác</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={6}>
                    <Text>Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm mới" để bắt đầu.</Text>
                  </Td>
                </Tr>
              ) : (
                products.map((product) => (
                  <Tr 
                    key={product._id} 
                    _hover={{ bg: hoverBg }}
                    position="relative"
                  >
                    <Td>
                      <Box 
                        w="50px" 
                        h="50px" 
                        borderRadius="md" 
                        overflow="hidden"
                        position="relative"
                      >
                        <Image 
                          src={product.image} 
                          fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif"
                          alt={product.name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                      </Box>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{product.name}</Text>
                      {(product.storage || 0) === 0 ? (
                        <Badge colorScheme="red" mt={1}>
                          <Flex align="center">
                            <Icon as={FiXCircle} mr={1} />
                            Hết hàng
                          </Flex>
                        </Badge>
                      ) : (product.storage || 0) <= LOW_STOCK_THRESHOLD && (
                        <Badge colorScheme="orange" mt={1}>
                          <Flex align="center">
                            <Icon as={FiAlertCircle} mr={1} />
                            Sắp hết hàng
                          </Flex>
                        </Badge>
                      )}
                    </Td>
                    <Td isNumeric>{formatVND(product.price)}</Td>
                    <Td isNumeric>{formatVND(product.initialPrice || 0)}</Td>
                    <Td isNumeric>
                      <Text>{formatVND(calculateProfit(product.price, product.initialPrice))}</Text>
                      <Text fontSize="sm" color={calculateProfit(product.price, product.initialPrice) > 0 ? "green.500" : "red.500"}>
                        ({calculateProfitPercent(product.price, product.initialPrice).toFixed(2)}%)
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text 
                        fontWeight="bold" 
                        color={(product.storage || 0) === 0 ? "red.600" : (product.storage || 0) <= LOW_STOCK_THRESHOLD ? "red.500" : "inherit"}
                      >
                        {formatNumberWithCommas(product.storage || 0)}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Nhập thêm hàng" hasArrow>
                          <IconButton
                            icon={<FiPackage />}
                            aria-label="Nhập thêm hàng"
                            colorScheme="blue"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddStock(product)}
                          />
                        </Tooltip>
                        <Tooltip label="Chỉnh sửa" hasArrow>
                          <IconButton
                            icon={<FiEdit />}
                            aria-label="Chỉnh sửa sản phẩm"
                            colorScheme="teal"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          />
                        </Tooltip>
                        <Tooltip label="Xóa sản phẩm" hasArrow>
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Xóa sản phẩm"
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>
      
      {/* Modals */}
      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => {
          onCreateClose();
        }}
      />
      
      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={isEditOpen}
            onClose={() => {
              onEditClose();
            }}
            product={selectedProduct}
          />
          
          <DeleteProductModal
            isOpen={isDeleteOpen}
            onClose={() => {
              onDeleteClose();
              showSuccess("Đã xóa sản phẩm thành công!");
            }}
            product={selectedProduct}
          />
          
          <AddStockModal
            isOpen={isAddStockOpen}
            onClose={() => {
              onAddStockClose();
            }}
            product={selectedProduct}
          />
        </>
      )}
    </Container>
  );
};

export default InventoryPage;