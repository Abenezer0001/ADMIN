import { api, API_BASE_URL } from '../utils/apiUtils';

// Tipping-related interfaces
export interface TipRecord {
  _id: string;
  orderId: string;
  customerId: string;
  staffId: string;
  restaurantId: string;
  amount: number;
  percentage: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentIntentId: string;
  paymentMethodId: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  customerName?: string;
  staffName?: string;
  orderNumber?: string;
  recipientType?: string;
}

export interface PayoutRecord {
  _id: string;
  staffId: string;
  restaurantId: string;
  amount: number;
  tipIds: string[];
  status: 'pending' | 'in_transit' | 'paid' | 'failed';
  processingFee: number;
  netAmount: number;
  payoutDate: string;
  estimatedArrival?: string;
  createdAt: string;
  // Populated fields
  staffName?: string;
}

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  restaurantId: string;
  totalTips?: number;
  tipCount?: number;
  averageTip?: number;
  pendingTips?: number;
  lastTipDate?: string;
}

export interface TipStatistics {
  period: {
    startDate: string;
    endDate: string;
    groupBy: string;
  };
  totals: {
    totalTipAmount: number;
    totalTipCount: number;
    averageTipAmount: number;
    averageTipPercentage: number;
    totalStaffMembers: number;
    totalOrders: number;
  };
  breakdown: Array<{
    date: string;
    tipAmount: number;
    tipCount: number;
    averageTip: number;
    averagePercentage: number;
    orderCount: number;
  }>;
  topRecipients: Array<{
    staffId: string;
    staffName: string;
    role: string;
    totalTips: number;
    tipCount: number;
    averageTip: number;
    ranking: number;
  }>;
}

export interface AddTipRequest {
  orderId: string;
  tipAmount: number;
  tipPercentage: number;
  paymentMethodId: string;
  recipientId: string;
  recipientType: string;
}

export interface ProcessPayoutRequest {
  staffId: string;
  amount: number;
  payoutMethod: 'bank_transfer';
  tipIds: string[];
}

export interface TipFilters {
  page?: number;
  limit?: number;
  staffId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  sortBy?: 'date' | 'amount' | 'staff';
  sortOrder?: 'asc' | 'desc';
}

export interface PayoutFilters {
  page?: number;
  limit?: number;
  staffId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

class TippingService {
  private baseUrl = `${API_BASE_URL}/tips`;

  // Add tip to order
  async addTip(tipData: AddTipRequest): Promise<TipRecord> {
    const response = await api.post(`${this.baseUrl}/add`, tipData);
    return response.data.data;
  }

  // Get tips for a specific order
  async getOrderTips(orderId: string): Promise<{
    orderId: string;
    totalTips: number;
    tipCount: number;
    tips: TipRecord[];
  }> {
    const response = await api.get(`${this.baseUrl}/order/${orderId}`);
    return response.data.data;
  }

