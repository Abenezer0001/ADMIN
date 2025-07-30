import { api, API_BASE_URL } from '../utils/apiUtils';

// Group Ordering interfaces
export interface GroupOrder {
  _id: string;
  name: string;
  createdBy: {
    userId: string;
    name: string;
    email: string;
  };
  restaurantId: string;
  tableId?: string;
  participants: IGroupOrderParticipant[];
  items: IGroupOrderItem[];
  status: 'active' | 'collecting' | 'finalizing' | 'completed' | 'cancelled';
  joinCode: string;
  orderDeadline?: Date;
  totalAmount: number;
  paymentSplit: {
    method: 'equal' | 'items' | 'custom';
    customSplits?: { [userId: string]: number };
  };
  spendingLimits: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupOrderParticipant {
  userId: string;
  name: string;
  email: string;
  joinedAt: Date;
  status: 'active' | 'left';
  lastActivity: Date;
}

export interface IGroupOrderItem {
  itemId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  addedBy: string;
  addedAt: Date;
  lastModified: Date;
  modifiedBy: string;
}

export interface GroupOrderSettings {
  _id: string;
  restaurantId: string;
  maxParticipants: number;
  orderTimeLimit: number;
  minOrderAmount: number;
  maxOrderAmount: number;
  allowJoinAfterStart: boolean;
  requireMinimumParticipants: boolean;
  autoFinalizeOrders: boolean;
  paymentSplitMethods: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupOrderAnalytics {
  totalGroupOrders: number;
  totalParticipants: number;
  totalRevenue: number;
  averageParticipants: number;
  completionRate: number;
  dailyBreakdown: {
    date: string;
    orders: number;
    participants: number;
    revenue: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  paymentMethodDistribution: {
    method: string;
    count: number;
    percentage: number;
  }[];
}

export interface Participant {
  _id: string;
  userId: string;
  userName: string;
  email: string;
  joinedAt: Date;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  customizations: string[];
  specialRequests?: string;
}

export interface CreateGroupOrderRequest {
  restaurantId: string;
  tableId: string;
  expirationMinutes?: number;
}

export interface JoinGroupOrderRequest {
  joinCode: string;
  userName: string;
  email: string;
}

export interface AddItemsRequest {
  items: OrderItem[];
}

export interface GroupOrderStats {
  totalActiveGroups: number;
  totalParticipants: number;
  averageGroupSize: number;
  totalRevenue: number;
  conversionRate: number;
  mostPopularItems: {
    menuItemId: string;
    menuItemName: string;
    orderCount: number;
    totalRevenue: number;
  }[];
}

export interface GroupOrderAnalytics {
  dailyStats: {
    date: string;
    groupsCreated: number;
    groupsCompleted: number;
    totalRevenue: number;
    averageGroupSize: number;
  }[];
  hourlyDistribution: {
    hour: number;
    groupsCreated: number;
    completionRate: number;
  }[];
  restaurantPerformance: {
    restaurantId: string;
    restaurantName: string;
    groupsCreated: number;
    completionRate: number;
    totalRevenue: number;
  }[];
}

class GroupOrderingService {
  private baseUrl = `${API_BASE_URL}/v1/group-orders`;

  // Create new group order
  async createGroupOrder(data: CreateGroupOrderRequest): Promise<GroupOrder> {
    try {
      const response = await api.post(`${this.baseUrl}/create`, data);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create group order');
    }
  }

  // Join existing group order
  async joinGroupOrder(data: JoinGroupOrderRequest): Promise<{ groupOrder: GroupOrder; participantId: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/join`, data);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to join group order');
    }
  }

  // Add items to group order
  async addItemsToGroup(groupOrderId: string, data: AddItemsRequest): Promise<GroupOrder> {
    try {
      const response = await api.post(`${this.baseUrl}/${groupOrderId}/add-items`, data);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add items');
    }
  }

  // Get group order details
  async getGroupOrder(groupOrderId: string): Promise<GroupOrder> {
    try {
      const response = await api.get(`${this.baseUrl}/${groupOrderId}`);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch group order');
    }
  }

  // Lock group order (prevent new participants)
  async lockGroupOrder(groupOrderId: string): Promise<GroupOrder> {
    try {
      const response = await api.post(`${this.baseUrl}/${groupOrderId}/lock`);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to lock group order');
    }
  }

  // Place final order
  async placeFinalOrder(groupOrderId: string): Promise<{ success: boolean; orderId: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/${groupOrderId}/place-order`);
      return response.data as any;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to place final order');
    }
  }

  // Remove participant
  async removeParticipant(groupOrderId: string, participantId: string): Promise<GroupOrder> {
    try {
      const response = await api.delete(`${this.baseUrl}/${groupOrderId}/participants/${participantId}`);
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove participant');
    }
  }

  // Cancel group order
  async cancelGroupOrder(groupOrderId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      const response = await api.post(`${this.baseUrl}/${groupOrderId}/cancel`, { reason });
      return response.data as any;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel group order');
    }
  }

  // Get active group orders for restaurant
  async getActiveGroupOrders(restaurantId: string, page: number = 1, limit: number = 20): Promise<{
    groupOrders: GroupOrder[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/restaurant/${restaurantId}/active`, {
        params: { page, limit }
      });
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active group orders');
    }
  }

  // Get group order statistics
  async getGroupOrderStats(restaurantId?: string): Promise<GroupOrderStats> {
    try {
      const params = restaurantId ? { restaurantId } : {};
      const response = await api.get(`${this.baseUrl}/stats`, { params });
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch group order statistics');
    }
  }

  // Get group order analytics
  async getGroupOrderAnalytics(
    startDate?: string,
    endDate?: string,
    restaurantId?: string
  ): Promise<GroupOrderAnalytics> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await api.get(`${this.baseUrl}/analytics`, { params });
      return (response.data as any).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch group order analytics');
    }
  }

  // Get all group orders
  async getGroupOrders(page: number = 1, limit: number = 20): Promise<{
    groupOrders: GroupOrder[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch group orders');
    }
  }

  // Get analytics
  async getAnalytics(startDate?: string, endDate?: string): Promise<GroupOrderAnalytics> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${this.baseUrl}/analytics`, { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }

  // Get settings
  async getSettings(): Promise<GroupOrderSettings> {
    try {
      const response = await api.get(`${this.baseUrl}/settings`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settings');
    }
  }

  // Update settings
  async updateSettings(settings: GroupOrderSettings): Promise<GroupOrderSettings> {
    try {
      const response = await api.put(`${this.baseUrl}/settings`, settings);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  }

  // Finalize order
  async finalizeOrder(orderId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.post(`${this.baseUrl}/${orderId}/finalize`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to finalize order');
    }
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.post(`${this.baseUrl}/${orderId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }

  // Export group orders
  async exportGroupOrders(startDate: string, endDate: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export group orders');
    }
  }

  // WebSocket connection for real-time updates
  connectToGroupOrder(groupOrderId: string, callbacks: {
    onParticipantJoined?: (participant: Participant) => void;
    onItemsAdded?: (participantId: string, items: OrderItem[]) => void;
    onOrderLocked?: () => void;
    onOrderPlaced?: (orderId: string) => void;
    onParticipantRemoved?: (participantId: string) => void;
    onError?: (error: string) => void;
  }) {
    // WebSocket implementation would be handled by the app's WebSocket service
    // This is a placeholder for the interface
    console.log(`Connecting to group order ${groupOrderId} for real-time updates`);
    return {
      disconnect: () => console.log('Disconnecting from group order WebSocket')
    };
  }
}

export const groupOrderingService = new GroupOrderingService();
export default groupOrderingService;
