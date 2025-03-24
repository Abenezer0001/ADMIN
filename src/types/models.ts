// Item model
export interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Order model
export interface Order {
  id: string;
  items: string[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  timestamp: string;
}

// User model
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

// Invoice model
export interface Invoice {
  id: string;
  orderIds: string[];
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
  date: string;
  customerName: string;
}

// Inventory Item model
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderPoint: number;
}
