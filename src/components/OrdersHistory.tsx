import React, { useState, useEffect } from 'react';
import { Table, Typography, Tag, Space, Button, Spin, message } from 'antd';
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import OrderService from '../services/OrderService';
import { Order } from '../types/order';

const { Title } = Typography;

// Component-specific interface extending the Order type
interface OrderTableItem {
  key: string;
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

const OrdersHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
    
    // Set restaurant context for WebSocket if available from localStorage
    const restaurantId = localStorage.getItem('currentRestaurantId');
    if (restaurantId) {
      OrderService.setRestaurantContext(restaurantId);
    }
    
    return () => {
      // Clean up WebSocket connection when component unmounts
      OrderService.cleanup();
    };
  }, []);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrderService.getAllOrders();
      
      // Transform orders for table display
      const transformedOrders = response.data.map((order: Order) => ({
        key: order._id,
        id: order._id,
        orderNumber: order.orderNumber || `Order-${order._id.substring(0, 8)}`,
        customer: order.customerName || 'Guest',
        date: new Date(order.createdAt).toLocaleString(),
        status: order.status,
        total: order.total,
        items: order.items.length
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchOrders();
    message.info('Refreshing orders...');
  };
  
  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        switch (status) {
          case 'PENDING':
            color = 'blue';
            break;
          case 'CONFIRMED':
            color = 'cyan';
            break;
          case 'IN_PREPARATION':
            color = 'purple';
            break;
          case 'READY':
            color = 'orange';
            break;
          case 'DELIVERED':
            color = 'lime';
            break;
          case 'COMPLETED':
            color = 'green';
            break;
          case 'CANCELLED':
            color = 'red';
            break;
          default:
            color = 'blue';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => total ? `$${total.toFixed(2)}` : '$0.00',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            type="link"
            onClick={() => navigate(`/orders/history/${record.id}`)}
          >
            View
          </Button>
          <Button icon={<DeleteOutlined />} type="link" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Order History</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" tip="Loading orders..." />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No orders found' }}
        />
      )}
    </div>
  );
};

export default OrdersHistory;
