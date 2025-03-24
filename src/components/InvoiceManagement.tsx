import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Typography,
  notification 
} from 'antd';
import { mockInvoiceService } from '../services/mockService';

const { Text } = Typography;
const { Option } = Select;

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Online Payment'];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const fetchedInvoices = await mockInvoiceService.getInvoices();
      setInvoices(fetchedInvoices);
    } catch (error) {
      notification.error({ message: 'Failed to fetch invoices' });
    }
  };

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => viewInvoice(record)}>View</Button>
          <Button danger onClick={() => deleteInvoice(record.id)}>Delete</Button>
        </>
      ),
    },
  ];

  const viewInvoice = (invoice) => {
    setCurrentInvoice(invoice);
    setIsModalVisible(true);
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      await mockInvoiceService.deleteInvoice(invoiceId);
      fetchInvoices();
      notification.success({ message: 'Invoice deleted successfully' });
    } catch (error) {
      notification.error({ message: 'Failed to delete invoice' });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentInvoice(null);
  };

  const onFinish = async (values) => {
    try {
      const newInvoice = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        totalAmount: parseFloat(values.totalAmount)
      };

      await mockInvoiceService.createInvoice(newInvoice);
      fetchInvoices();
      setIsModalVisible(false);
      notification.success({ message: 'Invoice created successfully' });
    } catch (error) {
      notification.error({ message: 'Failed to create invoice' });
    }
  };

  return (
    <div>
      <Button 
        type="primary" 
        onClick={() => {
          setCurrentInvoice(null);
          setIsModalVisible(true);
        }}
      >
        Create Invoice
      </Button>
      <Table 
        columns={columns} 
        dataSource={invoices} 
        rowKey="id"
      />

      <Modal
        title={currentInvoice ? "Invoice Details" : "Create New Invoice"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {currentInvoice ? (
          <div>
            <Text strong>Invoice Number: </Text>
            <Text>{currentInvoice.invoiceNumber}</Text><br/>
            <Text strong>Customer Name: </Text>
            <Text>{currentInvoice.customerName}</Text><br/>
            <Text strong>Total Amount: </Text>
            <Text>${currentInvoice.totalAmount.toFixed(2)}</Text><br/>
            <Text strong>Payment Method: </Text>
            <Text>{currentInvoice.paymentMethod}</Text><br/>
            <Text strong>Date: </Text>
            <Text>{currentInvoice.date}</Text>
          </div>
        ) : (
          <Form onFinish={onFinish}>
            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[{ required: true, message: 'Please input customer name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="totalAmount"
              label="Total Amount ($)"
              rules={[{ required: true, message: 'Please input total amount' }]}
            >
              <Input type="number" step="0.01" />
            </Form.Item>
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select>
                {paymentMethods.map(method => (
                  <Option key={method} value={method}>{method}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="date"
              label="Invoice Date"
              rules={[{ required: true, message: 'Please select invoice date' }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create Invoice
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceManagement;
