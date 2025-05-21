import {
  Box,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  useColorModeValue,
  useDisclosure,
  useToast,
  IconButton,
  Text,
  Flex,
  Badge
} from "@chakra-ui/react";
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useReceiptStore } from "../../store/receipt";
import { FaTimes, FaClock } from "react-icons/fa";
import Cart from "./Cart";
import Note from "./Note";
import CheckOut from "./CheckOut";
import QrPayment from "./QrPayment";
import { useTimeCounter, TimeDisplay } from "../../utils/TimeCounter.jsx";

const Receipt = forwardRef(({ isAuthenticated, user, productStorage }, ref) => {
  const componentId = useRef(`receipt-${Math.random().toString(36).substring(2, 9)}`).current;
  const { createReceipt } = useReceiptStore();
  const toast = useToast();
  const generateInvoiceId = (cartIndex) => {
    return `${componentId}-${cartIndex + 1}`;
  };
  const [carts, setCarts] = useState(() => {
    const initialCart = {
      id: 1, 
      items: [], 
      note: "", 
      paymentMethod: "Tiền mặt",
      paymentStatus: "Chưa thanh toán",
      invoiceNumber: `${componentId}-1`, 
      date: new Date(),
      totalAmount: 0
    };
    return [initialCart];
  });
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOpen: isNoteOpen, onOpen: onNoteOpen, onClose: onNoteClose } = useDisclosure();
  const { isOpen: isQrOpen, onOpen: onQrOpen, onClose: onQrClose } = useDisclosure();
  const [qrActiveCart, setQrActiveCart] = useState(null);
  
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const bgHover = useColorModeValue("gray.50", "gray.700");
  const bgGreet = useColorModeValue("gray.200", "gray.700");
  
  const handleCartTimeout = (invoiceId) => {
    const cartIndex = carts.findIndex(cart => cart.invoiceNumber === invoiceId);
    if (cartIndex !== -1) {
      toast({
        title: "Hóa đơn đã hết hạn",
        description: `Hóa đơn #${carts[cartIndex].id} đã bị xóa do quá thời gian thanh toán (15 phút)`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      setCarts(prevCarts => {
        const newCarts = [...prevCarts];
        if (cartIndex === 0 && prevCarts.length === 1) {
          newCarts[0] = {
            ...newCarts[0],
            items: [],
            note: "",
            totalAmount: 0
          };
        } else {
          newCarts.splice(cartIndex, 1);
          if (activeTabIndex === cartIndex) {
            setActiveTabIndex(Math.max(0, cartIndex - 1));
          } else if (activeTabIndex > cartIndex) {
            setActiveTabIndex(activeTabIndex - 1);
          }
        }
        
        return newCarts;
      });
    }
  };
  
  const { startTimer, stopTimer, getRemainingTime } = useTimeCounter(15, handleCartTimeout);
  
  useEffect(() => {
    carts.forEach(cart => {
      if (cart.items.length > 0 && cart.paymentStatus === "Chưa thanh toán") {
        startTimer(cart.invoiceNumber);
      }
    });
  }, [carts.length]); 

  // Hàm cập nhật tổng tiền của giỏ hàng
  const updateCartTotal = (cart) => {
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    return { ...cart, totalAmount };
  };

  const addToCart = (product) => {
    // Kiểm tra tồn kho
    const storage = productStorage?.[product._id] || 0;
    if (storage <= 0) {
      toast({
        title: "Không thể thêm sản phẩm",
        description: `Sản phẩm "${product.name}" đã hết hàng!`,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex] };
      
      const existingItemIndex = activeCart.items.findIndex(item => item.productId === product._id);
      
      if (existingItemIndex === -1) {
        // Thêm sản phẩm mới
        const newItem = {
          productId: product._id,
          productName: product.name,
          price: Number(product.price),
          quantity: 1,
          image: product.image,
          total: Number(product.price)
        };
        
        activeCart.items = [...activeCart.items, newItem];
        
        // Cập nhật tổng tiền
        const updatedCart = updateCartTotal(activeCart);
        newCarts[activeTabIndex] = updatedCart;
        
        if (activeCart.items.length === 1) {
          startTimer(activeCart.invoiceNumber);
        }
      } else {
        // Sản phẩm đã tồn tại, tăng số lượng nếu chưa đạt giới hạn tồn kho
        const currentItem = activeCart.items[existingItemIndex];
        if (currentItem.quantity < storage) {
          const updatedItems = [...activeCart.items];
          updatedItems[existingItemIndex] = {
            ...currentItem,
            quantity: currentItem.quantity + 1,
            total: (currentItem.quantity + 1) * currentItem.price
          };
          
          activeCart.items = updatedItems;
          
          // Cập nhật tổng tiền
          const updatedCart = updateCartTotal(activeCart);
          newCarts[activeTabIndex] = updatedCart;
        } else {
          toast({
            title: "Không thể thêm sản phẩm",
            description: `Số lượng sản phẩm "${product.name}" đã đạt giới hạn tồn kho (${storage})`,
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
        }
      }
      
      return newCarts;
    });
  };

  const increaseQuantity = (itemIndex) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex] };
      const item = activeCart.items[itemIndex];
      const storage = productStorage && productStorage[item.productId] ? 
        Number(productStorage[item.productId]) : 5;
      
      // Kiểm tra số lượng tồn kho trước khi tăng
      if (item.quantity < storage && item.quantity < 100) {
        const updatedItems = [...activeCart.items];
        updatedItems[itemIndex] = {
          ...item,
          quantity: item.quantity + 1,
          total: (item.quantity + 1) * item.price
        };
        
        activeCart.items = updatedItems;
        
        // Cập nhật tổng tiền
        const updatedCart = updateCartTotal(activeCart);
        newCarts[activeTabIndex] = updatedCart;
      }
      
      return newCarts;
    });
  };
    
  const decreaseQuantity = (itemIndex) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex] };
      const item = activeCart.items[itemIndex];
      
      if (item.quantity > 1) {
        const updatedItems = [...activeCart.items];
        updatedItems[itemIndex] = {
          ...item,
          quantity: item.quantity - 1,
          total: (item.quantity - 1) * item.price
        };
        
        activeCart.items = updatedItems;
        
        // Cập nhật tổng tiền
        const updatedCart = updateCartTotal(activeCart);
        newCarts[activeTabIndex] = updatedCart;
      }
      
      return newCarts;
    });
  };

  const removeItem = (itemIndex) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex] };
      
      // Xóa sản phẩm khỏi giỏ hàng
      activeCart.items = activeCart.items.filter((_, index) => index !== itemIndex);
      
      // Cập nhật tổng tiền
      const updatedCart = updateCartTotal(activeCart);
      newCarts[activeTabIndex] = updatedCart;
      
      if (activeCart.items.length === 0) {
        stopTimer(activeCart.invoiceNumber);
      }
      
      return newCarts;
    });
  };

  const createNewBill = () => {
    const newCartId = carts.length + 1;
    const newInvoiceNumber = generateInvoiceId(carts.length);
    
    setCarts([...carts, { 
      id: newCartId, 
      items: [], 
      note: "",
      paymentMethod: "Tiền mặt",
      paymentStatus: "Chưa thanh toán",
      invoiceNumber: newInvoiceNumber,
      date: new Date(),
      totalAmount: 0
    }]);
    setActiveTabIndex(carts.length);
  };
  
  const removeCart = (cartIndex) => {
    if (cartIndex === 0) return;
    const cartToRemove = carts[cartIndex];
    stopTimer(cartToRemove.invoiceNumber);
    setCarts(prevCarts => {
      const newCarts = prevCarts.filter((_, index) => index !== cartIndex);
      if (activeTabIndex === cartIndex) {
        setActiveTabIndex(cartIndex - 1);
      } else if (activeTabIndex > cartIndex) {
        setActiveTabIndex(activeTabIndex - 1);
      }
      return newCarts;
    });
  };

  const setNote = (newNote) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      newCarts[activeTabIndex] = {
        ...newCarts[activeTabIndex],
        note: newNote
      };
      return newCarts;
    });
  };

  const updatePaymentMethod = (method) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      newCarts[activeTabIndex] = {
        ...newCarts[activeTabIndex],
        paymentMethod: method
      };
      return newCarts;
    });
  };

  useImperativeHandle(ref, () => {
    return {
      addToCart,
      cleanup: () => {
        carts.forEach(cart => {
          stopTimer(cart.invoiceNumber);
        });
      }
    };
  });

  const handleActionButton = () => {
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thực hiện thanh toán",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const activeCart = carts[activeTabIndex];
    setQrActiveCart({...activeCart});
    if (activeCart.paymentMethod === "Chuyển khoản") {
      onQrOpen();
    } else {
      handleCheckout();
    }
  };

  const handleQrPaymentComplete = () => {
    handleCheckout();
    onQrClose();
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    const userId = user?._id; 
    const activeCart = carts[activeTabIndex];
    stopTimer(activeCart.invoiceNumber);
    const receiptData = {
      products: activeCart.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: item.price * item.quantity
      })),
      userId: userId,
      paymentMethod: activeCart.paymentMethod,
      paymentStatus: "Đã thanh toán",
      note: activeCart.note,
      totalAmount: activeCart.totalAmount
    };
    
    try {
      const result = await createReceipt(receiptData);
      
      if (result.success) {
        setCarts(prevCarts => {
          const newCarts = [...prevCarts];
          newCarts[activeTabIndex] = {
            ...newCarts[activeTabIndex],
            items: [],
            note: "",
            paymentMethod: "Tiền mặt",
            paymentStatus: "Chưa thanh toán",
            totalAmount: 0,
            date: new Date(),
          };
          return newCarts;
        });
        
        toast({
          title: "Thanh toán thành công",
          description: `Hóa đơn ${result.data.invoiceNumber || activeCart.invoiceNumber} đã được tạo`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Lỗi thanh toán",
          description: result.message || "Không thể tạo hóa đơn",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Đã có lỗi xảy ra, vui lòng thử lại sau",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box 
      flex="1" 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4}
      shadow="md"
      bg={bgCard}
      borderColor={borderColor}
      height="fit-content"
      position="sticky"
      top="20px"
      minWidth="600px"
      width="100%"
    >
      {isAuthenticated && user && (
        <Box mb={4} p={3} bg={bgGreet} borderRadius="md">
          <Text fontSize="sm" color={textColor}>
            Thu ngân: <Text as="span" fontWeight="bold">{user.name || user.email}</Text>
          </Text>
        </Box>
      )}
      <Tabs variant="enclosed" index={activeTabIndex} onChange={setActiveTabIndex}>
        <TabList>
          {carts.map((cart, index) => (
            <Box key={cart.id} position="relative">
              <Tab pr={index > 0 ? 8 : 3}>
                <Flex alignItems="center">
                  <Text>HD {cart.id}</Text>
                  {cart.items.length > 0 && cart.paymentStatus === "Chưa thanh toán" && (
                    <Badge
                      ml={2} 
                      colorScheme={
                        getRemainingTime(cart.invoiceNumber)?.minutes < 1 ? "red" : 
                        getRemainingTime(cart.invoiceNumber)?.minutes < 5 ? "orange" : "green"
                      }
                      display="flex"
                      alignItems="center"
                    >
                      <FaClock size="10" style={{ marginRight: '4px' }} />
                      <TimeDisplay 
                        invoiceId={cart.invoiceNumber} 
                        getRemainingTime={getRemainingTime}
                      />
                    </Badge>
                  )}
                </Flex>
              </Tab>
              {index > 0 && (
                <IconButton
                  icon={<FaTimes />}
                  size="xs"
                  aria-label="Đóng hóa đơn"
                  position="absolute"
                  right={1}
                  top="50%"
                  transform="translateY(-50%)"
                  variant="ghost"
                  colorScheme="red"
                  zIndex={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCart(index);
                  }}
                />
              )}
            </Box>
          ))}
          {carts.length < 4 && (
            <Tab onClick={createNewBill}>+</Tab>
          )}
        </TabList>
        <TabPanels>
          {carts.map((cart) => (
            <TabPanel key={cart.id} p={0} pt={4}>
              <Cart 
                cart={cart} 
                increaseQuantity={increaseQuantity} 
                decreaseQuantity={decreaseQuantity} 
                removeItem={removeItem}
                bgHover={bgHover}
                textColor={textColor}
                productStorage={productStorage}
              />
              <CheckOut 
                cart={cart}
                updatePaymentMethod={updatePaymentMethod}
                handleCheckout={handleActionButton}
                isProcessing={isProcessing}
                onOpenNote={onNoteOpen}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Note 
        note={carts[activeTabIndex]?.note || ""} 
        setNote={setNote} 
        isModalOpen={isNoteOpen} 
        onModalClose={onNoteClose} 
      />
      <QrPayment
        isOpen={isQrOpen}
        onClose={onQrClose}
        cart={qrActiveCart}
        onCompletePayment={handleQrPaymentComplete}
      />
    </Box>
  );
});

export default Receipt;