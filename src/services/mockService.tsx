import React, { useEffect } from 'react';
import { User, Order, Item } from '../types/common';

declare global {
  interface Window {
    localStorage: Storage;
  }
}

// Mock service to simulate backend interactions
const STORAGE_KEYS = {
  USERS: 'inseat_users',
  ORDERS: 'inseat_orders',
  ITEMS: 'inseat_items'
};

export const mockUserService = {
  getUsers: async (): Promise<User[]> => {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const users = await mockUserService.getUsers();
    const newUser: User = {
      id: Date.now().toString(),
      ...userData
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, newUser]));
    return newUser;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const users = await mockUserService.getUsers();
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, ...userData } : user
    );
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    const updatedUser = updatedUsers.find(user => user.id === userId);
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const users = await mockUserService.getUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
  }
};

export const mockOrderService = {
  getOrders: async (): Promise<Order[]> => {
    const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return orders ? JSON.parse(orders) : [];
  },

  createOrder: async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    const orders = await mockOrderService.getOrders();
    const newOrder: Order = {
      id: Date.now().toString(),
      ...orderData
    };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([...orders, newOrder]));
    return newOrder;
  },

  updateOrder: async (orderId: string, orderData: Partial<Order>): Promise<Order> => {
    const orders = await mockOrderService.getOrders();
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, ...orderData } : order
    );
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    const updatedOrder = updatedOrders.find(order => order.id === orderId);
    if (!updatedOrder) throw new Error('Order not found');
    return updatedOrder;
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    const orders = await mockOrderService.getOrders();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredOrders));
  }
};

export const mockItemService = {
  getItems: async (): Promise<Item[]> => {
    const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return items ? JSON.parse(items) : [];
  },

  createItem: async (itemData: Omit<Item, 'id'>): Promise<Item> => {
    const items = await mockItemService.getItems();
    const newItem: Item = {
      id: Date.now().toString(),
      ...itemData
    };
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([...items, newItem]));
    return newItem;
  },

  updateItem: async (itemId: string, itemData: Partial<Item>): Promise<Item> => {
    const items = await mockItemService.getItems();
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, ...itemData } : item
    );
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));
    const updatedItem = updatedItems.find(item => item.id === itemId);
    if (!updatedItem) throw new Error('Item not found');
    return updatedItem;
  },

  deleteItem: async (itemId: string): Promise<void> => {
    const items = await mockItemService.getItems();
    const filteredItems = items.filter(item => item.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems));
  }
};
