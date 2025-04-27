import { User } from './user';
import { Restaurant } from './restaurant';
import { Table } from './table';
import { MenuItem } from './menuItem';

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface ModifierSelection {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItemModifier {
  _id?: string;
  name: string;
  selections: ModifierSelection[];
}

export interface OrderItem {
  _id?: string;
  menuItem: string | MenuItem;
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
  notes?: string;
  modifiers?: OrderItemModifier[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  restaurantId: string | Restaurant;
  userId?: string | User;
  tableId?: string | Table;
  tableNumber?: string;
  orderType: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  specialInstructions?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  estimatedPreparationTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  orderType?: string;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  tableNumber?: string;
}
