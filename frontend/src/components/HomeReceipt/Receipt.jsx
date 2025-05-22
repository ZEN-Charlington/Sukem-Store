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
import { usePromotionStore } from "../../store/promotion";
import { FaTimes, FaClock } from "react-icons/fa";
import Cart from "./Cart";
import Note from "./Note";
import CheckOut from "./CheckOut";
import QrPayment from "./QrPayment";
import CouponInput from "./CouponInput";
import { useTimeCounter, TimeDisplay } from "../../utils/TimeCounter.jsx";

const Receipt = forwardRef(({ isAuthenticated, user, productStorage }, ref) => {
  const componentId = useRef(`HD-${Math.random().toString(36).substring(2, 9)}`).current;
  const { createReceipt } = useReceiptStore();
  const { getPromotionByProduct } = usePromotionStore();
  const toast = useToast();
  
  const [carts, setCarts] = useState(() => {
    const initialCart = {
      id: 1, 
      items: [], 
      note: "", 
      paymentMethod: "Tiền mặt",
      paymentStatus: "Chưa thanh toán",
      date: new Date(),
      totalAmount: 0,
      appliedCoupon: null
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
    const cartIndex = carts.findIndex(cart => cart.id === parseInt(invoiceId.split('-')[1]));
    if (cartIndex !== -1) {
      setCarts(prevCarts => {
        const newCarts = [...prevCarts];
        if (cartIndex === 0 && prevCarts.length === 1) {
          newCarts[0] = { ...newCarts[0], items: [], note: "", totalAmount: 0 };
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
        startTimer(`${componentId}-${cart.id}`);
      }
    });
  }, [carts.length]); 

  const calculateCartTotal = (cart) => {
    const originalTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cart.appliedCoupon) {
      const discountAmount = Math.round(originalTotal * (cart.appliedCoupon.coupon.discountPercent / 100));
      return originalTotal - discountAmount;
    }
    return originalTotal;
  };

  const updateCartTotal = (cart) => {
    return { ...cart, totalAmount: calculateCartTotal(cart) };
  };

  const addToCart = async (product) => {
    const storage = productStorage?.[product._id] || 0;
    if (storage <= 0) return;

    const promotionResult = await getPromotionByProduct(product._id);
    const promotion = promotionResult.success ? promotionResult.data : null;
    const finalPrice = promotion ? 
      Math.round(product.price * (1 - promotion.discountPercent / 100)) : 
      product.price;
    
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex] };
      const existingItemIndex = activeCart.items.findIndex(item => item.productId === product._id);
      
      if (existingItemIndex === -1) {
        const newItem = {
          productId: product._id,
          productName: product.name,
          price: Number(finalPrice),
          originalPrice: Number(product.price),
          quantity: 1,
          image: product.image,
          total: Number(finalPrice),
          hasPromotion: !!promotion
        };
        activeCart.items = [...activeCart.items, newItem];
        const updatedCart = updateCartTotal(activeCart);
        newCarts[activeTabIndex] = updatedCart;
        if (activeCart.items.length === 1) {
          startTimer(`${componentId}-${activeCart.id}`);
        }
      } else {
        const currentItem = activeCart.items[existingItemIndex];
        if (currentItem.quantity < storage) {
          const updatedItems = [...activeCart.items];
          updatedItems[existingItemIndex] = {
            ...currentItem,
            quantity: currentItem.quantity + 1,
            total: (currentItem.quantity + 1) * currentItem.price
          };
          activeCart.items = updatedItems;
          const updatedCart = updateCartTotal(activeCart);
          newCarts[activeTabIndex] = updatedCart;
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
      const storage = productStorage?.[item.productId] || 5;
      
      if (item.quantity < storage && item.quantity < 100) {
        const updatedItems = [...activeCart.items];
        updatedItems[itemIndex] = {
          ...item,
          quantity: item.quantity + 1,
          total: (item.quantity + 1) * item.price
        };
        activeCart.items = updatedItems;
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
      activeCart.items = activeCart.items.filter((_, index) => index !== itemIndex);
      const updatedCart = updateCartTotal(activeCart);
      newCarts[activeTabIndex] = updatedCart;
      if (activeCart.items.length === 0) {
        stopTimer(`${componentId}-${activeCart.id}`);
      }
      return newCarts;
    });
  };

  const createNewBill = () => {
    const newCartId = carts.length + 1;
    setCarts([...carts, { 
      id: newCartId, 
      items: [], 
      note: "",
      paymentMethod: "Tiền mặt",
      paymentStatus: "Chưa thanh toán",
      date: new Date(),
      totalAmount: 0,
      appliedCoupon: null
    }]);
    setActiveTabIndex(carts.length);
  };
  
  const removeCart = (cartIndex) => {
    if (cartIndex === 0) return;
    const cartToRemove = carts[cartIndex];
    stopTimer(`${componentId}-${cartToRemove.id}`);
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
      newCarts[activeTabIndex] = { ...newCarts[activeTabIndex], note: newNote };
      return newCarts;
    });
  };

  const handleCouponApplied = (couponData) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex], appliedCoupon: couponData };
      const updatedCart = updateCartTotal(activeCart);
      newCarts[activeTabIndex] = updatedCart;
      return newCarts;
    });
  };

  const handleCouponRemoved = () => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const activeCart = { ...newCarts[activeTabIndex], appliedCoupon: null };
      const updatedCart = updateCartTotal(activeCart);
      newCarts[activeTabIndex] = updatedCart;
      return newCarts;
    });
  };

  const updatePaymentMethod = (method) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      newCarts[activeTabIndex] = { ...newCarts[activeTabIndex], paymentMethod: method };
      return newCarts;
    });
  };

  const getFinalAmount = (cart) => {
    return cart.totalAmount;
  };

  useImperativeHandle(ref, () => ({
    addToCart,
    cleanup: () => {
      carts.forEach(cart => stopTimer(`${componentId}-${cart.id}`));
    }
  }));

  const handleActionButton = () => {
    if (!isAuthenticated) return;
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
    stopTimer(`${componentId}-${activeCart.id}`);
    
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
      totalAmount: getFinalAmount(activeCart),
      originalAmount: activeCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      appliedCouponCode: activeCart.appliedCoupon?.coupon?.code || null
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
            appliedCoupon: null,
            date: new Date(),
          };
          return newCarts;
        });
        
        let toastMessage = `Hóa đơn ${result.data.invoiceNumber} đã được tạo`;
        let toastDuration = 5000;
        
        // Kiểm tra nhiều cách để đảm bảo có coupon
        if (result.coupon || result.data.coupon) {
          const couponData = result.coupon || result.data.coupon;
          toastMessage = `🎉 Tạo hóa đơn thành công!\n🎫 Tặng mã giảm giá: ${couponData.code} (${couponData.discountPercent}%)\n📅 Hạn sử dụng: ${new Date(couponData.expiryDate).toLocaleDateString('vi-VN')}`;
          toastDuration = 10000;
        }
        
        toast({
          title: "Thanh toán thành công",
          description: toastMessage,
          status: "success",
          duration: toastDuration,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
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
                        getRemainingTime(`${componentId}-${cart.id}`)?.minutes < 1 ? "red" : 
                        getRemainingTime(`${componentId}-${cart.id}`)?.minutes < 5 ? "orange" : "green"
                      }
                      display="flex"
                      alignItems="center"
                    >
                      <FaClock size="10" style={{ marginRight: '4px' }} />
                      <TimeDisplay 
                        invoiceId={`${componentId}-${cart.id}`} 
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
              <CouponInput
                totalAmount={cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                onCouponApplied={handleCouponApplied}
                onCouponRemoved={handleCouponRemoved}
                appliedCoupon={cart.appliedCoupon}
                bgHover={bgHover}
                textColor={textColor}
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