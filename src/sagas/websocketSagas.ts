import { call, put, take, fork, takeEvery, cancelled } from 'redux-saga/effects';
import { eventChannel, EventChannel } from 'redux-saga';
import { addOrder, updateOrder, removeOrder } from '../redux/orderSlice';
import websocketService, { WebSocketEventType } from '../services/websocketService';
import { Order } from '../types/order';

// Action types
const WEBSOCKET_CONNECT = 'websocket/connect';
const WEBSOCKET_DISCONNECT = 'websocket/disconnect';

// Action creators
export const connectWebSocket = () => ({ type: WEBSOCKET_CONNECT });
export const disconnectWebSocket = () => ({ type: WEBSOCKET_DISCONNECT });

// Create an event channel for WebSocket events
function createWebSocketChannel() {
  return eventChannel(emit => {
    // New order event
    const newOrderHandler = (order: Order) => {
      emit(addOrder(order));
    };

    // Order update event
    const orderUpdateHandler = (order: Order) => {
      emit(updateOrder(order));
    };

    // Order cancellation event
    const orderCancellationHandler = (order: Order) => {
      emit(updateOrder(order));
    };

    // Add event listeners
    websocketService.addEventListener(WebSocketEventType.NEW_ORDER, newOrderHandler);
    websocketService.addEventListener(WebSocketEventType.ORDER_UPDATE, orderUpdateHandler);
    websocketService.addEventListener(WebSocketEventType.ORDER_CANCELLED, orderCancellationHandler);

    // Return unsubscribe function
    return () => {
      websocketService.removeEventListener(WebSocketEventType.NEW_ORDER, newOrderHandler);
      websocketService.removeEventListener(WebSocketEventType.ORDER_UPDATE, orderUpdateHandler);
      websocketService.removeEventListener(WebSocketEventType.ORDER_CANCELLED, orderCancellationHandler);
    };
  });
}

// Handle WebSocket messages
function* handleWebSocketMessages() {
  // Create a channel to handle WebSocket events
  const channel: EventChannel<any> = yield call(createWebSocketChannel);
  
  try {
    while (true) {
      // Take a message from the channel
      const action = yield take(channel);
      // Dispatch the action to Redux
      yield put(action);
    }
  } finally {
    // If the saga is cancelled, close the channel
    if (yield cancelled()) {
      channel.close();
    }
  }
}

// Connect to WebSocket
function* connectWebSocketSaga() {
  try {
    // Connect to WebSocket server
    websocketService.connect();
    // Start handling messages
    yield fork(handleWebSocketMessages);
  } catch (error) {
    console.error('WebSocket connection error:', error);
  }
}

// Disconnect from WebSocket
function* disconnectWebSocketSaga() {
  try {
    websocketService.disconnect();
  } catch (error) {
    console.error('WebSocket disconnection error:', error);
  }
}

// Watch WebSocket sagas
export function* watchWebSocketSagas() {
  yield takeEvery(WEBSOCKET_CONNECT, connectWebSocketSaga);
  yield takeEvery(WEBSOCKET_DISCONNECT, disconnectWebSocketSaga);
}
