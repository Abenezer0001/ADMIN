import { Order } from '../types/order';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/config';

// WebSocket events
export enum WebSocketEventType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  NEW_ORDER = 'orderCreated',
  ORDER_UPDATED = 'orderUpdated',
  ORDER_CANCELLED = 'orderCancelled',
  ORDER_COMPLETED = 'orderCompleted',
  ORDER_ALERT = 'orderAlert',
}

export interface OrderEventData {
  order?: any; // Replace 'any' with your Order type
}

export interface OrderAlert {
  orderId: string;
  restaurantId?: string;
  message: string;
  timestamp: Date | string;
}

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private reconnecting = false;
  private rooms: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Socket.io will be initialized in connect()
  }

  /**
   * Connect to WebSocket server with restaurant context
   */
  connect(restaurantId?: string): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Socket already connected');
      // Even if already connected, make sure we're in the restaurant room
      if (restaurantId) {
        this.joinRoom(`restaurant:${restaurantId}`);
      }
      return;
    }

    // Initialize socket connection
    console.log(`[WebSocket] Connecting to ${SOCKET_URL}`);
    console.log('[WebSocket] Restaurant ID for WebSocket:', restaurantId);
    
    // Validate socket URL is configured
    if (!SOCKET_URL) {
      throw new Error('SOCKET_URL must be configured in environment variables');
    }
    
    console.log('[WebSocket] Socket URL used:', SOCKET_URL);
    console.log('[WebSocket] Connection options: withCredentials=true, transports=[websocket,polling]');
    
    // Close any existing socket before creating a new one
    if (this.socket) {
      console.log('[WebSocket] Closing existing socket before reconnecting');
      this.socket.close();
      this.socket = null;
    }
    
    try {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 30000,
        withCredentials: true,
        transports: ['websocket', 'polling'] // Try WebSocket first, then fall back to polling
      });
      
      console.log('[WebSocket] Socket.io instance created successfully');
    } catch (error) {
      console.error('[WebSocket] Error creating socket.io instance:', error);
    }

    this.setupSocketListeners();
    
    // Join restaurant room if provided
    if (restaurantId) {
      this.joinRoom(`restaurant:${restaurantId}`);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    console.log('Socket.io: Disconnected');
  }

  /**
   * Join a specific room
   */
  joinRoom(room: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: socket not connected');
      this.rooms.add(room); // Store for later when connected
      return;
    }

    this.socket.emit(WebSocketEventType.JOIN_ROOM, room);
    this.rooms.add(room);
    console.log(`Joined room: ${room}`);
  }
  
  /**
   * Leave a specific room
   */
  leaveRoom(room: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot leave room: socket not connected');
      this.rooms.delete(room);
      return;
    }

    this.socket.emit(WebSocketEventType.LEAVE_ROOM, room);
    this.rooms.delete(room);
    console.log(`Left room: ${room}`);
  }
  
  /**
   * Rejoin all rooms on reconnection
   */
  private rejoinRooms(): void {
    if (!this.socket?.connected) return;
    
    this.rooms.forEach(room => {
      this.socket!.emit(WebSocketEventType.JOIN_ROOM, room);
      console.log(`Rejoined room: ${room}`);
    });
  }

  /**
   * Subscribe to order-specific updates
   */
  subscribeToOrder(orderId: string): void {
    this.joinRoom(`order:${orderId}`);
  }

  /**
   * Unsubscribe from order-specific updates
   */
  unsubscribeFromOrder(orderId: string): void {
    this.leaveRoom(`order:${orderId}`);
  }

  /**
   * Add event listener
   */
  addEventListener(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }
  
  /**
   * Remove all event listeners
   */
  removeAllEventListeners(): void {
    this.eventListeners.clear();
    console.log('[WebSocket] All event listeners removed');
  }
  
  /**
   * Check if socket is connected
   * @returns true if socket is connected, false otherwise
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Set up Socket.io event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) {
      console.error('[WebSocket] Cannot setup listeners: socket is null');
      return;
    }

    console.log('[WebSocket] Setting up socket event listeners...');

    // Send a test ping every 30 seconds to verify connection
    const pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log('[WebSocket] Sending ping to verify connection...');
        this.socket.emit('ping', (response: any) => {
          console.log('[WebSocket] Received ping response:', response);
        });
      }
    }, 30000);

    // Handle connection events
    this.socket.on(WebSocketEventType.CONNECT, () => {
      console.log('[WebSocket] ✅ Successfully connected to WebSocket server with ID:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Log socket handshake details
      console.log('[WebSocket] Connection details:', {
        transport: this.socket?.io?.engine?.transport?.name,
        id: this.socket?.id,
      });
      
      // Rejoin rooms on reconnection
      if (this.reconnecting) {
        console.log('[WebSocket] Reconnected after disconnection, rejoining rooms...');
        this.rejoinRooms();
        this.reconnecting = false;
      }
      
      // Notify listeners
      this.notifyEventListeners(WebSocketEventType.CONNECT, { connected: true });
    });

    this.socket.on(WebSocketEventType.DISCONNECT, (reason) => {
      console.log(`[WebSocket] ❌ Disconnected from WebSocket server: ${reason}`);
      this.reconnecting = true;
      
      // Clean up the ping interval on disconnect
      clearInterval(pingInterval);
      
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
      
      this.notifyEventListeners(WebSocketEventType.DISCONNECT, { reason });
    });

    this.socket.on(WebSocketEventType.ERROR, (error) => {
      console.error('WebSocket error:', error);
      this.notifyEventListeners(WebSocketEventType.ERROR, { error });
    });

    // Set up event listeners for order events
    this.socket.on(WebSocketEventType.NEW_ORDER, (data) => {
      console.log('🟢 New order received from server:', data);
      console.log('Order details:', JSON.stringify(data, null, 2));
      this.notifyEventListeners(WebSocketEventType.NEW_ORDER, data);
    });

    this.socket.on(WebSocketEventType.ORDER_UPDATED, (data) => {
      console.log('🔵 Order updated:', data);
      console.log('Updated order details:', JSON.stringify(data, null, 2));
      this.notifyEventListeners(WebSocketEventType.ORDER_UPDATED, data);
    });

    this.socket.on(WebSocketEventType.ORDER_CANCELLED, (data) => {
      console.log('🔴 Order cancelled:', data);
      console.log('Cancelled order details:', JSON.stringify(data, null, 2));
      this.notifyEventListeners(WebSocketEventType.ORDER_CANCELLED, data);
    });
    
    this.socket.on(WebSocketEventType.ORDER_COMPLETED, (data) => {
      console.log('✅ Order completed:', data);
      console.log('Completed order details:', JSON.stringify(data, null, 2));
      this.notifyEventListeners(WebSocketEventType.ORDER_COMPLETED, data);
    });
    
    this.socket.on(WebSocketEventType.ORDER_ALERT, (data) => {
      console.log('⚠️ Order alert received:', data);
      console.log('Alert details:', JSON.stringify(data, null, 2));
      this.notifyEventListeners(WebSocketEventType.ORDER_ALERT, data);
    });
    
    // Add ping/pong for connection verification
    setInterval(() => {
      if (this.socket?.connected) {
        console.log('Socket connection check: Connected ✓');
      } else {
        console.log('Socket connection check: Disconnected ✗');
        // Try to reconnect if disconnected
        this.socket?.connect();
      }
    }, 10000);
  }

  /**
   * Notify all event listeners for a specific event type
   */
  private notifyEventListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
