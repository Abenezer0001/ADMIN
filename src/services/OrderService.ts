import axios from 'axios';
import { config } from '../config';
import { Order, OrderStatus, PaymentStatus } from '../types/order';
import WebSocketService, { WebSocketEvents, OrderEventData } from './WebSocketService';

class OrderService {
  private static instance: OrderService;
  private wsService: WebSocketService;
  private currentRestaurantId: string | null = null;

  private constructor() {
    this.wsService = WebSocketService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  /**
   * Set current restaurant context
   */
  public setRestaurantContext(restaurantId: string): void {
    this.currentRestaurantId = restaurantId;
    
    // Initialize WebSocket connection for this restaurant
    this.wsService.initialize(restaurantId);
  }

  /**
   * Get current restaurant ID
   */
  public getCurrentRestaurantId(): string | null {
    return this.currentRestaurantId;
  }

  /**
   * Get all orders with optional filtering
   */
  public async getOrders(params: {
    restaurantId?: string,
    status?: OrderStatus,
    orderType?: string,
    paymentStatus?: PaymentStatus,
    startDate?: string,
    endDate?: string,
    tableId?: string,
    tableNumber?: string,
    userId?: string,
    page?: number,
    limit?: number,
    sort?: string
  }): Promise<{ data: Order[], pagination: any }> {
    try {
      // Use current restaurant ID if not provided
      if (!params.restaurantId && this.currentRestaurantId) {
        params.restaurantId = this.currentRestaurantId;
      }
      
      const response = await axios.get(`${config.apiUrl}/api/orders`, { 
        params,
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get a specific order by ID
   */
  public async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await axios.get(`${config.apiUrl}/api/orders/${orderId}`, {
        withCredentials: true
      });
      
      // Subscribe to real-time updates for this order
      this.wsService.subscribeToOrder(orderId);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  public async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/orders/${orderId}/payment-status`,
        { paymentStatus },
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/orders/${orderId}/cancel`,
        { reason },
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Get orders by table
   */
  public async getOrdersByTable(restaurantId: string, tableNumber: string): Promise<Order[]> {
    try {
      const response = await axios.get(
        `${config.apiUrl}/api/orders/restaurant/${restaurantId}/table/${tableNumber}`,
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching table orders:', error);
      throw error;
    }
  }

  /**
   * Update order details
   */
  public async updateOrderDetails(orderId: string, updates: Partial<Order>): Promise<Order> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/orders/${orderId}`,
        updates,
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating order details:', error);
      throw error;
    }
  }

  /**
   * Register callback for new orders
   */
  public onNewOrder(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEvents.NEW_ORDER, (data: OrderEventData) => {
      callback(data.order);
    });
  }

  /**
   * Register callback for order updates
   */
  public onOrderUpdated(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEvents.ORDER_UPDATED, (data: OrderEventData) => {
      callback(data.order);
    });
  }

  /**
   * Register callback for order cancellations
   */
  public onOrderCancelled(callback: (order: Order) => void): void {
    this.wsService.addEventListener(WebSocketEvents.ORDER_CANCELLED, (data: OrderEventData) => {
      callback(data.order);
    });
  }

  /**
   * Unsubscribe from order updates
   */
  public unsubscribeFromOrder(orderId: string): void {
    this.wsService.unsubscribeFromOrder(orderId);
  }

  /**
   * Clean up resources when service is no longer needed
   */
  public cleanup(): void {
    this.wsService.disconnect();
    this.currentRestaurantId = null;
  }
}

export default OrderService;