import { toast, ToastOptions } from 'react-toastify';
import { Order, OrderStatus } from '../types/order';

// Default toast configuration
const defaultToastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Show a success notification
 * @param message Message to display
 */
export const showSuccess = (message: string): void => {
  toast.success(message, defaultToastConfig);
};

/**
 * Show an error notification
 * @param message Message to display
 */
export const showError = (message: string): void => {
  toast.error(message, {
    ...defaultToastConfig,
    autoClose: 7000, // Error messages stay longer
  });
};

/**
 * Show an info notification
 * @param message Message to display
 */
export const showInfo = (message: string): void => {
  toast.info(message, defaultToastConfig);
};

/**
 * Show a warning notification
 * @param message Message to display
 */
export const showWarning = (message: string): void => {
  toast.warning(message, defaultToastConfig);
};

/**
 * Show a notification for a new order
 * @param order New order
 */
export const notifyNewOrder = (order: Order): void => {
  const customerName = order.customer?.name || 'Customer';
  const tableNumber = order.tableNumber ? `Table #${order.tableNumber}` : 'Unknown table';
  
  toast.success(`New order received from ${customerName} (${tableNumber})`, {
    ...defaultToastConfig,
    autoClose: 8000,
    className: 'new-order-toast',
  });
};

/**
 * Show a notification for an order status update
 * @param order Updated order
 * @param previousStatus Previous order status
 */
export const notifyOrderStatusUpdate = (order: Order, previousStatus?: OrderStatus): void => {
  if (!previousStatus || previousStatus === order.status) return;
  
  const customerName = order.customer?.name || 'Customer';
  const tableNumber = order.tableNumber ? `Table #${order.tableNumber}` : 'Unknown table';
  
  let message = `Order for ${customerName} (${tableNumber}) `;
  
  switch (order.status) {
    case OrderStatus.PREPARING:
      message += 'is now being prepared';
      toast.info(message, defaultToastConfig);
      break;
    case OrderStatus.READY:
      message += 'is ready for delivery';
      toast.success(message, defaultToastConfig);
      break;
    case OrderStatus.DELIVERED:
      message += 'has been delivered';
      toast.success(message, defaultToastConfig);
      break;
    case OrderStatus.CANCELLED:
      message += 'has been cancelled';
      toast.warning(message, defaultToastConfig);
      break;
    default:
      break;
  }
};

/**
 * Show a notification for WebSocket connection status
 * @param connected Boolean indicating if connected
 */
export const notifyWebSocketStatus = (connected: boolean): void => {
  if (connected) {
    toast.success('Connected to live order updates', {
      ...defaultToastConfig,
      autoClose: 3000,
    });
  } else {
    toast.error('Disconnected from live order updates. Attempting to reconnect...', {
      ...defaultToastConfig,
      autoClose: false, // Stay until reconnected
    });
  }
};
