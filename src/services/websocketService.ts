import { Order } from '../types/order';

// WebSocket events
export enum WebSocketEventType {
  CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
  NEW_ORDER = 'NEW_ORDER',
  ORDER_UPDATE = 'ORDER_UPDATE',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PING = 'PING',
  PONG = 'PONG',
}

export interface WebSocketMessage {
  type: WebSocketEventType | string;
  data?: any;
  message?: string;
  timestamp?: number;
}

type WebSocketEventListener = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval: number = 5000; // 5 seconds
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private eventListeners: Map<string, WebSocketEventListener[]> = new Map();
  private url: string;

  constructor(url: string = import.meta.env.VITE_SOCKET_URL?.replace('http', 'ws') || import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws')) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket: Already connected or connecting');
      return;
    }

    console.log(`WebSocket: Connecting to ${this.url}`);
    this.socket = new WebSocket(this.url);

    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket: Cannot send message, socket not connected');
    }
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: WebSocketEventType | string, listener: WebSocketEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: WebSocketEventType | string, listener: WebSocketEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const filteredListeners = listeners.filter(l => l !== listener);
    this.eventListeners.set(eventType, filteredListeners);
  }

  /**
   * Handle WebSocket open event
   */
  private onOpen(event: Event): void {
    console.log('WebSocket: Connected');
    this.reconnectAttempts = 0;
    this.notifyEventListeners(WebSocketEventType.CONNECTION_ESTABLISHED, { connected: true });
    
    // Start ping interval to keep connection alive
    setInterval(() => {
      this.send({ type: WebSocketEventType.PING, timestamp: Date.now() });
    }, 30000); // 30 seconds
  }

  /**
   * Handle WebSocket message event
   */
  private onMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('WebSocket: Received message', message);
      
      // Notify listeners
      if (message.type) {
        this.notifyEventListeners(message.type, message.data || message);
      }
    } catch (error) {
      console.error('WebSocket: Error parsing message', error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  private onClose(event: CloseEvent): void {
    console.log(`WebSocket: Connection closed (${event.code}: ${event.reason})`);
    this.socket = null;
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('WebSocket: Max reconnect attempts reached');
    }
  }

  /**
   * Handle WebSocket error event
   */
  private onError(event: Event): void {
    console.error('WebSocket: Error', event);
  }

  /**
   * Notify all event listeners for a specific event type
   */
  private notifyEventListeners(eventType: WebSocketEventType | string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`WebSocket: Error in ${eventType} event listener`, error);
      }
    });
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
