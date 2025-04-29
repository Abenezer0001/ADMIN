import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus, PaymentStatus, OrdersResponse } from '../types/order';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: {
    restaurantId?: string;
    status?: OrderStatus;
    orderType?: string;
    paymentStatus?: PaymentStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
  };
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  },
  filters: {}
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Fetch orders
    fetchOrdersStart(state, action: PayloadAction<{ filters?: any, page?: number, limit?: number } | undefined>) {
      state.loading = true;
      state.error = null;
      
      // Update filters and pagination if provided
      if (action.payload) {
        if (action.payload.filters) {
          state.filters = {
            ...state.filters,
            ...action.payload.filters
          };
        }
        
        if (action.payload.page) {
          state.pagination.page = action.payload.page;
        }
        
        if (action.payload.limit) {
          state.pagination.limit = action.payload.limit;
        }
      }
    },
    
    fetchOrdersSuccess(state, action: PayloadAction<OrdersResponse>) {
      state.orders = action.payload.data;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    
    fetchOrdersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Set filters
    setOrderFilters(state, action: PayloadAction<any>) {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },

    // Reset filters
    resetOrderFilters(state) {
      state.filters = {};
      state.pagination.page = 1;
    },

    // Add new order (from WebSocket)
    addOrder(state, action: PayloadAction<Order>) {
      const newOrder = action.payload;
      
      // Check if the order matches current filters
      if (matchesFilters(newOrder, state.filters)) {
        // Check if order already exists
        if (!state.orders.some(order => order._id === newOrder._id)) {
          // Add at the beginning (newest first)
          state.orders.unshift(newOrder);
          
          // Update total count in pagination
          state.pagination.total += 1;
          state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
          
          // If we're already at the limit, remove the last item
          if (state.orders.length > state.pagination.limit) {
            state.orders.pop();
          }
        }
      }
    },

    // Update order (from WebSocket or API)
    updateOrder(state, action: PayloadAction<Order>) {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex(order => order._id === updatedOrder._id);
      
      if (index !== -1) {
        // Check if updated order still matches filters
        if (matchesFilters(updatedOrder, state.filters)) {
          state.orders[index] = updatedOrder;
        } else {
          // Remove if it no longer matches filters
          state.orders.splice(index, 1);
          state.pagination.total -= 1;
        }
        
        // If this is the selected order, update it too
        if (state.selectedOrder && state.selectedOrder._id === updatedOrder._id) {
          state.selectedOrder = updatedOrder;
        }
      } else if (matchesFilters(updatedOrder, state.filters)) {
        // Add if it now matches filters
        state.orders.unshift(updatedOrder);
        state.pagination.total += 1;
      }
    },

    // Remove order (e.g., when cancelled)
    removeOrder(state, action: PayloadAction<string>) {
      const orderId = action.payload;
      const index = state.orders.findIndex(order => order._id === orderId);
      
      if (index !== -1) {
        state.orders.splice(index, 1);
        state.pagination.total -= 1;
        state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
      }
      
      // Clear selected order if it was removed
      if (state.selectedOrder && state.selectedOrder._id === orderId) {
        state.selectedOrder = null;
      }
    },

    // Set selected order
    setSelectedOrder(state, action: PayloadAction<Order | null>) {
      state.selectedOrder = action.payload;
    },

    // Fetch order details
    fetchOrderDetailsStart(state, action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    
    fetchOrderDetailsSuccess(state, action: PayloadAction<Order>) {
      state.selectedOrder = action.payload;
      state.loading = false;
      
      // Update the order in the list if it exists
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    
    fetchOrderDetailsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update order status
    updateOrderStatusStart(state, action: PayloadAction<{ orderId: string, status: OrderStatus }>) {
      state.loading = true;
      state.error = null;
    },
    
    updateOrderStatusSuccess(state, action: PayloadAction<Order>) {
      const updatedOrder = action.payload;
      
      // Update in orders list if it matches filters
      if (matchesFilters(updatedOrder, state.filters)) {
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        } else {
          // Add if not found and on first page
          if (state.pagination.page === 1) {
            state.orders.unshift(updatedOrder);
            if (state.orders.length > state.pagination.limit) {
              state.orders.pop();
            }
          }
        }
      } else {
        // Remove if no longer matches filters
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders.splice(index, 1);
        }
      }
      
      // Update selected order if it matches
      if (state.selectedOrder && state.selectedOrder._id === updatedOrder._id) {
        state.selectedOrder = updatedOrder;
      }
      
      state.loading = false;
    },
    
    updateOrderStatusFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update payment status
    updatePaymentStatusStart(state, action: PayloadAction<{ orderId: string, paymentStatus: PaymentStatus }>) {
      state.loading = true;
      state.error = null;
    },
    
    updatePaymentStatusSuccess(state, action: PayloadAction<Order>) {
      // Use the same logic as updateOrderStatusSuccess
      const updatedOrder = action.payload;
      
      if (matchesFilters(updatedOrder, state.filters)) {
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        } else if (state.pagination.page === 1) {
          state.orders.unshift(updatedOrder);
          if (state.orders.length > state.pagination.limit) {
            state.orders.pop();
          }
        }
      } else {
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders.splice(index, 1);
        }
      }
      
      if (state.selectedOrder && state.selectedOrder._id === updatedOrder._id) {
        state.selectedOrder = updatedOrder;
      }
      
      state.loading = false;
    },
    
    updatePaymentStatusFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Create new order
    createOrderStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    createOrderSuccess(state, action: PayloadAction<Order>) {
      // Add the new order to the list if it matches current filters
      const newOrder = action.payload;
      
      if (matchesFilters(newOrder, state.filters) && state.pagination.page === 1) {
        state.orders.unshift(newOrder);
        state.pagination.total += 1;
        
        if (state.orders.length > state.pagination.limit) {
          state.orders.pop();
        }
      }
      
      state.loading = false;
    },
    
    createOrderFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Cancel order
    cancelOrderStart(state, action: PayloadAction<{ orderId: string, reason?: string }>) {
      state.loading = true;
      state.error = null;
    },
    
    cancelOrderSuccess(state, action: PayloadAction<Order>) {
      const cancelledOrder = action.payload;
      
      // Update in orders list if it still matches filters
      if (matchesFilters(cancelledOrder, state.filters)) {
        const index = state.orders.findIndex(order => order._id === cancelledOrder._id);
        if (index !== -1) {
          state.orders[index] = cancelledOrder;
        }
      } else {
        // Remove if no longer matches filters
        const index = state.orders.findIndex(order => order._id === cancelledOrder._id);
        if (index !== -1) {
          state.orders.splice(index, 1);
        }
      }
      
      // Update selected order if it matches
      if (state.selectedOrder && state.selectedOrder._id === cancelledOrder._id) {
        state.selectedOrder = cancelledOrder;
      }
      
      state.loading = false;
    },
    
    cancelOrderFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Helper function to check if an order matches the current filters
function matchesFilters(order: Order, filters: any): boolean {
  if (filters.restaurantId && order.restaurantId !== filters.restaurantId) {
    return false;
  }
  
  if (filters.status && order.status !== filters.status) {
    return false;
  }
  
  if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) {
    return false;
  }
  
  if (filters.orderType && order.orderType !== filters.orderType) {
    return false;
  }
  
  // Date range filters would require additional checking
  // if (filters.startDate || filters.endDate) {...}
  
  return true;
}

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  setOrderFilters,
  resetOrderFilters,
  addOrder,
  updateOrder,
  removeOrder,
  setSelectedOrder,
  fetchOrderDetailsStart,
  fetchOrderDetailsSuccess,
  fetchOrderDetailsFailure,
  updateOrderStatusStart,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  updatePaymentStatusStart,
  updatePaymentStatusSuccess,
  updatePaymentStatusFailure,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  cancelOrderStart,
  cancelOrderSuccess,
  cancelOrderFailure,
} = orderSlice.actions;

export default orderSlice.reducer;
