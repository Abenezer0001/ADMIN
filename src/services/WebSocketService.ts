import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/config';

export enum WebSocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  NEW_ORDER = 'newOrder',
  ORDER_UPDATED = 'orderUpdated',
  ORDER_CANCELLED = 'orderCancelled',
  ORDER_ALERT = 'orderAlert'
}

export interface OrderEventData {
  order: any; // Replace 'any' with your Order type
}

export interface OrderAlert {
  orderId: string;
  restaurantId: string;
  message: string;
  timestamp: Date;
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

  connect(restaurantId?: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true
    });

    this.setupSocketListeners();
    console.log('Connecting to WebSocket server...');
    
    // Join restaurant room if provided
    if (restaurantId) {
      this.joinRoom(`restaurant:${restaurantId}`);
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on(WebSocketEvents.CONNECT, () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      // Rejoin rooms on reconnection
      if (this.reconnecting) {
        this.rejoinRooms();
        this.reconnecting = false;
      }
      
      // Notify listeners
      this.notifyEventListeners(WebSocketEvents.CONNECT, { connected: true });
    });

    this.socket.on(WebSocketEvents.DISCONNECT, (reason) => {
      console.log(`Disconnected from WebSocket server: ${reason}`);
      this.reconnecting = true;
      
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
      
      this.notifyEventListeners(WebSocketEvents.DISCONNECT, { reason });
    });

    this.socket.on(WebSocketEvents.ERROR, (error) => {
      console.error('WebSocket error:', error);
      this.notifyEventListeners(WebSocketEvents.ERROR, { error });
    });

    // Set up event listeners for order events
    this.socket.on(WebSocketEvents.NEW_ORDER, (data) => {
      console.log('New order received:', data);
      this.notifyEventListeners(WebSocketEvents.NEW_ORDER, data);
    });

    this.socket.on(WebSocketEvents.ORDER_UPDATED, (data) => {
      console.log('Order updated:', data);
      this.notifyEventListeners(WebSocketEvents.ORDER_UPDATED, data);
    });

    this.socket.on(WebSocketEvents.ORDER_CANCELLED, (data) => {
      console.log('Order cancelled:', data);
      this.notifyEventListeners(WebSocketEvents.ORDER_CANCELLED, data);
    });
    
    this.socket.on(WebSocketEvents.ORDER_ALERT, (data) => {
      console.log('Order alert received:', data);
      this.notifyEventListeners(WebSocketEvents.ORDER_ALERT, data);
    });
  }

  joinRoom(room: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: socket not connected');
      this.rooms.add(room); // Store for later when connected
      return;
    }

    this.socket.emit(WebSocketEvents.JOIN_ROOM, room);
    this.rooms.add(room);
    console.log(`Joined room: ${room}`);
  }

  leaveRoom(room: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot leave room: socket not connected');
      this.rooms.delete(room);
      return;
    }

    this.socket.emit(WebSocketEvents.LEAVE_ROOM, room);
    this.rooms.delete(room);
    console.log(`Left room: ${room}`);
  }

  private rejoinRooms() {
    if (!this.socket?.connected) return;
    
    this.rooms.forEach(room => {
      this.socket!.emit(WebSocketEvents.JOIN_ROOM, room);
      console.log(`Rejoined room: ${room}`);
    });
  }
  
  /**
   * Join order-specific room
   */
  subscribeToOrder(orderId: string): void {
    this.joinRoom(`order:${orderId}`);
  }

  /**
   * Unsubscribe from order-specific events
   */
  unsubscribeFromOrder(orderId: string): void {
    this.leaveRoom(`order:${orderId}`);
  }

  addEventListener(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: EventCallback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private notifyEventListeners(event: string, data: any) {
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

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.rooms.clear();
      console.log('Disconnected from WebSocket server');
    }
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export default new WebSocketService();
