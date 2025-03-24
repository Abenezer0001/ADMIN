import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Order, OrderStatus } from '../types/order';
import { updateOrderStatus, cancelOrder } from '../redux/orderSlice';
import { showSuccess, showError, showWarning } from '../utils/notificationUtils';
import { getNextStatus, canCancelOrder } from '../utils/orderUtils';

/**
 * Hook for order-related actions
 */
const useOrderActions = () => {
  const dispatch = useDispatch();

  /**
   * Handle advancing an order to the next status
   * @param order Order to update
   */
  const handleAdvanceOrder = useCallback((order: Order) => {
    if (!order) {
      showError('Cannot update order: Order not found');
      return;
    }

    // Get the next status in the workflow
    const nextStatus = getNextStatus(order.status);
    
    // If the status didn't change, it's already at the final state
    if (nextStatus === order.status) {
      showWarning('Order is already in its final state');
      return;
    }

    // Dispatch the update action
    dispatch(updateOrderStatus({
      orderId: order._id,
      status: nextStatus
    }));

    // Show success message
    showSuccess(`Order #${order._id.substring(0, 8)} advanced to ${nextStatus}`);
  }, [dispatch]);

  /**
   * Handle cancelling an order
   * @param order Order to cancel
   */
  const handleCancelOrder = useCallback((order: Order) => {
    if (!order) {
      showError('Cannot cancel order: Order not found');
      return;
    }

    // Check if the order can be cancelled
    if (!canCancelOrder(order.status)) {
      showWarning(`Cannot cancel order in ${order.status} status`);
      return;
    }

    // Dispatch the cancel action
    dispatch(cancelOrder(order._id));

    // Show success message
    showSuccess(`Order #${order._id.substring(0, 8)} has been cancelled`);
  }, [dispatch]);

  /**
   * Handle manually setting an order status
   * @param order Order to update
   * @param status New status
   */
  const handleSetOrderStatus = useCallback((order: Order, status: OrderStatus) => {
    if (!order) {
      showError('Cannot update order: Order not found');
      return;
    }

    // If the status didn't change, do nothing
    if (status === order.status) {
      showWarning('Order status is already set to ' + status);
      return;
    }

    // Dispatch the update action
    dispatch(updateOrderStatus({
      orderId: order._id,
      status
    }));

    // Show success message
    showSuccess(`Order #${order._id.substring(0, 8)} updated to ${status}`);
  }, [dispatch]);

  return {
    handleAdvanceOrder,
    handleCancelOrder,
    handleSetOrderStatus
  };
};

export default useOrderActions;
