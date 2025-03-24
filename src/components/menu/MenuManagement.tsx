import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import {
  AppstoreOutlined,
  TagsOutlined,
  SettingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const MenuManagement: React.FC = () => {
  const navigate = useNavigate();

  const menuCards = [
    {
      title: 'Items',
      icon: <AppstoreOutlined style={{ fontSize: '24px' }} />,
      description: 'Manage menu items and their details',
      path: '/items',
    },
    {
      title: 'Categories',
      icon: <TagsOutlined style={{ fontSize: '24px' }} />,
      description: 'Organize items into categories',
      path: '/categories',
    },
    {
      title: 'Modifier Groups',
      icon: <SettingOutlined style={{ fontSize: '24px' }} />,
      description: 'Manage item modifiers and options',
      path: '/modifier-groups',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Menu Management</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Add New Item
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {menuCards.map((card, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              hoverable
              onClick={() => navigate(card.path)}
              style={{ height: '100%' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                {card.icon}
              </div>
              <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
                {card.title}
              </Title>
              <p style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
                {card.description}
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MenuManagement;
