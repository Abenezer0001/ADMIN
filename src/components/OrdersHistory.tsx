import React, { useState } from 'react';
import { Table, Typography, Tag, Space, Button } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface Order {
  key: string;
  id: string;
  customer: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
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
        if (status === 'completed') {
          color = 'green';
        } else if (status === 'cancelled') {
          color = 'red';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toFixed(2)}`,
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

  const data: Order[] = [
    {
      key: '1',
      id: 'ORD-001',
      customer: 'John Doe',
      date: '2024-02-20',
      status: 'completed',
      total: 125.99,
    },
    {
      key: '2',
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2024-02-20',
      status: 'pending',
      total: 75.50,
    },
    {
      key: '3',
      id: 'ORD-003',
      customer: 'Bob Johnson',
      date: '2024-02-19',
      status: 'cancelled',
      total: 45.99,
    },
  ];

  return (
    <div>
      <Title level={2}>Orders</Title>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Orders;
