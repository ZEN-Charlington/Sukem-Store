import { 
  Container, 
  VStack, 
  Heading, 
  useColorModeValue, 
  Input, 
  Button, 
  Box, 
  useToast,
  InputGroup,
  InputRightElement
} from "@chakra-ui/react";
import { useState } from "react";
import { useProductStore } from "../store/product";
import {formatNumberWithCommas } from '../Utils/FormatUtils';

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
  });
  const toast = useToast();

  const { createProduct } = useProductStore();

  // Format số với dấu chấm phân cách hàng nghìn
  const handlePriceChange = (e) => {
    // Chỉ cho phép nhập số
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    
    // Cập nhật giá trị trong state
    setNewProduct({ ...newProduct, price: rawValue });
  };

  const getDisplayPrice = () => {
    if (!newProduct.price) return "";
    return formatNumberWithCommas(newProduct.price);
  };

  const handleAddProduct = async() => {
    const {success, message} = await createProduct(newProduct);
    if(!success){
      toast({
        title: "Có lỗi",
        description: message,
        status: "error", 
        isClosable: true
      });
    } else {
      toast({
        title: "Thành công",
        description: message,
        status: "success",
        isClosable: true
      });
      // Reset form sau khi thêm thành công
      setNewProduct({
        name: "",
        price: "",
        image: "",
      });
    }
  };

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
          Thêm sản phẩm mới
        </Heading>
        <Box
          w={"full"} 
          bg={useColorModeValue("white", "gray.800")}
          p={6} 
          rounded={"lg"} 
          shadow={"md"}
        >
          <VStack spacing={4}>
            <Input
              placeholder="Tên sản phẩm"
              name="name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value})}
            />
            
            <InputGroup>
              <Input
                placeholder="Giá sản phẩm"
                name="price"
                value={getDisplayPrice()}
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
            
            <Input
              placeholder="Hình ảnh sản phẩm"
              name="image"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value})}
            />
            
            <Button colorScheme="blue" onClick={handleAddProduct} w="full">
              Thêm sản phẩm 
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

export default CreatePage;