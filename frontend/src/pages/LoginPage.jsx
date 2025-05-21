import { useState } from "react";
import { 
  Container, 
  Input, 
  VStack, 
  Button, 
  Heading, 
  useToast, 
  InputGroup, 
  InputRightElement, 
  IconButton,
  Box
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/user";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const { login, isLoading } = useAuthStore();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const result = await login(formData);
    
    if (result.success) {
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
        status: "success",
        isClosable: true,
      });
      navigate("/");
    } else {
      toast({
        title: "Lỗi đăng nhập",
        description: result.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxW="sm" mt={10}>
      <VStack spacing={6}>
        <Heading>Đăng nhập</Heading>
        <Input 
          placeholder="Email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        <InputGroup>
          <Input
            placeholder="Mật khẩu"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
          <InputRightElement>
            <IconButton
              variant="ghost"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              onClick={() => setShowPassword(!showPassword)}
            />
          </InputRightElement>
        </InputGroup>
        <Button 
          w="full" 
          colorScheme="blue" 
          onClick={handleLogin} 
          isLoading={isLoading}
        >
          Đăng nhập
        </Button>
        <Box w="100%" display="flex" justifyContent="flex-end">
          <Button variant="link" colorScheme="blue" onClick={() => navigate("/forgot-password")}>
            Quên mật khẩu?
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default LoginPage;