import { Order, OrderStatus } from '../types/order';

/**
 * Get the appropriate color for an order status
 * @param status Order status
 * @returns CSS color string
 */
export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return '#FFA500'; // Orange
    case OrderStatus.PREPARING:
      return '#3498DB'; // Blue
    case OrderStatus.READY:
      return '#2ECC71'; // Green
    case OrderStatus.DELIVERED:
      return '#9B59B6'; // Purple
    case OrderStatus.CANCELLED:
      return '#E74C3C'; // Red
    default:
      return '#95A5A6'; // Gray
  }
};

/**
 * Calculate the total price of an order
 * @param order Order object
 * @returns Total price
 */
export const calculateOrderTotal = (order: Order): number => {
  if (!order || !order.items || !Array.isArray(order.items)) {
    return 0;
  }
  
  return order.items.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 1;
    return total + (itemPrice * itemQuantity);
  }, 0);
};

/**
 * Get the next status in the order workflow
 * @param currentStatus Current order status
 * @returns Next order status
 */
export const getNextStatus = (currentStatus: OrderStatus): OrderStatus => {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return OrderStatus.PREPARING;
    case OrderStatus.PREPARING:
      return OrderStatus.READY;
    case OrderStatus.READY:
      return OrderStatus.DELIVERED;
    default:
      return currentStatus; // No next status for DELIVERED or CANCELLED
  }
};

/**
 * Check if an order can be cancelled
 * @param status Order status
 * @returns Boolean indicating if order can be cancelled
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  // Orders can be cancelled if they are pending or preparing
  return status === OrderStatus.PENDING || status === OrderStatus.PREPARING;
};

/**
 * Sort orders by date (newest first)
 * @param orders Array of orders
 * @returns Sorted array of orders
 */
export const sortOrdersByDate = (orders: Order[]): Order[] => {
  if (!orders || !Array.isArray(orders)) {
    return [];
  }
  
  return [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Newest first
  });
};

/**
 * Filter orders by status
 * @param orders Array of orders
 * @param status Status to filter by
 * @returns Filtered array of orders
 */
export const filterOrdersByStatus = (orders: Order[], status: OrderStatus | null): Order[] => {
  if (!orders || !Array.isArray(orders)) {
    return [];
  }
  
  if (status === null) {
    return orders;
  }
  
  return orders.filter(order => order.status === status);
};

/**
 * Search orders by customer name or order ID
 * @param orders Array of orders
 * @param searchTerm Search term
 * @returns Filtered array of orders
 */
export const searchOrders = (orders: Order[], searchTerm: string): Order[] => {
  if (!orders || !Array.isArray(orders) || !searchTerm) {
    return orders || [];
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  return orders.filter(order => {
    const customerName = (order.customer?.name || '').toLowerCase();
    const orderId = (order._id || '').toLowerCase();
    const tableNumber = String(order.tableNumber || '').toLowerCase();
    
    return customerName.includes(term) || 
           orderId.includes(term) || 
           tableNumber.includes(term);
  });
};
