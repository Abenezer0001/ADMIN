import { io, Socket } from 'socket.io-client';
import { Order } from '../types/order';
import { config } from '../config';

export enum WebSocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  NEW_ORDER = 'new_order',
  ORDER_UPDATED = 'order_updated',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_ALERT = 'order_alert',
  ERROR = 'error'
}

export interface OrderEventData {
  order: Order;
}

export interface OrderAlert {
  orderId: string;
  restaurantId: string;
  message: string;
  timestamp: Date;
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private restaurantId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: { [key: string]: Function[] } = {};

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize the WebSocket connection
   */
  public initialize(restaurantId: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.restaurantId = restaurantId;
    
    try {
      // Initialize socket connection
      this.socket = io(config.apiUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      // Setup event listeners
      this.setupEventListeners();
      
      console.log('WebSocket service initialized');
    } catch (error) {
      console.error('Failed to initialize WebSocket service:', error);
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on(WebSocketEvents.CONNECT, () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Join restaurant room upon connection
      if (this.restaurantId) {
        this.joinRoom(`restaurant:${this.restaurantId}`);
      }
      
      // Trigger stored listeners for connect event
      this.triggerListeners(WebSocketEvents.CONNECT);
    });

    this.socket.on(WebSocketEvents.DISCONNECT, (reason) => {
      console.log(`WebSocket disconnected: ${reason}`);
      
      // Try to reconnect if not explicitly disconnected
      if (reason === 'io server disconnect') {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          
          // Attempt to reconnect after delay
          this.reconnectTimeout = setTimeout(() => {
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.socket?.connect();
          }, 2000 * this.reconnectAttempts);
        }
      }
      
      // Trigger stored listeners for disconnect event
      this.triggerListeners(WebSocketEvents.DISCONNECT, reason);
    });

    this.socket.on(WebSocketEvents.ERROR, (error) => {
      console.error('WebSocket error:', error);
      // Trigger stored listeners for error event
      this.triggerListeners(WebSocketEvents.ERROR, error);
    });

    // Order events
    this.socket.on(WebSocketEvents.NEW_ORDER, (data: OrderEventData) => {
      console.log('New order received:', data);
      this.triggerListeners(WebSocketEvents.NEW_ORDER, data);
    });

    this.socket.on(WebSocketEvents.ORDER_UPDATED, (data: OrderEventData) => {
      console.log('Order updated:', data);
      this.triggerListeners(WebSocketEvents.ORDER_UPDATED, data);
    });

    this.socket.on(WebSocketEvents.ORDER_CANCELLED, (data: OrderEventData) => {
      console.log('Order cancelled:', data);
      this.triggerListeners(WebSocketEvents.ORDER_CANCELLED, data);
    });
    
    this.socket.on(WebSocketEvents.ORDER_ALERT, (data: OrderAlert) => {
      console.log('Order alert received:', data);
      this.triggerListeners(WebSocketEvents.ORDER_ALERT, data);
    });
  }

  /**
   * Join a specific room to receive events
   */
  public joinRoom(room: string): void {
    if (!this.socket) {
      console.warn('Cannot join room: WebSocket not connected');
      return;
    }

    this.socket.emit(WebSocketEvents.JOIN_ROOM, room);
    console.log(`Joined room: ${room}`);
  }

  /**
   * Leave a specific room
   */
  public leaveRoom(room: string): void {
    if (!this.socket) {
      console.warn('Cannot leave room: WebSocket not connected');
      return;
    }

    this.socket.emit(WebSocketEvents.LEAVE_ROOM, room);
    console.log(`Left room: ${room}`);
  }

  /**
   * Join order-specific room
   */
  public subscribeToOrder(orderId: string): void {
    this.joinRoom(`order:${orderId}`);
  }

  /**
   * Unsubscribe from order-specific events
   */
  public unsubscribeFromOrder(orderId: string): void {
    this.leaveRoom(`order:${orderId}`);
  }

  /**
   * Add event listener
   */
  public addEventListener(event: WebSocketEvents, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: WebSocketEvents, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Trigger stored listeners for an event
   */
  private triggerListeners(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Disconnect the WebSocket
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Check if the socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default WebSocketService; 