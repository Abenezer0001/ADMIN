import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  message, 
  notification, 
  Row, 
  Col, 
  Empty, 
  Pagination, 
  Input, 
  Dropdown, 
  Select, 
  Space, 
  Tag, 
  Drawer, 
  Descriptions, 
  List, 
  Avatar, 
  Divider, 
  Typography, 
  Badge,
  Alert,
  Modal,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  FilterOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TableOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import OrderService from '../services/OrderService';
import WebSocketService, { WebSocketEventType } from '../services/websocketService';
import { Order, OrderStatus } from '../types/order';
import { RestaurantService } from '../services/RestaurantService';
import { formatDistanceToNow, parseISO, isToday, startOfDay, endOfDay } from 'date-fns';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// Define interface for any extra fields that might be present on orders from the backend but not in our types
interface OrderWithMeta extends Order {
  tableNumber?: string;
  customerName?: string;
}

const LiveOrders: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [orders, setOrders] = React.useState<OrderWithMeta[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithMeta | null>(null);
  const [orderDetailsVisible, setOrderDetailsVisible] = React.useState<boolean>(false);
  const [newOrdersCount, setNewOrdersCount] = React.useState<number>(0);
  
  // Restaurant selection state
  const [restaurants, setRestaurants] = React.useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<string>('');
  const [loadingRestaurants, setLoadingRestaurants] = React.useState<boolean>(false);
  const [wsConnected, setWsConnected] = React.useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(12); // 4 cards per row, 3 rows per page

  // Format currency helper function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date helper function
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Format relative time helper function
  const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'Unknown time';
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get status display name
  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.PREPARING:
        return 'Preparing';
      case OrderStatus.READY:
        return 'Ready';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  // Get status tag color
  const getStatusTagColor = (status: string): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.PREPARING:
        return 'processing';
      case OrderStatus.READY:
        return 'success';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Get next status based on current status
  const getNextStatus = (currentStatus: string): OrderStatus => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.DELIVERED;
      case OrderStatus.DELIVERED:
        return OrderStatus.COMPLETED;
      default:
        return OrderStatus.PREPARING;
    }
  };

  // Fetch restaurants when component mounts
  React.useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await RestaurantService.getAllRestaurants();
        
        // Ensure data is treated as a Restaurant array
        const restaurantData: any[] = Array.isArray(data) ? data : [];
        setRestaurants(restaurantData);

        // If we have restaurants, select the first one by default
        if (restaurantData.length > 0) {
          // Check if there's a saved restaurant ID in localStorage
          const savedRestaurantId = localStorage.getItem('currentRestaurantId');
          if (savedRestaurantId && restaurantData.some((r: any) => r._id === savedRestaurantId)) {
            setSelectedRestaurantId(savedRestaurantId);
          } else {
            setSelectedRestaurantId(restaurantData[0]._id);
            localStorage.setItem('currentRestaurantId', restaurantData[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        message.error('Failed to fetch restaurants. Please refresh the page.');
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Connect to WebSocket when selected restaurant changes
  React.useEffect(() => {
    if (!selectedRestaurantId) return;
    
    setLoading(true);
    setOrders([]);  // Clear orders when restaurant changes
    
    try {
      console.log(`Connecting to WebSocket for restaurant: ${selectedRestaurantId}`);
      // Save selected restaurant ID to localStorage
      localStorage.setItem('currentRestaurantId', selectedRestaurantId);
      
      // Initialize WebSocket connection for this restaurant
      WebSocketService.disconnect();  // Disconnect any existing connection first
      WebSocketService.connect(selectedRestaurantId);
      
      // Listen for connection events
      WebSocketService.addEventListener(WebSocketEventType.CONNECT, () => {
        console.log('WebSocket connected successfully');
        setWsConnected(true);
        message.success('Connected to live order updates');
      });
      
      WebSocketService.addEventListener(WebSocketEventType.DISCONNECT, () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        message.warning('Lost connection to live order updates');
      });
      
      // Initialize order service context
      OrderService.setRestaurantContext(selectedRestaurantId);
      
      // Fetch initial orders
      fetchOrders();
      
      // Set up WebSocket event listeners
      setupWebSocketListeners();

      // Set up connection status check at regular intervals
      const connectionCheckInterval = setInterval(() => {
        if (!WebSocketService.isConnected()) {
          console.log('WebSocket disconnected, attempting to reconnect...');
          WebSocketService.connect(selectedRestaurantId);
        }
      }, 30000); // Every 30 seconds
      
      // Clean up WebSocket listeners and interval when component unmounts or restaurant changes
      return () => {
        try {
          console.log('Cleaning up WebSocket connection and intervals');
          clearInterval(connectionCheckInterval);
          WebSocketService.removeAllEventListeners();
          WebSocketService.disconnect();
        } catch (error) {
          console.error('Error cleaning up resources:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      message.error('Failed to connect to real-time order updates. Please refresh the page.');
      setLoading(false);
    }
  }, [selectedRestaurantId]);  // Re-run this effect when the selected restaurant changes
  
  // Set up WebSocket event listeners
  const setupWebSocketListeners = () => {
    try {
      console.log('Setting up WebSocket event listeners');
      
      // Listen for new orders - with restaurant filtering
      OrderService.onNewOrder((order: OrderWithMeta) => {
        console.log('New order received in LiveOrders component:', order);
        // Ensure order has all necessary fields
        if (!order || !order._id) {
          console.error('Received invalid order data:', order);
          return;
        }
        
        // Filter by restaurant ID - only add if it matches the selected restaurant
        if (order.restaurantId !== selectedRestaurantId) {
          console.log(`Order ${order._id} is for restaurant ${order.restaurantId}, but we're viewing ${selectedRestaurantId} - ignoring`);
          return;
        }
        
        setOrders((prevOrders: OrderWithMeta[]) => {
          // Check if order already exists
          const exists = prevOrders.some(existingOrder => existingOrder._id === order._id);
          if (exists) {
            return prevOrders;
          }
          return [order, ...prevOrders];
        });
        
        setNewOrdersCount((prev: number) => prev + 1);
        notification.info({
          message: 'New Order Received',
          description: `Order #${order.orderNumber || 'New'} has been received.`,
          placement: 'topRight'
        });
      });
      
      // Listen for order updates - with restaurant filtering
      OrderService.onOrderUpdated((updatedOrder: OrderWithMeta) => {
        console.log('Order update received in LiveOrders component:', updatedOrder);
        if (!updatedOrder || !updatedOrder._id) {
          console.error('Received invalid order update data:', updatedOrder);
          return;
        }
        
        // Filter by restaurant ID - only update if it matches the selected restaurant
        if (updatedOrder.restaurantId !== selectedRestaurantId) {
          console.log(`Order update ${updatedOrder._id} is for restaurant ${updatedOrder.restaurantId}, but we're viewing ${selectedRestaurantId} - ignoring`);
          return;
        }
        
        setOrders((prevOrders: OrderWithMeta[]) => prevOrders.map((order: OrderWithMeta) => 
          order._id === updatedOrder._id ? updatedOrder : order
        ));
        
        // If this order is currently selected, update it
        if (selectedOrder && selectedOrder._id === updatedOrder._id) {
          setSelectedOrder(updatedOrder);
        }
      });
      
      // Listen for order cancellations - with restaurant filtering
      OrderService.onOrderCancelled((cancelledOrder: OrderWithMeta) => {
        console.log('Order cancellation received in LiveOrders component:', cancelledOrder);
        if (!cancelledOrder || !cancelledOrder._id) {
          console.error('Received invalid order cancellation data:', cancelledOrder);
          return;
        }
        
        // Filter by restaurant ID - only update if it matches the selected restaurant
        if (cancelledOrder.restaurantId !== selectedRestaurantId) {
          console.log(`Order cancellation ${cancelledOrder._id} is for restaurant ${cancelledOrder.restaurantId}, but we're viewing ${selectedRestaurantId} - ignoring`);
          return;
        }
        
        setOrders((prevOrders: OrderWithMeta[]) => prevOrders.map((order: OrderWithMeta) => 
          order._id === cancelledOrder._id ? cancelledOrder : order
        ));
        
        notification.warning({
          message: 'Order Cancelled',
          description: `Order #${cancelledOrder.orderNumber || 'Unknown'} has been cancelled.`,
          placement: 'topRight'
        });
        
        // If this order is currently selected, update it
        if (selectedOrder && selectedOrder._id === cancelledOrder._id) {
          setSelectedOrder(cancelledOrder);
        }
      });
    } catch (error) {
      console.error('Error setting up WebSocket listeners:', error);
      message.error('Failed to setup real-time order notifications.');
    }
  };
  
  // Reset new orders counter
  const resetNewOrdersCount = () => {
    setNewOrdersCount(0);
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!selectedRestaurantId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching orders for restaurant: ${selectedRestaurantId}`);
      
      // Get all orders for the restaurant - removing the date filter
      const response = await OrderService.getAllOrders({
        restaurantId: selectedRestaurantId
      });
      
      if (response && response.data) {
        // Sort orders by creation date (newest first) without filtering by date
        const sortedOrders = (response.data as OrderWithMeta[]).sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        
        console.log(`Fetched ${sortedOrders.length} total orders for the restaurant`);
        setOrders(sortedOrders);
        resetNewOrdersCount(); // Reset counter after fetching
      } else {
        console.warn('No orders data returned from API');
        setOrders([]);
      }
      
      // Ensure WebSocket connection is active after fetching orders
      if (selectedRestaurantId && !WebSocketService.isConnected()) {
        console.log('WebSocket not connected, reconnecting...');
        WebSocketService.connect(selectedRestaurantId);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setCurrentPage(1);
    setPageSize(size);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order: OrderWithMeta) => 
    (order.orderNumber && order.orderNumber.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.customerName && order.customerName.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.tableId?.number && order.tableId.number.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Paginate filtered orders
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Open order details drawer
  const showOrderDetails = (order: OrderWithMeta) => {
    setSelectedOrder(order);
    setOrderDetailsVisible(true);
  };

  // Close order details drawer
  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetailsVisible(false);
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    console.log('🔄 Updating order status:', { orderId, status, currentTime: new Date().toISOString() });
    try {
      console.log('📞 Making API call to update order status...');
      const result = await OrderService.updateOrderStatus(orderId, status);
      console.log('✅ API call successful:', result);
      
      // Update local state
      setOrders((prevOrders: OrderWithMeta[]) => prevOrders.map((order: OrderWithMeta) => 
        order._id === orderId ? { ...order, status } : order
      ));
      console.log('🔄 Local state updated');
      
      // Close drawer if open with this order
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev: OrderWithMeta | null) => prev ? { ...prev, status } : null);
        console.log('🔄 Selected order updated in drawer');
      }
      
      notification.success({ 
        message: `Order status updated to ${getStatusDisplayName(status)}` 
      });
      console.log('✅ Status update completed successfully');
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      message.error('Failed to update order status. Please try again.');
    }
  };

  // Note: Individual item status updates are not implemented in the backend yet

  // Helper functions for item status handling
  const getItemStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#faad14';
      case 'preparing': return '#1890ff';
      case 'ready': return '#52c41a';
      case 'served': return '#8c8c8c';
      default: return '#d9d9d9';
    }
  };

  const getItemStatusDisplayName = (status: string): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'served': return 'Served';
      default: return 'Unknown';
    }
  };

  const getNextItemStatus = (status: string): string | null => {
    switch (status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const getItemStatusButtonText = (status: string): string => {
    switch (status) {
      case 'pending': return 'Start';
      case 'preparing': return 'Ready';
      case 'ready': return 'Serve';
      default: return 'Update';
    }
  };

  // Helper functions for wait time
  const getElapsedSeconds = (createdAt: string): number => {
    if (!createdAt) return 0;
    const now = new Date();
    const created = new Date(createdAt);
    return Math.floor((now.getTime() - created.getTime()) / 1000);
  };

  const formatWaitTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getHeaderBackgroundColor = (elapsedSeconds: number): string => {
    if (elapsedSeconds < 10 * 60) return '#52c41a'; // Green < 10 min
    if (elapsedSeconds < 15 * 60) return '#faad14'; // Orange < 15 min
    return '#ff4d4f'; // Red >= 15 min
  };

  const getHeaderTextColor = (elapsedSeconds: number): string => {
    return '#ffffff'; // White text for all backgrounds
  };

  // OrderCard component for displaying individual orders
  const OrderCard: React.FC<{ order: OrderWithMeta }> = ({ order }: { order: OrderWithMeta }) => {
    const elapsedSeconds = getElapsedSeconds(order.createdAt ? String(order.createdAt) : '');
    const waitTimeDisplay = formatWaitTime(elapsedSeconds);
    const headerBgColor = getHeaderBackgroundColor(elapsedSeconds);
    const headerTextColor = getHeaderTextColor(elapsedSeconds);
    const isOverdue = elapsedSeconds > 20 * 60;

    return (
      <Card
        style={{
          borderRadius: '12px',
          height: '100%',
          minHeight: '350px',
          border: '2px solid #e8e8e8',
          overflow: 'visible',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{ 
          padding: '0', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff'
        }}
      >
        {/* Header with timer and order info */}
        <div style={{
          backgroundColor: headerBgColor,
          color: headerTextColor,
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e8e8e8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Text strong style={{ fontSize: '18px', color: headerTextColor }}>
              #{order.orderNumber}
            </Text>
            {order.tableId?.number && (
              <div style={{
                backgroundColor: elapsedSeconds < 15 * 60 && elapsedSeconds >= 10 * 60 
                  ? 'rgba(0,0,0,0.2)' // Dark background on orange
                  : 'rgba(255,255,255,0.3)', // Light background on green/red
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                color: headerTextColor,
                border: 'none'
              }}>
                {order.tableId.number}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text strong style={{ 
              fontSize: '20px', 
              color: headerTextColor,
              fontWeight: 'bold'
            }}>
              {waitTimeDisplay}
            </Text>
            <br />
            <Text style={{ fontSize: '12px', color: headerTextColor, opacity: 0.9 }}>
              {formatDate(order.createdAt ? String(order.createdAt) : null)?.split(' ')[1]}
            </Text>
          </div>
        </div>

        {/* Customer info */}
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${isDarkMode ? '#334155' : '#f0f0f0'}`
        }}>
          <div>
            <Text strong style={{ fontSize: '14px', color: isDarkMode ? '#f8fafc' : '#262626' }}>
              {order.customerName || 'Walk-in Customer'}
            </Text>
          </div>
          <Text style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#8c8c8c' }}>
            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
          </Text>
        </div>

        {/* Order items with individual status */}
        <div style={{ 
          padding: '0', 
          flex: 1,
          overflowY: 'auto' 
        }}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item: any, index: number) => (
              <div key={index} style={{
                padding: '12px 16px',
                borderBottom: index < order.items.length - 1 ? `1px solid ${isDarkMode ? '#334155' : '#f0f0f0'}` : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: '14px', color: isDarkMode ? '#f8fafc' : '#262626' }}>
                    {item.name || item.menuItem?.name}
                  </Text>
                  <br />
                  <Text style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#8c8c8c' }}>
                    Qty: {item.quantity}
                  </Text>
                  
                  {/* Modifiers Section */}
                  <div style={{ 
                    marginTop: '4px',
                    fontSize: '11px',
                    color: isDarkMode ? '#94a3b8' : '#595959'
                  }}>
                    <Text style={{ fontWeight: '500', color: isDarkMode ? '#f8fafc' : '#262626' }}>Modifiers:</Text>
                    {item.modifiers && item.modifiers.length > 0 ? (
                      <Text style={{ 
                        color: isDarkMode ? '#94a3b8' : '#8c8c8c',
                        fontStyle: 'italic',
                        marginLeft: '4px'
                      }}>
                        {item.modifiers.map((mod: any) => 
                          typeof mod === 'string' ? mod : mod.name || 'Unknown modifier'
                        ).join(', ')}
                      </Text>
                    ) : (
                      <Text style={{ 
                        color: isDarkMode ? '#64748b' : '#bfbfbf',
                        fontStyle: 'italic',
                        marginLeft: '4px'
                      }}>
                        [empty section]
                      </Text>
                    )}
                  </div>
                  
                  <Text style={{ 
                    fontSize: '12px', 
                    color: isDarkMode ? '#94a3b8' : '#8c8c8c',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    Status: 
                    <span style={{ 
                      color: getItemStatusColor(item.status || 'pending'),
                      fontWeight: 'bold',
                      marginLeft: '4px'
                    }}>
                      {getItemStatusDisplayName(item.status || 'pending')}
                    </span>
                  </Text>
                  
                  {item.specialInstructions && (
                    <div style={{ 
                      marginTop: '4px',
                      fontSize: '11px',
                      color: '#faad14',
                      fontStyle: 'italic'
                    }}>
                      Note: {item.specialInstructions}
                    </div>
                  )}
                </div>
                {/* Individual item status updates not implemented yet */}
              </div>
            ))
          ) : (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Text style={{ color: isDarkMode ? '#94a3b8' : '#8c8c8c' }}>No items</Text>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div 
          style={{
            padding: '16px',
            borderTop: `1px solid ${isDarkMode ? '#334155' : '#f0f0f0'}`,
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="primary"
            style={{ 
              backgroundColor: '#722ed1', 
              borderColor: '#722ed1',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginRight: '8px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle print KOT
              message.success(`Printing KOT for Order #${order.orderNumber}`);
            }}
          >
            🖨️ Print KOT
          </Button>
          
          {/* Status Dropdown - Native Select for Better Reliability */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()}
            style={{ zIndex: 1000, position: 'relative' }}
          >
            <select
              value={order.status}
              style={{ 
                minWidth: 140, 
                padding: '6px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
              onChange={(e) => {
                const newStatus = e.target.value as OrderStatus;
                console.log('🎯 Native dropdown onChange triggered:', { 
                  orderId: order._id, 
                  newStatus, 
                  oldStatus: order.status,
                  event: e.type 
                });
                updateOrderStatus(order._id, newStatus);
              }}
              onClick={(e) => {
                console.log('🎯 Native dropdown clicked:', { orderId: order._id });
                e.stopPropagation();
              }}
              disabled={order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED}
            >
              <option value={OrderStatus.PENDING}>🟡 Pending</option>
              <option value={OrderStatus.PREPARING}>🔵 Preparing</option>
              <option value={OrderStatus.READY}>🟢 Ready</option>
              <option value={OrderStatus.DELIVERED}>✅ Delivered</option>
              <option value={OrderStatus.COMPLETED}>✔️ Completed</option>
              <option value={OrderStatus.CANCELLED}>❌ Cancelled</option>
            </select>
          </div>
        </div>
      </Card>
    );
  };


  return (
    <div className="live-orders-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
              Live Orders
            </Title>
            <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
              {filteredOrders.length} orders in progress
              {newOrdersCount > 0 && (
                <Badge count={newOrdersCount} style={{ marginLeft: 10 }} />
              )}
            </Text>
          </div>
          <Space>
            {selectedRestaurantId && (
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  fetchOrders();
                  resetNewOrdersCount();
                  message.success('Orders refreshed');
                }}
                loading={loading}
              >
                Refresh
              </Button>
            )}
          </Space>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: '16px' }}>
          <select
            style={{ 
              width: '300px', 
              padding: '8px', 
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            value={selectedRestaurantId || ''}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            disabled={loadingRestaurants}
          >
            <option value="">Select a restaurant</option>
            {restaurants.map((restaurant: any) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
          <Search
            placeholder="Search by order number, table or customer"
            onChange={handleSearchChange}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        
        {/* Connection Status */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Badge 
              status={wsConnected ? "success" : "error"} 
              text={wsConnected ? "Live updates connected" : "Disconnected from live updates"}
            />
          </Space>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading orders...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Empty
          description={
            searchQuery 
              ? "No orders matching your search" 
              : selectedRestaurantId 
                ? "No orders found for this restaurant"
                : "Please select a restaurant to view orders"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          {/* Cards Grid */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {paginatedOrders.map((order: OrderWithMeta) => (
              <Col key={order._id} xs={24} sm={12} md={12} lg={6} xl={6}>
                <OrderCard order={order} />
              </Col>
            ))}
          </Row>
          
          {/* Pagination */}
          {filteredOrders.length > pageSize && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              marginTop: '24px',
              padding: '16px 0',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredOrders.length}
                onChange={handlePageChange}
                onShowSizeChange={(current: number, size: number) => {
                  setCurrentPage(1);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total: number, range: [number, number]) => 
                  `${range[0]}-${range[1]} of ${total} orders`
                }
                pageSizeOptions={['12', '24', '36', '48']}
                />
              </div>
          )}
        </>
      )}
      
      {/* Order Details Drawer */}
      <Drawer
      title={selectedOrder ? `Order #${selectedOrder.orderNumber} Details` : 'Order Details'}
      placement="right"
      onClose={closeOrderDetails}
      open={orderDetailsVisible}
      width={500}
      extra={
        selectedOrder && selectedOrder.status !== OrderStatus.COMPLETED && selectedOrder.status !== OrderStatus.CANCELLED ? (
          <Space>
            <Button 
              type="primary"
              onClick={() => {
                if (selectedOrder) {
                  updateOrderStatus(selectedOrder._id, getNextStatus(selectedOrder.status as string));
                }
              }}
            >
                {selectedOrder?.status === OrderStatus.PENDING ? 'Accept Order' : 
               selectedOrder?.status === OrderStatus.PREPARING ? 'Mark Ready' :
               selectedOrder?.status === OrderStatus.READY ? 'Mark Delivered' :
               selectedOrder?.status === OrderStatus.DELIVERED ? 'Complete' : 'Update'}
            </Button>
            <Button 
              danger
              onClick={() => {
                if (selectedOrder) {
                  updateOrderStatus(selectedOrder._id, OrderStatus.CANCELLED);
                }
              }}
            >
              Cancel Order
            </Button>
          </Space>
        ) : null
      }
      >
        {selectedOrder && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Status">
                <Tag color={getStatusTagColor(selectedOrder.status as string)}>
                  {getStatusDisplayName(selectedOrder.status as string)}
                </Tag>
              </Descriptions.Item>
              {selectedOrder.customerName && (
                <Descriptions.Item label="Customer">
                  {selectedOrder.customerName}
                </Descriptions.Item>
              )}
              {selectedOrder.tableId?.number && (
                <Descriptions.Item label="Table">
                  {selectedOrder.tableId.number}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Order Time">
                {formatDate(selectedOrder.createdAt ? String(selectedOrder.createdAt) : null)}
              </Descriptions.Item>
              <Descriptions.Item label="Time Ago">
                {formatRelativeTime(selectedOrder.createdAt ? String(selectedOrder.createdAt) : null)}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                {formatCurrency(selectedOrder.total || 0)}
              </Descriptions.Item>
              {selectedOrder.specialInstructions && (
                <Descriptions.Item label="Special Instructions">
                  {selectedOrder.specialInstructions}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <Divider orientation="left">Order Items</Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={selectedOrder.items || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{item.quantity}</Avatar>}
                    title={item.name}
                    description={
                      <>
                        {item.specialInstructions && <div>Note: {item.specialInstructions}</div>}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div>
                            <Text type="secondary">Modifiers:</Text>
                            <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                              {item.modifiers.map((mod: any, index: number) => (
                                <li key={index}>
                                  <Text>{mod.name}: </Text>
                                  {mod.selections && mod.selections.map((sel: any, idx: number) => (
                                    <Tag key={idx}>
                                      {sel.quantity}x {sel.name} ({formatCurrency(sel.price)})
                                    </Tag>
                                  ))}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    }
                  />
                  <div>
                    <div style={{ textAlign: 'right' }}>
                      <Text type="secondary">{formatCurrency(item.price)} each</Text>
                    </div>
                    <div>
                      <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            
            <Divider />
            
            <div style={{ textAlign: 'right' }}>
              <Text style={{ marginRight: '8px' }}>Subtotal:</Text>
              <Text strong>{formatCurrency(selectedOrder.subtotal || 0)}</Text>
            </div>
            {selectedOrder.tax !== undefined && (
              <div style={{ textAlign: 'right', margin: '8px 0' }}>
                <Text style={{ marginRight: '8px' }}>Tax:</Text>
                <Text strong>{formatCurrency(selectedOrder.tax)}</Text>
              </div>
            )}
            {selectedOrder.tip !== undefined && (
              <div style={{ textAlign: 'right', margin: '8px 0' }}>
                <Text style={{ marginRight: '8px' }}>Tip:</Text>
                <Text strong>{formatCurrency(selectedOrder.tip)}</Text>
              </div>
            )}
            <div style={{ textAlign: 'right', margin: '16px 0 0' }}>
              <Text style={{ marginRight: '8px' }} strong>Total:</Text>
              <Text strong style={{ fontSize: '18px' }}>{formatCurrency(selectedOrder.total || 0)}</Text>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default LiveOrders;