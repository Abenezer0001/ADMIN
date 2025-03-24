export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PREPARATION = 'IN_PREPARATION',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  menuItem: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: {
    groupId: string;
    selections: {
      optionId: string;
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  specialInstructions?: string;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  restaurantId: string;
  tableId: string;
  tableNumber?: string;
  seat?: string;
  userId?: string;
  items: OrderItem[];
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  specialInstructions?: string;
  estimatedPreparationTime?: number;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  createdAt: string;
  updatedAt: string;
}
