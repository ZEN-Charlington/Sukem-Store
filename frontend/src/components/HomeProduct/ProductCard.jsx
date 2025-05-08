// components/HomeProduct/ProductCard.jsx
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
    AlertIcon
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useProductStore } from "../../store/product";
import { useAuthStore } from "../../store/user"; // Thêm import useAuthStore
import { useState, useEffect } from "react";
import { formatVND, formatNumberWithCommas } from '../../Utils/FormatUtils';

const ProductCard = ({ product, compact = false }) => {
    const [updatedProduct, setUpdatedProduct] = useState(product);
    
    // Sử dụng useColorModeValue cho các màu sắc
    const textColor = useColorModeValue("gray.600", "gray.300");
    const bgCard = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const hoverBg = useColorModeValue("gray.50", "gray.700");

    const { deleteProduct, updateProduct } = useProductStore();
    const { hasPermission } = useAuthStore(); // Lấy hàm kiểm tra quyền
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Kiểm tra người dùng có phải là manager không
    const isManager = hasPermission("manager");
    
    // Reset về thông tin hiện tại khi mở modal
    useEffect(() => {
        if (isOpen) {
            setUpdatedProduct(product);
        }
    }, [isOpen, product]);

    const handleDeleteProduct = async (pid) => {
        // Kiểm tra quyền trước khi xóa
        if (!isManager) {
            toast({
                title: "Không có quyền",
                description: "Bạn không có quyền xóa sản phẩm",
                status: "error", 
                isClosable: true
            });
            return;
        }
        
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
        // Kiểm tra quyền trước khi cập nhật
        if (!isManager) {
            toast({
                title: "Không có quyền",
                description: "Bạn không có quyền cập nhật sản phẩm",
                status: "error", 
                isClosable: true
            });
            onClose();
            return;
        }
        
        const { success, message } = await updateProduct(pid, updatedProduct);
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
        // Chỉ cho phép nhập số
        const rawValue = e.target.value.replace(/[^\d]/g, "");
        setUpdatedProduct({...updatedProduct, price: rawValue});
    };

    const getDisplayPrice = () => {
        if (!updatedProduct.price) return "";
        return formatNumberWithCommas(updatedProduct.price);
    };

    return (
        <Box
            shadow="lg"
            rounded="lg"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ 
                transform: "translateY(-5px)", 
                shadow: "xl",
                bg: hoverBg
            }}
            bg={bgCard}
            borderColor={borderColor}
            borderWidth="1px"
            height={compact ? "auto" : "full"}
        >
            <Image 
                src={product.image} 
                fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif" 
                alt={product.name} 
                h={compact ? 32 : 52} 
                w="full" 
                objectFit="cover" 
            />
            <Box p={compact ? 3 : 4} height={compact ? "auto" : "120px"}>
                <Heading as="h3" size={compact ? "sm" : "md"} mb={2} noOfLines={2} lineHeight="shorter">
                    {product.name}
                </Heading>
                <Text fontWeight="bold" fontSize={compact ? "lg" : "xl"} color={textColor} mb={compact ? 2 : 4}>
                    {formatVND(product.price)}
                </Text>
                
                {/* Chỉ hiển thị nút chỉnh sửa và xóa cho người dùng có quyền manager */}
                {isManager && (
                    <HStack spacing={2}>
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
                                handleDeleteProduct(product._id);
                            }}
                        />
                    </HStack>
                )}
            </Box>
            
            {/* Modal sẽ hiển thị bất kể quyền, nhưng nội dung sẽ khác nhau dựa trên quyền */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>Chỉnh sửa sản phẩm</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {!isManager ? (
                                <Alert status="error" borderRadius="md">
                                    <AlertIcon />
                                    Bạn không có quyền chỉnh sửa sản phẩm. Tính năng này chỉ dành cho quản lý.
                                </Alert>
                            ) : (
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel>Tên sản phẩm</FormLabel>
                                        <Input
                                            placeholder="Tên sản phẩm"
                                            value={updatedProduct.name}
                                            name="name"
                                            onChange={(e) => setUpdatedProduct({...updatedProduct, name: e.target.value})}
                                        />
                                    </FormControl>
                                    
                                    <FormControl>
                                        <FormLabel>Giá tiền</FormLabel>
                                        <InputGroup>
                                            <Input
                                                placeholder="Giá tiền"
                                                value={getDisplayPrice()}
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
                                        <FormLabel>Link URL Hình ảnh</FormLabel>
                                        <Input
                                            placeholder="Link URL Hình ảnh"
                                            value={updatedProduct.image}
                                            onChange={(e) => setUpdatedProduct({...updatedProduct, image: e.target.value})}
                                            name="image"
                                        />
                                    </FormControl>
                                </VStack>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {isManager ? (
                                <>
                                    <Button colorScheme="blue" mr={3} onClick={() => handleUpdateProduct(product._id, updatedProduct)}>
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
};

export default ProductCard;