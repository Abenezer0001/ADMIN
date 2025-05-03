import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchOrdersStart, 
  fetchOrdersSuccess, 
  fetchOrdersFailure,
  updateOrderStatusStart,
  updateOrderStatusSuccess,
  updateOrderStatusFailure
} from '../redux/orderSlice';
import { Order, OrderStatus } from '../types/order';
import axios from 'axios';
// Fetch all orders
function* fetchOrdersSaga() {
  try {
    const response = yield call(axios.get, `${import.meta.env.VITE_API_BASE_URL}/orders`);
    yield put(fetchOrdersSuccess(response.data));
  } catch (error: any) {
    yield put(fetchOrdersFailure(error.message || 'Failed to fetch orders'));
  }
}

// Update order status
function* updateOrderStatusSaga(action: PayloadAction<{ orderId: string, status: OrderStatus }>) {
  try {
    const { orderId, status } = action.payload;
    const response = yield call(
      axios.put, 
      `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/status`, 
      { status }
    );
    yield put(updateOrderStatusSuccess(response.data));
  } catch (error: any) {
    yield put(updateOrderStatusFailure(error.message || 'Failed to update order status'));
  }
}

// Watch order sagas
export function* watchOrderSagas() {
  yield takeLatest(fetchOrdersStart.type, fetchOrdersSaga);
  yield takeEvery(updateOrderStatusStart.type, updateOrderStatusSaga);
}
