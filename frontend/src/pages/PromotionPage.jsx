import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Tooltip
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTag, FaGift } from "react-icons/fa";
import { usePromotionStore } from "../store/promotion";
import { useCouponStore } from "../store/coupon";
import { useProductStore } from "../store/product";
import PromotionModal from "../components/modals/PromotionModal";
import { formatVND } from "../Utils/FormatUtils";

const PromotionPage = () => {
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const { promotions, fetchPromotions, deletePromotion } = usePromotionStore();
  const { coupons, fetchCoupons, deleteCoupon } = useCouponStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchPromotions();
    fetchCoupons();
    fetchProducts();
  }, []);

  const handleCreatePromotion = () => {
    setSelectedPromotion(null);
    onOpen();
  };

  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    onOpen();
  };

  const handleDeletePromotion = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa promotion này?")) {
      const result = await deletePromotion(id);
      if (result.success) {
        toast({
          title: "Xóa thành công",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh data
        fetchPromotions();
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa coupon này?")) {
      const result = await deleteCoupon(id);
      if (result.success) {
        toast({
          title: "Xóa thành công",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh data
        fetchCoupons();
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    
    if (!promotion.isActive) return { status: "Tạm dừng", color: "gray" };
    if (now < start) return { status: "Chưa bắt đầu", color: "blue" };
    if (now > end) return { status: "Đã kết thúc", color: "red" };
    return { status: "Đang diễn ra", color: "green" };
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    
    if (coupon.isUsed) return { status: "Đã sử dụng", color: "gray" };
    if (now > expiry) return { status: "Hết hạn", color: "red" };
    return { status: "Còn hiệu lực", color: "green" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">Quản lý khuyến mãi</Text>
        </HStack>

        <Tabs index={tabIndex} onChange={setTabIndex}>
          <TabList>
            <Tab>
              <HStack>
                <FaTag />
                <Text>Sale theo % ({promotions.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FaGift />
                <Text>Coupon ({coupons.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">Danh sách Promotion</Text>
                  <Button
                    leftIcon={<FaPlus />}
                    colorScheme="blue"
                    onClick={handleCreatePromotion}
                  >
                    Tạo promotion
                  </Button>
                </HStack>

                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Sản phẩm</Th>
                        <Th>Tiêu đề</Th>
                        <Th isNumeric>Giảm giá</Th>
                        <Th>Thời gian</Th>
                        <Th>Trạng thái</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {promotions.map((promotion) => {
                        const status = getPromotionStatus(promotion);
                        return (
                          <Tr key={promotion._id}>
                            <Td>
                              <HStack>
                                <Image
                                  src={promotion.productId?.image}
                                  fallbackSrc="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif"
                                  alt={promotion.productId?.name}
                                  boxSize="40px"
                                  objectFit="cover"
                                  borderRadius="md"
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {promotion.productId?.name}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {formatVND(promotion.productId?.price)}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {promotion.title}
                                </Text>
                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                  {promotion.description}
                                </Text>
                              </VStack>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="orange" variant="solid">
                                -{promotion.discountPercent}%
                              </Badge>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs">
                                  {formatDate(promotion.startDate)}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  đến {formatDate(promotion.endDate)}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={status.color}>
                                {status.status}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Tooltip label="Sửa">
                                  <IconButton
                                    icon={<FaEdit />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => handleEditPromotion(promotion)}
                                  />
                                </Tooltip>
                                <Tooltip label="Xóa">
                                  <IconButton
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeletePromotion(promotion._id)}
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                  {promotions.length === 0 && (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500">Chưa có promotion nào</Text>
                    </Box>
                  )}
                </Box>
              </VStack>
            </TabPanel>

            <TabPanel p={0} pt={4}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">Danh sách Coupon</Text>
                  <Text fontSize="sm" color="gray.500">
                    Coupon được tạo tự động khi thanh toán đạt ngưỡng
                  </Text>
                </HStack>

                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Mã coupon</Th>
                        <Th isNumeric>Giảm giá</Th>
                        <Th>Hóa đơn liên quan</Th>
                        <Th>Thời gian</Th>
                        <Th>Trạng thái</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {coupons.map((coupon) => {
                        const status = getCouponStatus(coupon);
                        return (
                          <Tr key={coupon._id}>
                            <Td>
                              <Text fontFamily="mono" fontWeight="bold">
                                {coupon.code}
                              </Text>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="green" variant="solid">
                                -{coupon.discountPercent}%
                              </Badge>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm">
                                  {coupon.createdFromInvoice?.invoiceNumber}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatVND(coupon.createdFromInvoice?.totalAmount)}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {formatDate(coupon.expiryDate)}
                              </Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={status.color}>
                                {status.status}
                              </Badge>
                            </Td>
                            <Td>
                              {!coupon.isUsed && (
                                <Tooltip label="Xóa">
                                  <IconButton
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteCoupon(coupon._id)}
                                  />
                                </Tooltip>
                              )}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                  {coupons.length === 0 && (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500">Chưa có coupon nào</Text>
                    </Box>
                  )}
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <PromotionModal
        isOpen={isOpen}
        onClose={onClose}
        promotion={selectedPromotion}
        products={products}
        onSuccess={() => {
          fetchPromotions();
          onClose();
        }}
      />
    </Box>
  );
};

export default PromotionPage;