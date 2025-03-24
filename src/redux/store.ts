import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import orderReducer from './orderSlice';
import { watchOrderSagas } from '../sagas/orderSagas';
import { watchWebSocketSagas } from '../sagas/websocketSagas';

// Root saga
function* rootSaga() {
  yield all([
    watchOrderSagas(),
    watchWebSocketSagas(),
  ]);
}

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
const store = configureStore({
  reducer: {
    orders: orderReducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

// Run the saga
sagaMiddleware.run(rootSaga);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
