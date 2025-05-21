import { 
  Container, 
  Text, 
  SimpleGrid, 
  Flex, 
  Box,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";
import { useAuthStore } from "../store/user";
import ProductCard from "../components/HomeProduct/ProductCard";
import Receipt from "../components/HomeReceipt/Receipt";

const HomePage = ({ searchKeyword = "" }) => {
  const { fetchProducts, products } = useProductStore();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [productStorage, setProductStorage] = useState({});
  const receiptRef = useRef(null);
  
  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      await checkAuth();
    };
    
    loadData();
  }, [fetchProducts, checkAuth]);
  useEffect(() => {
    if (products && products.length > 0) {
      const storageMap = {};
      products.forEach(product => {
        storageMap[product._id] = Number(product.storage || 0);
      });
      setProductStorage(storageMap);
    }
  }, [products]);

  const filteredProducts = products.filter((product) => {
    return product.name && product.name.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  const handleAddToCart = (product) => {
    if (receiptRef.current) {
      receiptRef.current.addToCart(product);
    }
  };

  return (
    <Container maxW='container.xl' py={8}>
      <Flex direction={{ base: "column", lg: "row" }} gap={6}>
        <Box flex="2" pr={{ base: 0, lg: 2 }}>
          <Text
            fontSize={"30"}
            fontWeight={"bold"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
            textAlign={"center"}
            mb={8}
            mx="auto"
            maxW="container.lg"
          >
            Các sản phẩm hiện có 🚀
          </Text>
          
          <SimpleGrid
            columns={{
              base: 4,
              sm: 2,
              md: 3,
              lg: 4 
            }}
            spacing={4}
            w={"full"}
          >
            {filteredProducts.map((product) => (
              <Box key={product._id} onClick={() => handleAddToCart(product)} cursor="pointer">
                <ProductCard product={product} compact={true} />
              </Box>
            ))}
          </SimpleGrid>
          {filteredProducts.length === 0 && (
            <Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
              Hiện chưa có sản phẩm 😢{" "}
              <Link to={"/create"}>
                <Text as='span' color='blue.500' _hover={{ textDecoration: "underline" }}>
                  Tạo mới sản phẩm
                </Text>
              </Link>
            </Text>
          )}
        </Box>
        <Receipt
          ref={receiptRef}
          isAuthenticated={isAuthenticated}
          user={user}
          productStorage={productStorage} 
        />
      </Flex>
    </Container>
  );
};

export default HomePage;