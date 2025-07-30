import { api, API_BASE_URL } from '../utils/apiUtils';

// Stripe Connect interfaces
export interface ConnectedAccount {
  _id: string;
  restaurantId: string;
  stripeAccountId: string;
  accountStatus: 'pending' | 'active' | 'restricted' | 'inactive';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  country: string;
  currency: string;
  businessType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformFeeSettings {
  _id: string;
  restaurantId: string;
  feeType: 'percentage' | 'fixed' | 'hybrid';
  percentageRate: number;
  fixedAmount: number;
  minimumFee: number;
  maximumFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  _id: string;
  orderId: string;
  restaurantId: string;
  stripePaymentIntentId: string;
  amount: number;
  platformFee: number;
  restaurantEarnings: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: string;
  processedAt: Date;
  createdAt: Date;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  platformFees: number;
  restaurantEarnings: number;
  transactionCount: number;
  averageOrderValue: number;
  successRate: number;
  dailyBreakdown: {
    date: string;
    revenue: number;
    fees: number;
    transactions: number;
  }[];
  paymentMethodDistribution: {
    method: string;
    count: number;
    percentage: number;
  }[];
}

export interface OnboardingLink {
  url: string;
  expiresAt: number;
}

export interface CreateAccountRequest {
  restaurantId: string;
  businessType: 'individual' | 'company';
  country: string;
  email: string;
}

export interface UpdateFeeSettingsRequest {
  feeType: 'percentage' | 'fixed' | 'hybrid';
  percentageRate?: number;
  fixedAmount?: number;
  minimumFee?: number;
  maximumFee?: number;
}

export interface ProcessPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  restaurantId: string;
}

class StripeConnectService {
  private baseUrl = `${API_BASE_URL}/v1/stripe-connect`;

  // Create connected account
  async createConnectedAccount(data: CreateAccountRequest): Promise<{ account: ConnectedAccount; onboardingUrl: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/accounts`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create connected account');
    }
  }

  // Get connected account details
  async getConnectedAccount(restaurantId: string): Promise<ConnectedAccount> {
    try {
      const response = await api.get(`${this.baseUrl}/accounts/${restaurantId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch connected account');
    }
  }

  // Generate onboarding link
  async createOnboardingLink(restaurantId: string): Promise<OnboardingLink> {
    try {
      const response = await api.post(`${this.baseUrl}/accounts/${restaurantId}/onboarding`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create onboarding link');
    }
  }

  // Create dashboard link
  async createDashboardLink(restaurantId: string): Promise<{ url: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/accounts/${restaurantId}/dashboard`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create dashboard link');
    }
  }

  // Update account status
  async updateAccountStatus(restaurantId: string): Promise<ConnectedAccount> {
    try {
      const response = await api.post(`${this.baseUrl}/accounts/${restaurantId}/refresh`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update account status');
    }
  }

  // Get platform fee settings
  async getFeeSettings(restaurantId: string): Promise<PlatformFeeSettings> {
    try {
      const response = await api.get(`${this.baseUrl}/fee-settings/${restaurantId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch fee settings');
    }
  }

  // Update platform fee settings
  async updateFeeSettings(restaurantId: string, data: UpdateFeeSettingsRequest): Promise<PlatformFeeSettings> {
    try {
      const response = await api.put(`${this.baseUrl}/fee-settings/${restaurantId}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update fee settings');
    }
  }

  // Process payment with platform fee
  async processPayment(data: ProcessPaymentRequest): Promise<PaymentRecord> {
    try {
      const response = await api.post(`${this.baseUrl}/payments/process`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
  }

  // Get payment records
  async getPaymentRecords(
    restaurantId: string,
    page: number = 1,
    limit: number = 20,
    startDate?: string,
    endDate?: string
  ): Promise<{
    payments: PaymentRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> {
    try {
      const params: any = { page, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${this.baseUrl}/payments/${restaurantId}`, { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment records');
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(
    restaurantId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentAnalytics> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${this.baseUrl}/analytics/${restaurantId}`, { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment analytics');
    }
  }

  // Refund payment
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<{ success: boolean; refundId: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/payments/${paymentId}/refund`, {
        amount,
        reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to refund payment');
    }
  }

  // Get all connected accounts (admin only)
  async getAllConnectedAccounts(page: number = 1, limit: number = 20): Promise<{
    accounts: ConnectedAccount[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/accounts`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch connected accounts');
    }
  }

  // Get platform analytics (admin only)
  async getPlatformAnalytics(startDate?: string, endDate?: string): Promise<{
    totalRevenue: number;
    totalPlatformFees: number;
    totalRestaurantEarnings: number;
    totalTransactions: number;
    connectedAccounts: number;
    dailyBreakdown: {
      date: string;
      revenue: number;
      fees: number;
      transactions: number;
    }[];
    topRestaurants: {
      restaurantId: string;
      restaurantName: string;
      revenue: number;
      transactions: number;
    }[];
  }> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`${this.baseUrl}/platform/analytics`, { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch platform analytics');
    }
  }

  // Calculate platform fee
  calculatePlatformFee(amount: number, feeSettings: PlatformFeeSettings): number {
    let fee = 0;

    switch (feeSettings.feeType) {
      case 'percentage':
        fee = amount * (feeSettings.percentageRate / 100);
        break;
      case 'fixed':
        fee = feeSettings.fixedAmount;
        break;
      case 'hybrid':
        fee = (amount * (feeSettings.percentageRate / 100)) + feeSettings.fixedAmount;
        break;
    }

    // Apply minimum and maximum fee limits
    if (feeSettings.minimumFee && fee < feeSettings.minimumFee) {
      fee = feeSettings.minimumFee;
    }
    if (feeSettings.maximumFee && fee > feeSettings.maximumFee) {
      fee = feeSettings.maximumFee;
    }

    return Math.round(fee * 100) / 100; // Round to 2 decimal places
  }

  // Validate webhook signature (for webhook endpoints)
  async validateWebhook(payload: string, signature: string): Promise<{ valid: boolean; event?: any }> {
    try {
      const response = await api.post(`${this.baseUrl}/webhooks/validate`, {
        payload,
        signature
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to validate webhook');
    }
  }
}

export const stripeConnectService = new StripeConnectService();
export default stripeConnectService;