  // Get tips received by a staff member
  async getStaffTips(
    staffId: string,
    filters?: TipFilters
  ): Promise<{
    staffId: string;
    staffName: string;
    staffRole: string;
    totalTips: number;
    tipCount: number;
    averageTip: number;
    tips: TipRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await api.get(
      `${this.baseUrl}/staff/${staffId}${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Process tip payout
  async processPayout(payoutData: ProcessPayoutRequest): Promise<PayoutRecord> {
    const response = await api.post(`${this.baseUrl}/payout`, payoutData);
    return response.data.data;
  }

  // Get tip statistics
  async getTipStatistics(filters?: {
    restaurantId?: string;
    staffId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<TipStatistics> {
    const queryParams = new URLSearchParams();
    
    if (filters?.restaurantId) queryParams.append('restaurantId', filters.restaurantId);
    if (filters?.staffId) queryParams.append('staffId', filters.staffId);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.groupBy) queryParams.append('groupBy', filters.groupBy);

    const response = await api.get(
      `${this.baseUrl}/statistics${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Update tip status (admin only)
  async updateTipStatus(
    tipId: string,
    status: string,
    adminNote?: string
  ): Promise<TipRecord> {
    const response = await api.patch(`${this.baseUrl}/${tipId}/status`, {
      status,
      adminNote
    });
    return response.data.data;
  }

  // Get tip details
  async getTipDetails(tipId: string): Promise<{
    tipId: string;
    orderId: string;
    amount: number;
    percentage: number;
    currency: string;
    status: string;
    paymentIntentId: string;
    customer: {
      customerId: string;
      name: string;
      email: string;
    };
    recipient: {
      staffId: string;
      name: string;
      role: string;
      email: string;
    };
    order: {
      orderNumber: string;
      totalAmount: number;
      tableNumber: string;
      restaurantId: string;
    };
    payment: {
      paymentMethodId: string;
      last4: string;
      brand: string;
      processingFee: number;
    };
    createdAt: string;
    updatedAt: string;
  }> {
    const response = await api.get(`${this.baseUrl}/${tipId}`);
    return response.data.data;
  }

  // Calculate suggested tips
  async getSuggestedTips(orderId: string): Promise<{
    orderId: string;
    orderTotal: number;
    currency: string;
    suggestions: Array<{
      percentage: number;
      amount: number;
      label: string;
    }>;
    customAmountEnabled: boolean;
    minimumTip: number;
    maximumTip: number;
  }> {
    const response = await api.get(`${this.baseUrl}/suggestions/${orderId}`);
    return response.data.data;
  }

  // Refund tip
  async refundTip(
    tipId: string,
    refundData: {
      reason: string;
      refundAmount: number;
      adminNote?: string;
    }
  ): Promise<{
    refundId: string;
    tipId: string;
    refundAmount: number;
    status: string;
    reason: string;
    processingTime: string;
    refundMethod: string;
    createdAt: string;
  }> {
    const response = await api.post(`${this.baseUrl}/${tipId}/refund`, refundData);
    return response.data.data;
  }

  // Get restaurant tip overview
  async getRestaurantTipOverview(
    restaurantId: string,
    period?: 'today' | 'week' | 'month' | 'quarter' | 'year'
  ): Promise<{
    restaurantId: string;
    restaurantName: string;
    period: string;
    summary: {
      totalTipAmount: number;
      totalTipCount: number;
      averageTipAmount: number;
      averageTipPercentage: number;
      totalStaffMembers: number;
      ordersWithTips: number;
      orderTipPercentage: number;
    };
    staffPerformance: Array<{
      staffId: string;
      name: string;
      role: string;
      totalTips: number;
      tipCount: number;
      averageTip: number;
      tipPercentage: number;
      ranking: number;
    }>;
    dailyTrends: Array<{
      date: string;
      tipAmount: number;
      tipCount: number;
      averageTip: number;
      orderCount: number;
    }>;
    payoutStatus: {
      pendingPayouts: number;
      completedPayouts: number;
      nextPayoutDate: string;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);

    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/overview${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Get recent tips for restaurant
  async getRecentTips(
    restaurantId: string,
    filters?: TipFilters
  ): Promise<TipRecord[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.staffId) queryParams.append('staffId', filters.staffId);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.status) queryParams.append('status', filters.status);

    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/recent${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Get payout history
  async getPayoutHistory(
    restaurantId: string,
    filters?: PayoutFilters
  ): Promise<PayoutRecord[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.staffId) queryParams.append('staffId', filters.staffId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/payouts${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Get restaurant staff members
  async getRestaurantStaff(restaurantId: string): Promise<StaffMember[]> {
    const response = await api.get(`${this.baseUrl}/restaurant/${restaurantId}/staff`);
    return response.data.data;
  }

  // Export tip data
  async exportData(
    restaurantId: string,
    type: 'tips' | 'payouts',
    filters?: {
      startDate?: string;
      endDate?: string;
      staffId?: string;
    },
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    queryParams.append('format', format);
    
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.staffId) queryParams.append('staffId', filters.staffId);

    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/export?${queryParams}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Get tip analytics dashboard data
  async getTipAnalyticsDashboard(
    restaurantId: string,
    filters?: {
      period?: string;
      compareWith?: string;
    }
  ): Promise<{
    period: {
      current: string;
      previous: string;
    };
    overview: {
      totalTips: number;
      averageTip: number;
      totalStaff: number;
      responseRate: number;
      changeFromPrevious: {
        tips: string;
        averageTip: string;
        staff: string;
        response: string;
      };
    };
    tipTrends: Array<{
      date: string;
      averageTip: number;
      tipsCount: number;
      staffCount: number;
    }>;
    staffBreakdown: {
      byRole: Array<{
        role: string;
        averageTip: number;
        totalTips: number;
        staffCount: number;
      }>;
      topPerformers: Array<{
        staffId: string;
        name: string;
        role: string;
        totalTips: number;
        tipCount: number;
        averageTip: number;
      }>;
    };
    payoutInsights: {
      pendingAmount: number;
      completedAmount: number;
      processingFees: number;
      nextPayoutDate: string;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.compareWith) queryParams.append('compareWith', filters.compareWith);

    const response = await api.get(
      `${this.baseUrl}/analytics/dashboard?restaurantId=${restaurantId}${queryParams.toString() ? `&${queryParams}` : ''}`
    );
    return response.data.data;
  }
}

export default new TippingService();