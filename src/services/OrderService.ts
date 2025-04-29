import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import { Order, OrderStatus, PaymentStatus, OrdersResponse } from '../types/order';
import WebSocketService, { WebSocketEvents, OrderEventData, OrderAlert } from './websocketService';
import { isDemoMode } from './AuthService';

class OrderService {
  private baseUrl = `${API_BASE_URL}/orders`;
  private wsService = WebSocketService;
  private currentRestaurantId: string | null = null;

  // Set current restaurant context for WebSocket
  public setRestaurantContext(restaurantId: string): void {
    this.currentRestaurantId = restaurantId;
    
    // Initialize WebSocket connection for this restaurant
    this.wsService.connect(restaurantId);
  }

  // Get current restaurant ID
  public getCurrentRestaurantId(): string | null {
    return this.currentRestaurantId;
  }

  // Get all orders with optional filters
  async getAllOrders(filters: Record<string, any> = {}): Promise<OrdersResponse> {
    try {
      // Use current restaurant ID if not provided and available
      if (!filters['restaurantId'] && this.currentRestaurantId) {
        filters['restaurantId'] = this.currentRestaurantId;
      }
      
      const response = await axios.get(this.baseUrl, { 
        params: filters,
        // Include credentials to ensure authentication cookies are sent
        withCredentials: true 
      });
      
      // Ensure response has the expected format
      const responseData = response.data as any;
      if (responseData && responseData.data) {
        // Make sure it conforms to OrdersResponse type
        return {
          data: Array.isArray(responseData.data) ? responseData.data : [],
          pagination: {
            total: responseData.total || (Array.isArray(responseData.data) ? responseData.data.length : 0),
            page: responseData.page || 1,
            limit: responseData.limit || 10,
            pages: responseData.pages || 1
          }
        };
      } else {
        // If response doesn't have the expected format, normalize it
        return {
          data: Array.isArray(responseData) ? responseData : (responseData ? [responseData] : []),
          pagination: {
            total: Array.isArray(responseData) ? responseData.length : (responseData ? 1 : 0),
            page: 1,
            limit: 10,
            pages: 1
          }
        };
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      
      // Handle common error cases
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error fetching orders - user may need to log in again');
      }
      
      // Return empty response instead of throwing to avoid crashing components
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      };
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`, { withCredentials: true });
      
      // Subscribe to real-time updates for this order
      this.wsService.subscribeToOrder(id);
      
      // Type check the response
      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        return response.data as Order;
      }
      
      throw new Error(`Invalid order data received for ID ${id}`);
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      // Create minimal order object with ID to avoid breaking UI
      return {
        _id: id,
        orderNumber: `Order-${id.substring(0, 8)}`,
        status: OrderStatus.PENDING,
        items: [],
        total: 0,
        subtotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        restaurantId: '',
        orderType: 'dine-in',
        paymentStatus: 'PENDING',
        tax: 0
      } as unknown as Order;
    }
  }

  // Create a new order
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await axios.post(this.baseUrl, orderData, { withCredentials: true });
      
      // Type check the response
      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        return response.data as Order;
      }
      
      throw new Error('Invalid response from order creation');
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Update order details
  async updateOrderDetails(id: string, updates: Partial<Order>): Promise<Order> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, updates, { withCredentials: true });
      
      // Type check the response
      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        return response.data as Order;
      }
      
      throw new Error(`Invalid response when updating order details for ${id}`);
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      // Return the original order with updated fields to avoid breaking UI
      return {
        _id: id,
        ...updates,
        orderNumber: updates.orderNumber || `Order-${id.substring(0, 8)}`,
        items: updates.items || [],
        createdAt: updates.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: updates.status || OrderStatus.PENDING,
        paymentStatus: updates.paymentStatus || 'PENDING',
        orderType: updates.orderType || 'dine-in',
        tax: updates.tax || 0,
        total: updates.total || 0,
        subtotal: updates.subtotal || 0,
        restaurantId: updates.restaurantId || ''
      } as unknown as Order;
    }
  }

  // Update order status
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}/status`, { status }, {
        withCredentials: true
      });
      
      // Type check the response
      if (response.data && typeof response.data === 'object') {
        return response.data as Order;
      }
      
