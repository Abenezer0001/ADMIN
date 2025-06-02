import axios from 'axios';
import api from '../utils/axiosConfig';
import { API_BASE_URL } from '../utils/config';
import { Order, OrderStatus, PaymentStatus, OrdersResponse } from '../types/order';
import WebSocketService, { WebSocketEventType, OrderEventData, OrderAlert } from './websocketService';
import { isDemoMode } from './authHelpers';

class OrderService {
  private baseUrl = API_BASE_URL;
  private wsService = WebSocketService;
  private currentRestaurantId: string | null = null;
  private isRefreshing = false;
  private failedRequests: Array<{
    resolve: (value: any) => void,
    reject: (error: any) => void,
    config: any
  }> = [];

  // Debug method to log API URLs for troubleshooting
  private logApiRequest(endpoint: string, method: string, data?: any) {
    console.log(`[API ${method}] ${endpoint}`);
    if (data) {
      console.log('Request data:', data);
    }
  }

  // Central handler for authentication errors
  private async handleAuthError(error: any, originalRequest: any): Promise<any> {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error detected: 401 Unauthorized');
      
      // If we're already refreshing the token, queue this request
      if (this.isRefreshing) {
        console.log('Token refresh in progress, queueing request');
        return new Promise((resolve, reject) => {
          this.failedRequests.push({
            resolve,
            reject,
            config: originalRequest
          });
        });
      }
      
      // Start the token refresh process
      this.isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        await this.refreshToken();
        
        // Process any queued requests with the new token
        this.failedRequests.forEach(request => {
          api(request.config)
            .then(response => request.resolve(response))
            .catch(err => request.reject(err));
        });
        
        this.failedRequests = [];
        this.isRefreshing = false;
        
        // Retry the original request with the new token
        return await api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Reject all queued requests
        this.failedRequests.forEach(request => {
          request.reject(refreshError);
        });
        
        this.failedRequests = [];
        this.isRefreshing = false;
        
        // Redirect to login or dispatch event for authentication failure
        this.handleAuthenticationFailure();
        
        // Rethrow the original error
        throw error;
      }
    }
    
    // If it's not a 401 error, just rethrow it
    throw error;
  }
  
  // Method to refresh the authentication token
  private async refreshToken(): Promise<void> {
    try {
      console.log('Attempting to refresh authentication token');
      
      // Flag to track if token refresh is failing repeatedly
      const tokenRefreshFailCount = parseInt(localStorage.getItem('tokenRefreshFailCount') || '0');
      
      if (tokenRefreshFailCount > 3) {
        console.error('Token refresh has failed multiple times - forcing relogin');
        localStorage.removeItem('tokenRefreshFailCount');
        this.handleAuthenticationFailure();
        throw new Error('Token refresh failed too many times');
      }
      
      // Use a simple POST request without extra headers that might cause CORS issues
      const response = await api.post('/auth/refresh-token', {}, {
        timeout: 10000,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Token refresh response:', response.status);
      
      if (response.status !== 200) {
        throw new Error('Token refresh failed with status: ' + response.status);
      }
      
      // Reset fail counter on success
      localStorage.removeItem('tokenRefreshFailCount');
      console.log('Successfully refreshed token');
    } catch (error: any) {
      // Count the failure
      const currentFailCount = parseInt(localStorage.getItem('tokenRefreshFailCount') || '0');
      localStorage.setItem('tokenRefreshFailCount', (currentFailCount + 1).toString());
      
      console.error('Failed to refresh token:', error);
      
      // If it's a network error or CORS error, provide more helpful context
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        console.warn('Network/CORS error during token refresh - check server configuration');
      }
      
      throw error;
    }
  }
  
  // Handle complete authentication failure
  private handleAuthenticationFailure(): void {
    console.error('Authentication failed completely. User needs to log in again');
    
    // Clear any stored auth data
    localStorage.removeItem('tokenRefreshFailCount');
    
    // Dispatch an event that can be caught by the app to redirect to login
    window.dispatchEvent(new CustomEvent('auth:required', { 
      detail: { message: 'Your session has expired. Please log in again.' } 
    }));
    
    // Add a visible notification for better user experience
    const notification = (window as any).notification;
    if (typeof notification === 'function') {
      notification({ 
        type: 'error',
        message: 'Authentication Error',
        description: 'Your session has expired. You will be redirected to the login page.'
      });
    }
  }
  
  // Get authentication headers from cookies or localStorage
  private getAuthHeadersFromCookies(): Record<string, string> {
    console.log('Getting auth headers');
    const headers: Record<string, string> = {};
    
    try {
      // Try to get token from cookie first - check multiple cookie names
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      const accessTokenCookie = cookies.find(cookie => cookie.startsWith('access_token='));
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      
      if (accessTokenCookie) {
        const token = accessTokenCookie.split('=')[1];
        console.log('Found access_token cookie');
        headers['Authorization'] = `Bearer ${token}`;
        return headers;
      }
      
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        console.log('Found token cookie');
        headers['Authorization'] = `Bearer ${token}`;
        return headers;
      }
      
      // Fall back to localStorage if available
      const localToken = localStorage.getItem('auth_token');
      if (localToken) {
        console.log('Using token from localStorage');
        headers['Authorization'] = `Bearer ${localToken}`;
        return headers;
      }
      
      // Check sessionStorage as last resort
      const sessionToken = sessionStorage.getItem('auth_token');
      if (sessionToken) {
        console.log('Using token from sessionStorage');
        headers['Authorization'] = `Bearer ${sessionToken}`;
        return headers;
      }
      
      console.warn('No authentication token found in cookies, localStorage, or sessionStorage');
      console.log('Available cookies:', document.cookie);
      return headers;
    } catch (e) {
      console.error('Error accessing cookies or storage:', e);
      return headers;
    }
  }
  
  // Create a wrapper for axios requests to handle authentication consistently
  private async apiRequest<T>(
    method: string, 
    url: string, 
    data?: any, 
    config: any = {}
  ): Promise<T> {
    try {
      let response: any;
      
      // Remove baseUrl from url if it's included
      const endpoint = url.startsWith(this.baseUrl) 
        ? url.substring(this.baseUrl.length) 
        : url;
      
      // Get auth headers from cookies/storage as fallback
      const authHeaders = this.getAuthHeadersFromCookies();
      
      // Use minimal headers to avoid CORS issues
      const mergedConfig = {
        ...config,
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders, // Include auth headers as fallback
          ...(config.headers || {}) 
        },
        withCredentials: true // Always include cookies
      };
      
      console.log(`API ${method} ${endpoint} with credentials and auth headers`);
      console.log('Request headers:', Object.keys(mergedConfig.headers));
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get(endpoint, mergedConfig);
          break;
        case 'post':
          response = await api.post(endpoint, data, mergedConfig);
          break;
        case 'put':
          response = await api.put(endpoint, data, mergedConfig);
          break;
        case 'delete':
          response = await api.delete(endpoint, mergedConfig);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        return this.handleAuthError(error, {
          ...config,
          method,
          url,
          data
        });
      }
      
      throw error;
    }
  }

  // Set current restaurant context for WebSocket
  public setRestaurantContext(restaurantId: string): void {
    this.currentRestaurantId = restaurantId;
    
    // Store the restaurant ID for potential reconnects
    localStorage.setItem('currentRestaurantId', restaurantId);
    
    // Initialize WebSocket connection for this restaurant
    console.log(`Initializing WebSocket connection for restaurant: ${restaurantId}`);
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
      
      const responseData = await this.apiRequest<any>('get', '/orders', undefined, {
        params: filters
      });
      
      // Ensure response has the expected format
      if (responseData && typeof responseData === 'object') {
        return {
          data: Array.isArray(responseData.data) ? responseData.data : Array.isArray(responseData) ? responseData : [],
          pagination: {
            total: responseData.pagination?.total || 0,
            page: responseData.pagination?.page || 1,
            limit: responseData.pagination?.limit || 10,
            pages: responseData.pagination?.totalPages || responseData.pagination?.pages || 0
          }
        };
      }
      
      throw new Error('Invalid response format for getAllOrders');
    } catch (error) {
      console.error('Error fetching all orders:', error);
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

  // Update order status
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      // Check if this is demo mode before making real API calls
      if (isDemoMode()) {
        console.log('DEMO MODE: Simulating order status update');
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
      
      // Subscribe to this order to ensure we get WebSocket updates
      this.wsService.subscribeToOrder(id);
      
      console.log(`Updating order ${id} status to: ${status}`);
      
      // Use the centralized apiRequest method instead of direct axios call
      // This ensures consistent auth handling and CORS headers
      const data = await this.apiRequest<any>('put', `/orders/${id}/status`, { status });
      
      console.log('Order status update successful');
      return data as Order;
    } catch (error: any) {
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
      // Backend validation expects lowercase paymentStatus values but our enum uses uppercase
      const lowercasePaymentStatus = paymentStatus.toLowerCase();
      console.log(`Updating payment status from ${paymentStatus} to lowercase: ${lowercasePaymentStatus} for backend compatibility`);
      
      const data = await this.apiRequest<any>('put', `/orders/${id}/payment`, { paymentStatus: lowercasePaymentStatus });
      
      // Type check the response
      if (data && typeof data === 'object' && '_id' in data) {
        return data as Order;
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

  // Cancel an order
  async cancelOrder(id: string, reason: string = 'Cancelled by admin'): Promise<Order> {
    try {
      const data = await this.apiRequest<any>('post', `/orders/${id}/cancel`, { reason });
      
      // Type check the response
      if (data && typeof data === 'object' && '_id' in data) {
        return data as Order;
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
      const responseData = await this.apiRequest<any>('get', '/orders', undefined, {
        params: {
          restaurantId,
          ...filters
        }
      });
      
      // Ensure response has the expected format
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
      const data = await this.apiRequest<any>(
        'get',
        `/restaurants/${restaurantId}/tables/${tableNumber}/orders`
      );
      
      // Type check the response
      if (data && Array.isArray(data)) {
        return data as Order[];
      }
      
      // Handle case where response is a single order
      if (data && typeof data === 'object' && '_id' in data) {
        return [data as Order];
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
      const data = await this.apiRequest<any>('get', `/users/${userId}/orders`);
      
      // Type check the response
      if (data && Array.isArray(data)) {
        return data as Order[];
      }
      
      // Handle case where response is a single order or in a data property
      if (data && typeof data === 'object') {
        if ('data' in data && Array.isArray(data.data)) {
          return data.data as Order[];
        }
        if ('_id' in data) {
          return [data as Order];
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Send an alert for an order
  async sendOrderAlert(orderId: string, message: string): Promise<void> {
    try {
      await this.apiRequest<void>('post', `/orders/${orderId}/alert`, { message });
    } catch (error) {
      console.error(`Error sending alert for order ${orderId}:`, error);
      throw error;
    }
  }

  // Register callback for new orders
  onNewOrder(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEventType.NEW_ORDER, (data: any) => {
      console.log('New order received from WebSocket:', data);
      // Call the callback with proper error handling
      try {
        const orderData = data.order || data;
        // Validate that this is a valid order with at least an ID
        if (orderData && orderData._id) {
          callback(orderData);
        } else {
          console.error('Received invalid order data:', data);
        }
      } catch (error) {
        console.error('Error processing new order event:', error);
      }
    });
  }

  // Register callback for order updates
  onOrderUpdated(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEventType.ORDER_UPDATED, (data: any) => {
      console.log('Order update received from WebSocket:', data);
      // Call callback with proper error handling
      try {
        const orderData = data.order || data;
        // Validate that this is a valid order with at least an ID
        if (orderData && orderData._id) {
          callback(orderData);
        } else {
          console.error('Received invalid order update data:', data);
        }
      } catch (error) {
        console.error('Error processing order update event:', error);
      }
    });
  }

  // Register callback for order cancellations
  onOrderCancelled(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEventType.ORDER_CANCELLED, (data: any) => {
      console.log('Order cancellation received from WebSocket:', data);
      // Call callback with proper error handling
      try {
        const orderData = data.order || data;
        // Validate that this is a valid order with at least an ID
        if (orderData && orderData._id) {
          callback(orderData);
        } else {
          console.error('Received invalid cancelled order data:', data);
        }
      } catch (error) {
        console.error('Error processing order cancellation event:', error);
      }
    });
  }

  // Register callback for order alerts
  onOrderAlert(callback: (data: OrderAlert) => void): void {
    this.wsService.addEventListener(WebSocketEventType.ORDER_ALERT, (data: any) => {
      console.log('Order alert received from WebSocket:', data);
      // Call callback with proper error handling
      try {
        // Ensure it has the required fields for an OrderAlert
        if (data && data.orderId && data.message) {
          callback(data);
        } else {
          console.error('Received invalid order alert data:', data);
        }
      } catch (error) {
        console.error('Error processing order alert event:', error);
      }
    });
  }

  // Unsubscribe from order updates
  unsubscribeFromOrder(orderId: string): void {
    this.wsService.unsubscribeFromOrder(orderId);
  }

  // Clean up resources when service is no longer needed
  cleanup(): void {
    console.log('Cleaning up OrderService resources...');
    this.wsService.disconnect();
    this.currentRestaurantId = null;
  }
  
  // Add a method to check connection status and reconnect if needed
  checkConnectionStatus(): void {
    // Only attempt reconnect if we have a restaurant ID
    const restaurantId = this.getCurrentRestaurantId() || localStorage.getItem('currentRestaurantId');
    if (restaurantId) {
      console.log(`Connection check - ensuring WebSocket is connected for restaurant: ${restaurantId}`);
      this.wsService.connect(restaurantId);
    }
  }
  
  // Method to check authentication status
  async checkAuthStatus(): Promise<boolean> {
    try {
      // Make a lightweight request to verify authentication
      await this.apiRequest<any>('get', '/auth/verify');
      return true;
    } catch (error) {
      console.warn('Authentication check failed:', error);
      return false;
    }
  }
}

export default new OrderService();
