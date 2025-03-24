import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../types/order';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Fetch orders
    fetchOrdersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
      state.loading = false;
    },
    fetchOrdersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add new order (from WebSocket)
    addOrder(state, action: PayloadAction<Order>) {
      const newOrder = action.payload;
      // Check if order already exists
      if (!state.orders.some(order => order._id === newOrder._id)) {
        state.orders.unshift(newOrder);
      }
    },

    // Update order (from WebSocket)
    updateOrder(state, action: PayloadAction<Order>) {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex(order => order._id === updatedOrder._id);
      if (index !== -1) {
        state.orders[index] = updatedOrder;
      }
    },

    // Remove order (e.g., when cancelled)
    removeOrder(state, action: PayloadAction<string>) {
      state.orders = state.orders.filter(order => order._id !== action.payload);
    },

    // Set selected order
    setSelectedOrder(state, action: PayloadAction<Order | null>) {
      state.selectedOrder = action.payload;
    },

    // Update order status
    updateOrderStatusStart(state, action: PayloadAction<{ orderId: string, status: OrderStatus }>) {
      state.loading = true;
      state.error = null;
    },
    updateOrderStatusSuccess(state, action: PayloadAction<Order>) {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex(order => order._id === updatedOrder._id);
      if (index !== -1) {
        state.orders[index] = updatedOrder;
      }
      if (state.selectedOrder && state.selectedOrder._id === updatedOrder._id) {
        state.selectedOrder = updatedOrder;
      }
      state.loading = false;
    },
    updateOrderStatusFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  addOrder,
  updateOrder,
  removeOrder,
  setSelectedOrder,
  updateOrderStatusStart,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
} = orderSlice.actions;

export default orderSlice.reducer;