      throw new Error(`Invalid response when updating order status for ${id}`);
    } catch (error) {
      console.error(`Error updating status for order ${id}:`, error);
      
      // Return the original order with updated status to avoid breaking UI
      // This helps in case of network errors but UI needs to show the change
      return {
        _id: id,
        status,
        orderNumber: `Order-${id.substring(0, 8)}`,
        items: [],
        total: 0,
        subtotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        restaurantId: '',
        paymentStatus: OrderStatus.PENDING,
        orderType: 'dine-in',
        tax: 0
      } as unknown as Order;
    }
  }

  // Update payment status
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}/payment`, { paymentStatus }, {
        withCredentials: true
      });
      
      // Type check the response
      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        return response.data as Order;
      }
      
      throw new Error(`Invalid response when updating payment status for ${id}`);
    } catch (error) {
      console.error(`Error updating order ${id} payment status:`, error);
      
      // Return a minimal order object with the updated payment status
      return {
        _id: id,
        paymentStatus,
        orderNumber: `Order-${id.substring(0, 8)}`,
        items: [],
        total: 0,
        subtotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        restaurantId: '',
        status: OrderStatus.PENDING,
        orderType: 'dine-in',
        tax: 0
      } as unknown as Order;
    }
  }

  // Cancel order
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    try {
      const response = await axios.post(`${this.baseUrl}/${id}/cancel`, { reason }, {
        withCredentials: true
      });
      
      // Type check the response
      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        return response.data as Order;
      }
      
      throw new Error(`Invalid response when cancelling order ${id}`);
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      
      // Return a minimal order object with the cancelled status
      return {
        _id: id,
        status: OrderStatus.CANCELLED,
        orderNumber: `Order-${id.substring(0, 8)}`,
        items: [],
        total: 0,
        subtotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        restaurantId: '',
        paymentStatus: 'CANCELLED',
        orderType: 'dine-in',
        tax: 0
      } as unknown as Order;
    }
  }

  // Get orders by restaurant ID
  async getOrdersByRestaurant(restaurantId: string, filters = {}): Promise<OrdersResponse> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          restaurantId,
          ...filters
        },
        withCredentials: true
      });
      
      // Ensure response has the expected format
      const responseData = response.data as any;
      if (responseData && typeof responseData === 'object') {
        // Make sure it conforms to OrdersResponse type
        return {
          data: Array.isArray(responseData.data) ? responseData.data : [],
          pagination: {
            total: responseData.pagination?.total || 0,
            page: responseData.pagination?.page || 1,
            limit: responseData.pagination?.limit || 10,
            pages: responseData.pagination?.totalPages || responseData.pagination?.pages || 0
          }
        };
      }
      
      throw new Error(`Invalid response format for restaurant ${restaurantId} orders`);
    } catch (error) {
      console.error(`Error fetching orders for restaurant ${restaurantId}:`, error);
      // Return empty response instead of throwing
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      };
    }
  }

  // Get orders by table
  async getOrdersByTable(restaurantId: string, tableNumber: string): Promise<Order[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/${restaurantId}/tables/${tableNumber}/orders`,
        { withCredentials: true }
      );
      
      // Type check the response
      if (response.data && Array.isArray(response.data)) {
        return response.data as Order[];
      }
      
      // Handle case where response is a single order
      if (response.data && typeof response.data === 'object' && '_id' in response.data) {
        return [response.data as Order];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching orders for table ${tableNumber}:`, error);
      // Return empty array instead of throwing
      return [];
    }
  }

  // Get orders by user
  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/orders`, { withCredentials: true });
      
      // Type check the response
      if (response.data && Array.isArray(response.data)) {
        return response.data as Order[];
      }
      
      // Handle case where response is a single order or in a data property
      if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data as Order[];
        }
        if ('_id' in response.data) {
          return [response.data as Order];
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Send alert about an order
  async sendOrderAlert(orderId: string, message: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/${orderId}/alert`, { message });
    } catch (error) {
      console.error(`Error sending alert for order ${orderId}:`, error);
      throw error;
    }
  }

  // Register callback for new orders
  onNewOrder(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEvents.NEW_ORDER, (data: OrderEventData) => {
      callback(data.order);
    });
  }

  // Register callback for order updates
  onOrderUpdated(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEvents.ORDER_UPDATED, (data: OrderEventData) => {
      callback(data.order);
    });
  }

  // Register callback for order cancellations
  onOrderCancelled(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEvents.ORDER_CANCELLED, (data: OrderEventData) => {
      callback(data.order);
    });
  }

  // Register callback for order alerts
  onOrderAlert(callback: (data: OrderAlert) => void): void {
    this.wsService.addEventListener(WebSocketEvents.ORDER_ALERT, (data: OrderAlert) => {
      callback(data);
    });
  }

  // Unsubscribe from order updates
  unsubscribeFromOrder(orderId: string): void {
    this.wsService.unsubscribeFromOrder(orderId);
  }

  // Clean up resources when service is no longer needed
  cleanup(): void {
    this.wsService.disconnect();
    this.currentRestaurantId = null;
  }
}

export default new OrderService();
