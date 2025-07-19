import axios from 'axios';

export interface LoyaltyAnalytics {
  totalCustomers: number;
  totalVisits: number;
  totalSpent: number;
  totalSavings: number;
  averageVisitsPerCustomer: number;
  averageSpentPerCustomer: number;
  tierDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

export interface LoyaltyCustomer {
  _id: string;
  customerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  currentTier: string;
  totalVisits: number;
  totalSpent: number;
}

export interface LoyaltyCustomersResponse {
  customers: LoyaltyCustomer[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerQuery {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class LoyaltyService {
  private static baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  static async getRestaurantAnalytics(restaurantId: string): Promise<{
    success: boolean;
    data?: LoyaltyAnalytics;
    message?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/loyalty/analytics/${restaurantId}`,
        { withCredentials: true }
      );
      return { success: true, data: response.data as LoyaltyAnalytics };
    } catch (error: any) {
      console.error('Error fetching loyalty analytics:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch loyalty analytics'
      };
    }
  }

  static async getRestaurantCustomers(
    restaurantId: string,
    query: CustomerQuery = {}
  ): Promise<{
    success: boolean;
    data?: LoyaltyCustomersResponse;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.page) params.append('page', query.page.toString());
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);

      const response = await axios.get(
        `${this.baseURL}/api/loyalty/customers/${restaurantId}?${params.toString()}`,
        { withCredentials: true }
      );
      return { success: true, data: response.data as LoyaltyCustomersResponse };
    } catch (error: any) {
      console.error('Error fetching loyalty customers:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch loyalty customers'
      };
    }
  }

  static async updateLoyaltySettings(
    restaurantId: string,
    settings: any
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      // Transform frontend settings to match backend structure
      const backendSettings = {
        isEnabled: settings.isEnabled,
        settings: {
          firstTimeDiscountPercent: settings.settings.firstTimeDiscountPercent,
          timeBased: settings.settings.timeBased,
          frequencyTiers: {
            bronze: {
              minVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Bronze')?.minVisits || 1,
              maxVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Bronze')?.maxVisits || 5,
              bonusPercent: settings.settings.frequencyTiers.find((t: any) => t.name === 'Bronze')?.bonus || 0
            },
            silver: {
              minVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Silver')?.minVisits || 6,
              maxVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Silver')?.maxVisits || 15,
              bonusPercent: settings.settings.frequencyTiers.find((t: any) => t.name === 'Silver')?.bonus || 2
            },
            gold: {
              minVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Gold')?.minVisits || 16,
              maxVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Gold')?.maxVisits || 30,
              bonusPercent: settings.settings.frequencyTiers.find((t: any) => t.name === 'Gold')?.bonus || 5
            },
            platinum: {
              minVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Platinum')?.minVisits || 31,
              maxVisits: settings.settings.frequencyTiers.find((t: any) => t.name === 'Platinum')?.maxVisits || 999999,
              bonusPercent: settings.settings.frequencyTiers.find((t: any) => t.name === 'Platinum')?.bonus || 10
            }
          },
          maxDiscountCap: settings.settings.maxDiscountCap,
          allowStackingWithPromotions: settings.settings.allowStackingWithPromotions
        }
      };

      const response = await axios.post(
        `${this.baseURL}/api/loyalty/program/${restaurantId}`,
        backendSettings,
        { withCredentials: true }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating loyalty settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update loyalty settings'
      };
    }
  }

  static async getLoyaltySettings(restaurantId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/loyalty/program/${restaurantId}`,
        { withCredentials: true }
      );
      
      // Transform backend response to frontend format
      const backendData = response.data as any;
      if (backendData.success && backendData.data) {
        const loyaltyProgram = backendData.data;
        const frontendData = {
          isEnabled: loyaltyProgram.isEnabled,
          settings: {
            firstTimeDiscountPercent: loyaltyProgram.settings?.firstTimeDiscountPercent || 10,
            timeBased: loyaltyProgram.settings?.timeBased || {
              within24Hours: 15,
              within2To3Days: 10,
              within4To5Days: 5,
              after5Days: 0
            },
            frequencyTiers: [
              {
                name: 'Bronze',
                minVisits: loyaltyProgram.settings?.frequencyTiers?.bronze?.minVisits || 1,
                maxVisits: loyaltyProgram.settings?.frequencyTiers?.bronze?.maxVisits || 5,
                bonus: loyaltyProgram.settings?.frequencyTiers?.bronze?.bonusPercent || 0
              },
              {
                name: 'Silver',
                minVisits: loyaltyProgram.settings?.frequencyTiers?.silver?.minVisits || 6,
                maxVisits: loyaltyProgram.settings?.frequencyTiers?.silver?.maxVisits || 15,
                bonus: loyaltyProgram.settings?.frequencyTiers?.silver?.bonusPercent || 2
              },
              {
                name: 'Gold',
                minVisits: loyaltyProgram.settings?.frequencyTiers?.gold?.minVisits || 16,
                maxVisits: loyaltyProgram.settings?.frequencyTiers?.gold?.maxVisits || 30,
                bonus: loyaltyProgram.settings?.frequencyTiers?.gold?.bonusPercent || 5
              },
              {
                name: 'Platinum',
                minVisits: loyaltyProgram.settings?.frequencyTiers?.platinum?.minVisits || 31,
                maxVisits: loyaltyProgram.settings?.frequencyTiers?.platinum?.maxVisits === 999999 ? null : loyaltyProgram.settings?.frequencyTiers?.platinum?.maxVisits,
                bonus: loyaltyProgram.settings?.frequencyTiers?.platinum?.bonusPercent || 10
              }
            ],
            maxDiscountCap: loyaltyProgram.settings?.maxDiscountCap || 30,
            allowStackingWithPromotions: loyaltyProgram.settings?.allowStackingWithPromotions || true
          }
        };
        return { success: true, data: frontendData };
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching loyalty settings:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch loyalty settings'
      };
    }
  }
}