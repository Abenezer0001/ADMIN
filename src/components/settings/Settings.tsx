import React from 'react';
import { Card, Row, Col, Typography, Switch, Form, Input, Button, Select } from 'antd';
import { UserOutlined, BellOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div>
      <Title level={2}>Settings</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          notifications: true,
          language: 'en',
          timezone: 'UTC+0',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title={<><UserOutlined /> Profile Settings</>}>
              <Form.Item
                name="name"
                label="Display Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={<><BellOutlined /> Notification Settings</>}>
              <Form.Item
                name="notifications"
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="orderAlerts"
                label="Order Alerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={<><GlobalOutlined /> Regional Settings</>}>
              <Form.Item name="language" label="Language">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                </Select>
              </Form.Item>
              <Form.Item name="timezone" label="Timezone">
                <Select>
                  <Option value="UTC+0">UTC+0</Option>
                  <Option value="UTC+1">UTC+1</Option>
                  <Option value="UTC+2">UTC+2</Option>
                  <Option value="UTC+3">UTC+3</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={<><LockOutlined /> Security Settings</>}>
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, message: 'Please input your new password!' }]}
              >
                <Input.Password />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
