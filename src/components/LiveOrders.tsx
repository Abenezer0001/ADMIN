import React from 'react';
import { Spin, Table, Tag, Input, Button, Typography, Badge, Space, message, notification, Drawer, Descriptions, List, Avatar, Divider, Empty } from 'antd';
import { SearchOutlined, ReloadOutlined, BellOutlined, InfoCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import OrderService from '../services/OrderService';
import WebSocketService, { WebSocketEvents } from '../services/WebSocketService';
import { Order, OrderStatus } from '../types/order';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Title, Text } = Typography;

// Define interface for any extra fields that might be present on orders from the backend but not in our types
interface OrderWithMeta extends Order {
  tableNumber?: string;
  customerName?: string;
}

const LiveOrders: React.FC = () => {
  const [orders, setOrders] = React.useState<OrderWithMeta[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithMeta | null>(null);
  const [orderDetailsVisible, setOrderDetailsVisible] = React.useState<boolean>(false);
  const [newOrdersCount, setNewOrdersCount] = React.useState<number>(0);

  // Format currency helper function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date helper function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Connect to WebSocket when component mounts
  React.useEffect(() => {
    setLoading(true);
    
    // Get restaurant ID from localStorage or context
    const restaurantId = localStorage.getItem('currentRestaurantId');
    try {
      if (restaurantId) {
        // Initialize WebSocket connection for this restaurant
        OrderService.setRestaurantContext(restaurantId);
        fetchOrders();
        
        // Set up WebSocket event listeners
        setupWebSocketListeners();
      } else {
        message.warning('No restaurant selected. Please select a restaurant first.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      message.error('Failed to connect to real-time order updates. Please refresh the page.');
      setLoading(false);
    }
    
    // Clean up WebSocket listeners when component unmounts
    return () => {
      try {
        OrderService.cleanup();
      } catch (error) {
        console.error('Error cleaning up WebSocket:', error);
      }
    };
  }, []);
  
  // Set up WebSocket event listeners
  const setupWebSocketListeners = () => {
    try {
      // Listen for new orders
      OrderService.onNewOrder((order: OrderWithMeta) => {
        setOrders((prevOrders: OrderWithMeta[]) => [order, ...prevOrders]);
        setNewOrdersCount((prev: number) => prev + 1);
        notification.info({
          message: 'New Order Received',
          description: `Order #${order.orderNumber} has been received.`,
          placement: 'topRight'
        });
      });
      
      // Listen for order updates
      OrderService.onOrderUpdated((updatedOrder: OrderWithMeta) => {
        setOrders((prevOrders: OrderWithMeta[]) => prevOrders.map((order: OrderWithMeta) => 
          order._id === updatedOrder._id ? updatedOrder : order
        ));
      });
      
      // Listen for order cancellations
      OrderService.onOrderCancelled((cancelledOrder: OrderWithMeta) => {
        setOrders((prevOrders: OrderWithMeta[]) => prevOrders.map((order: OrderWithMeta) => 
          order._id === cancelledOrder._id ? cancelledOrder : order
        ));
        notification.warning({
          message: 'Order Cancelled',
          description: `Order #${cancelledOrder.orderNumber} has been cancelled.`,
          placement: 'topRight'
        });
      });
    } catch (error) {
      console.error('Error setting up WebSocket listeners:', error);
      message.error('Failed to setup real-time order notifications.');
    }
  };
  
  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrderService.getAllOrders({
        status: [
          OrderStatus.PENDING,
          OrderStatus.PREPARING,
          OrderStatus.READY
        ].join(',') // Only active orders
      });
      
      if (response && response.data) {
        setOrders(response.data as OrderWithMeta[]);
        setNewOrdersCount(0); // Reset counter after fetching
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order: OrderWithMeta) => 
    (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.tableNumber && order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    try {
      await OrderService.updateOrderStatus(orderId, status);
      
      // Update local state
      setOrders(prevOrders => prevOrders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
      
      // Close drawer if open with this order
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev: OrderWithMeta | null) => prev ? { ...prev, status } : null);
      }
      
      notification.success({ 
        message: `Order status updated to ${getStatusDisplayName(status)}` 
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status. Please try again.');
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
        return 'default';
      case OrderStatus.PREPARING:
        return 'processing';
      case OrderStatus.READY:
        return 'warning';
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

  // Get action buttons for order based on current status
  const getOrderActions = (order: OrderWithMeta) => {
    const nextStatus = getNextStatus(order.status as string);
    
    return (
      <Space>
        <Button 
          type="primary" 
          size="small"
          onClick={() => updateOrderStatus(order._id, nextStatus)}
          disabled={
            order.status === OrderStatus.COMPLETED ||
            order.status === OrderStatus.CANCELLED
          }
        >
          {order.status === OrderStatus.PENDING ? 'Confirm' : 
           order.status === OrderStatus.PREPARING ? 'Mark Ready' :
           order.status === OrderStatus.READY ? 'Mark Delivered' :
           order.status === OrderStatus.DELIVERED ? 'Complete' : 'Update'}
        </Button>
        {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED && (
          <Button 
            danger 
            size="small"
            onClick={() => updateOrderStatus(order._id, OrderStatus.CANCELLED)}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="text" 
          size="small" 
          icon={<InfoCircleOutlined />}
          onClick={() => showOrderDetails(order)}
        >
          Details
        </Button>
      </Space>
    );
  };

  // Table columns definition
  const columns: ColumnsType<OrderWithMeta> = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Table',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record: OrderWithMeta) => (
        <span>{record.items?.length || 0} items</span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => formatCurrency(total || 0),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusTagColor(status)}>
          {getStatusDisplayName(status)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: OrderWithMeta) => getOrderActions(record),
    },
  ];

  return (
    <div className="live-orders-container">
      <div className="header-container" style={{ marginBottom: '16px' }}>
        <Space size="large" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0 }}>
            Live Orders
            {newOrdersCount > 0 && (
              <Badge 
                count={newOrdersCount} 
                style={{ backgroundColor: '#52c41a', marginLeft: '8px' }}
              />
            )}
          </Title>
          <Space>
            <Search
              placeholder="Search orders..."
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchOrders}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </Space>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading orders...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Empty 
          description={
            searchQuery 
              ? "No orders matching your search" 
              : "No active orders at the moment"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table 
          columns={columns} 
          dataSource={filteredOrders}
          rowKey="_id"
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '0 20px' }}>
                <strong>Order Items:</strong>
                <List
                  itemLayout="horizontal"
                  dataSource={record.items || []}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${item.quantity}x ${item.name}`}
                        description={item.notes ? `Note: ${item.notes}` : null}
                      />
                      <div>{formatCurrency(item.price * item.quantity)}</div>
                    </List.Item>
                  )}
                />
              </div>
            ),
          }}
        />
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
                {selectedOrder?.status === OrderStatus.PENDING ? 'Confirm' : 
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
              {selectedOrder.tableNumber && (
                <Descriptions.Item label="Table">
                  {selectedOrder.tableNumber}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Order Time">
                {formatDate(selectedOrder.createdAt as string)}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                {formatCurrency(selectedOrder.total || 0)}
              </Descriptions.Item>
              {selectedOrder.notes && (
                <Descriptions.Item label="Notes">
                  {selectedOrder.notes}
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
                        {item.notes && <div>Note: {item.notes}</div>}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div>
                            <Text type="secondary">Modifiers:</Text>
                            <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                              {item.modifiers.map((mod: any, index: number) => (
                                <li key={index}>
                                  <Text>{mod.name}: </Text>
                                  {mod.selections.map((sel: any, idx: number) => (
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
