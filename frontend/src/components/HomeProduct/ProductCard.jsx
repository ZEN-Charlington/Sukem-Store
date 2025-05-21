import { 
    Box, 
    Heading, 
    HStack, 
    Image, 
    Text, 
    useColorModeValue, 
    IconButton, 
    useToast, 
    Modal,
    ModalOverlay, 
    ModalContent, 
    ModalCloseButton, 
    useDisclosure, 
    ModalHeader, 
    ModalBody, 
    VStack, 
    Input, 
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    InputGroup,
    InputRightElement,
    Alert,
    AlertIcon,
    Badge,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { FiAlertCircle } from "react-icons/fi";
import { useProductStore } from "../../store/product";
import { useAuthStore } from "../../store/user"; 
import { useState, useEffect, memo } from "react";
import { formatVND, formatNumberWithCommas } from '../../Utils/FormatUtils';

const LOW_STOCK_THRESHOLD = 10;

const ProductCard = memo(({ product, compact = false, onAddToCart }) => {
    const { products, deleteProduct, updateProduct } = useProductStore();
    const { hasPermission } = useAuthStore();
    
    const currentProduct = products.find(p => p._id === product._id) || product;
    const [updatedProduct, setUpdatedProduct] = useState(currentProduct);
    
    const textColor = useColorModeValue("gray.600", "gray.300");
    const bgCard = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const hoverBg = useColorModeValue("gray.200", "gray.700");  
    const disabledBg = useColorModeValue("gray.100", "gray.700");
    const disabledTextColor = useColorModeValue("gray.400", "gray.500");

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const isManager = hasPermission("manager");
    
    const isLowStock = (currentProduct.storage || 0) <= LOW_STOCK_THRESHOLD && (currentProduct.storage || 0) > 0;
    const isOutOfStock = (currentProduct.storage || 0) === 0;
    
    useEffect(() => {
        setUpdatedProduct(currentProduct);
    }, [currentProduct, isOpen]);

    const handleDeleteProduct = async (pid) => {
        const { success, message } = await deleteProduct(pid);
        if (!success) {
            toast({
                title: "Có lỗi",
                description: message,
                status: "error", 
                isClosable: true
            });
        } else {
            toast({
                title: "Đã xóa sản phẩm",
                description: message,
                status: "success",
                isClosable: true
            });
        }
    };

    const handleUpdateProduct = async (pid, updatedProduct) => {
        const productToUpdate = {
            ...updatedProduct,
            initialPrice: updatedProduct.initialPrice || currentProduct.initialPrice || 0,
            storage: updatedProduct.storage || currentProduct.storage || 0
        };
        
        const { success, message } = await updateProduct(pid, productToUpdate);
        onClose();
        if (!success) {
            toast({
                title: "Có lỗi !!",
                description: message,
                status: "error", 
                isClosable: true
            });
        } else {
            toast({
                title: "Thành công",
                description: "Sản phẩm đã được chỉnh sửa",
                status: "success",
                isClosable: true
            });
        }
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/[^\d]/g, "");
        setUpdatedProduct({...updatedProduct, price: rawValue});
    };
    
    const handleInitialPriceChange = (e) => {
        const rawValue = e.target.value.replace(/[^\d]/g, "");
        setUpdatedProduct({...updatedProduct, initialPrice: rawValue});
    };
    
    const handleStorageChange = (e) => {
        const rawValue = e.target.value.replace(/[^\d]/g, "");
        setUpdatedProduct({...updatedProduct, storage: rawValue});
    };

    const getDisplayPrice = (field) => {
        if (!updatedProduct[field]) return "";
        return formatNumberWithCommas(updatedProduct[field]);
    };

    return (
        <Box
            shadow="lg"
            rounded="lg"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ 
                transform: isOutOfStock ? "none" : "translateY(-5px)", 
                shadow: isOutOfStock ? "md" : "xl",
                bg: isOutOfStock ? disabledBg : hoverBg
            }}
            bg={isOutOfStock ? disabledBg : bgCard}
            borderColor={borderColor}
            borderWidth="1px"
            height={compact ? "auto" : "full"}
            position="relative"
            opacity={isOutOfStock ? 0.7 : 1}
            cursor={isOutOfStock ? "not-allowed" : "pointer"}
            filter={isOutOfStock ? "grayscale(80%)" : "none"}
        >
            <Box position="relative">
                <Image 
                    src={currentProduct.image} 
                    fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif" 
                    alt={currentProduct.name} 
                    h={compact ? 32 : 52} 
                    w="full" 
                    objectFit="cover" 
                    opacity={isOutOfStock ? 0.7 : 1}
                />
                
                {isLowStock && (
                    <Badge
                        position="absolute"
                        top="2"
                        right="2"
                        colorScheme="orange"
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={useColorModeValue("orange.100", "orange.900")}
                        color={useColorModeValue("orange.600", "orange.200")}
                    >
                        Sắp hết hàng
                    </Badge>
                )}
                
                {isOutOfStock && (
                    <Badge
                        position="absolute"
                        top="2"
                        right="2"
                        colorScheme="red"
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={useColorModeValue("red.100", "red.900")}
                        color={useColorModeValue("red.600", "red.200")}
                    >
                        Hết hàng
                    </Badge>
                )}
            </Box>
            
            <Box p={compact ? 3 : 4} height={compact ? "auto" : "auto"}>
                <Heading 
                    as="h3" 
                    size={compact ? "sm" : "md"} 
                    mb={2} 
                    noOfLines={2} 
                    lineHeight="shorter"
                    color={isOutOfStock ? disabledTextColor : "inherit"}
                >
                    {currentProduct.name}
                </Heading>
                
                <Text 
                    fontWeight="bold" 
                    fontSize={compact ? "lg" : "xl"} 
                    color={isOutOfStock ? disabledTextColor : textColor} 
                    mb={1}
                >
                    {formatVND(currentProduct.price || 0)}
                </Text>
                
                {isManager && (
                    <HStack spacing={2} justifyContent="flex-end">
                        <IconButton 
                            icon={<EditIcon />}
                            colorScheme="blue"
                            size={compact ? "sm" : "md"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                        />
                        <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            size={compact ? "sm" : "md"}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(currentProduct._id);
                            }}
                        />
                    </HStack>
                )}
            </Box>
            
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>Chỉnh sửa sản phẩm</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Tên sản phẩm</FormLabel>
                                    <Input
                                        placeholder="Tên sản phẩm"
                                        value={updatedProduct.name || ""}
                                        name="name"
                                        onChange={(e) => setUpdatedProduct({...updatedProduct, name: e.target.value})}
                                    />
                                </FormControl>
                                
                                <FormControl>
                                    <FormLabel>Giá bán</FormLabel>
                                    <InputGroup>
                                        <Input
                                            placeholder="Giá bán"
                                            value={getDisplayPrice("price")}
                                            name="price"
                                            onChange={handlePriceChange}
                                            pr="40px"
                                        />
                                        <InputRightElement
                                            pointerEvents="none"
                                            color="gray.500"
                                            fontSize="1em"
                                            children="đ"
                                        />
                                    </InputGroup>
                                </FormControl>
                                
                                <FormControl>
                                    <FormLabel>Giá nhập</FormLabel>
                                    <InputGroup>
                                        <Input
                                            placeholder="Giá nhập"
                                            value={getDisplayPrice("initialPrice")}
                                            name="initialPrice"
                                            onChange={handleInitialPriceChange}
                                            pr="40px"
                                        />
                                        <InputRightElement
                                            pointerEvents="none"
                                            color="gray.500"
                                            fontSize="1em"
                                            children="đ"
                                        />
                                    </InputGroup>
                                </FormControl>
                                
                                <FormControl>
                                    <FormLabel>Số lượng tồn kho</FormLabel>
                                    <Input
                                        placeholder="Số lượng tồn kho"
                                        value={getDisplayPrice("storage")}
                                        name="storage"
                                        onChange={handleStorageChange}
                                    />
                                </FormControl>
                                
                                <FormControl>
                                    <FormLabel>Link URL Hình ảnh</FormLabel>
                                    <Input
                                        placeholder="Link URL Hình ảnh"
                                        value={updatedProduct.image || ""}
                                        onChange={(e) => setUpdatedProduct({...updatedProduct, image: e.target.value})}
                                        name="image"
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            {isManager ? (
                                <>
                                    <Button colorScheme="blue" mr={3} onClick={() => handleUpdateProduct(currentProduct._id, updatedProduct)}>
                                        Hoàn tất
                                    </Button>
                                    <Button variant="ghost" onClick={onClose}>
                                        Hủy
                                    </Button>
                                </>
                            ) : (
                                <Button variant="ghost" onClick={onClose}>
                                    Đóng
                                </Button>
                            )}
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            </Modal>
        </Box>
    );
});

export default ProductCard;