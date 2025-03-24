import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  notification 
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { mockInventoryService } from '../services/mockService';
import { ItemData } from '../types/common';

// Define type for form values
type InventoryFormValues = {
  name: string;
  stock: number;
  price: number;
  description?: string;
};

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<ItemData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<ItemData | null>(null);
  const [form] = Form.useForm<InventoryFormValues>();

  const fetchInventoryItems = useCallback(async () => {
    try {
      const items = await mockInventoryService.getInventoryItems();
      setInventory(items);
    } catch (error) {
      notification.error({ 
        message: 'Failed to fetch inventory items',
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, []);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const columns: ColumnsType<ItemData> = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <span style={{ color: stock < 10 ? 'red' : 'inherit' }}>
          {stock}
        </span>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: ItemData) => (
        <>
          <Button onClick={() => editItem(record)}>Edit</Button>
          <Button 
            danger 
            onClick={() => deleteItem(record.id || '')}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const editItem = useCallback((item: ItemData) => {
    setCurrentItem(item);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: item.name,
      stock: item.stock,
      price: item.price,
      description: item.description
    });
  }, [form]);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      await mockInventoryService.deleteInventoryItem(itemId);
      fetchInventoryItems();
      notification.success({ message: 'Item deleted successfully' });
    } catch (error) {
      notification.error({ 
        message: 'Failed to delete item',
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [fetchInventoryItems]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    setCurrentItem(null);
    form.resetFields();
  }, [form]);

  const onFinish = useCallback(async (values: InventoryFormValues) => {
    try {
      if (currentItem && currentItem.id) {
        // Update existing item
        await mockInventoryService.updateInventoryItem(currentItem.id, {
          ...currentItem,
          ...values
        });
      } else {
        // Add new item
        await mockInventoryService.createInventoryItem({
          ...values,
          id: `item_${Date.now()}` // Generate a temporary ID
        });
      }
      fetchInventoryItems();
      setIsModalVisible(false);
      form.resetFields();
      notification.success({ message: 'Inventory item saved successfully' });
    } catch (error) {
      notification.error({ 
        message: 'Failed to save inventory item',
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [currentItem, fetchInventoryItems, form]);

  return (
    <div>
      <Button 
        type="primary" 
        onClick={() => {
          setCurrentItem(null);
          setIsModalVisible(true);
        }}
      >
        Add Inventory Item
      </Button>
      <Table 
        columns={columns} 
        dataSource={inventory} 
        rowKey="id"
      />

      <Modal
        title={currentItem ? "Edit Inventory Item" : "Add Inventory Item"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please input item name' }]}
          >
            <Input placeholder="Enter item name" />
          </Form.Item>
          <Form.Item
            name="stock"
            label="Current Stock"
            rules={[
              { required: true, message: 'Please input stock quantity' },
              { 
                validator: (_, value) => 
                  value >= 0 
                    ? Promise.resolve() 
                    : Promise.reject(new Error('Stock must be non-negative'))
              }
            ]}
          >
            <InputNumber 
              min={0} 
              placeholder="Enter stock quantity" 
              style={{ width: '100%' }} 
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Unit Price ($)"
            rules={[
              { required: true, message: 'Please input unit price' },
              { 
                validator: (_, value) => 
                  value >= 0 
                    ? Promise.resolve() 
                    : Promise.reject(new Error('Price must be non-negative'))
              }
            ]}
          >
            <InputNumber 
              min={0} 
              step={0.01} 
              placeholder="Enter unit price" 
              style={{ width: '100%' }} 
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <Input.TextArea 
              placeholder="Enter item description" 
              rows={3} 
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
            >
              {currentItem ? 'Update' : 'Add'} Item
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
