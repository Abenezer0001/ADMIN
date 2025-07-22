import { api, API_BASE_URL } from '../utils/apiUtils';

export interface SalesDashboardData {
  totalSales: {
    amount: number;
    currency: string;
    period: string;
  };
  averageSales: {
    amount: number;
    currency: string;
    period: string;
  };
  topPerformer: {
    id: string;
    name: string;
    sales: number;
    currency: string;
  } | null;
  lowestPerformer: {
    id: string;
    name: string;
    sales: number;
    currency: string;
  } | null;
}

export interface SalesRestaurantsData {
  restaurants: Array<{
    id: string;
    name: string;
    totalSales: number;
    currency: string;
    actions: string[];
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface OrderPerformanceData {
  overview: {
    totalOrders: {
      count: number;
      period: string;
      change: {
        percentage: number;
        direction: string;
      };
    };
    averageOrderValue: {
      amount: number;
      currency: string;
      period: string;
      change: {
        percentage: number;
        direction: string;
      };
    };
    completionRate: {
      percentage: number;
      description: string;
      change: {
        percentage: number;
        direction: string;
      };
    };
    processingTime: {
      value: number;
      unit: string;
      description: string;
      change: {
        percentage: number;
        direction: string;
      };
    };
  };
}

export interface MenuOverviewData {
  overview: {
    totalMenuItems: {
      count: number;
      label: string;
    };
    topCategory: {
      name: string;
      description: string;
    };
    averageRating: {
      value: number;
      description: string;
    };
    profitMargin: {
      percentage: number;
      description: string;
    };
  };
}

export interface DashboardOverviewData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    uniqueUsers: {
      count: number;
      label: string;
    };
    ephi: {
      value: number;
      label: string;
    };
    totalRevenue: {
      amount: number;
      currency: string;
      label: string;
    };
  };
  restaurantTabs: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
}

export interface HourlyDistributionData {
  hourlyDistribution: Array<{
    hour: number;
    orderCount: number;
    revenue: number;
  }>;
}

export interface TopSellingItemsData {
  topSellingItems: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    currency: string;
  }>;
}

export interface MonthlyOrdersData {
  monthlyOrders: Array<{
    month: string;
    orderCount: number;
    revenue: number;
    currency: string;
  }>;
}

export interface BestSellersData {
  bestSellers: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    currency: string;
    category: string;
  }>;
}

class AnalyticsService {
  private baseUrl = `${API_BASE_URL}/analytics`;

  // Sales Dashboard APIs
  async getSalesDashboard(params?: {
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<SalesDashboardData> {
    const queryParams = new URLSearchParams();
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const response = await api.get(
      `${this.baseUrl}/sales/dashboard${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  async getSalesRestaurants(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<SalesRestaurantsData> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(
      `${this.baseUrl}/sales/restaurants${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  // Order Performance APIs
  async getOrderPerformanceOverview(params?: {
    period?: string;
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<OrderPerformanceData> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(
      `${this.baseUrl}/orders/overview${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  async getHourlyOrderDistribution(params?: {
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<HourlyDistributionData> {
    const queryParams = new URLSearchParams();
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(
      `${this.baseUrl}/orders/hourly-distribution${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  // Menu Report APIs
  async getMenuOverview(params?: {
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<MenuOverviewData> {
    const queryParams = new URLSearchParams();
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(
      `${this.baseUrl}/menu/overview${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  async getTopSellingItems(params?: {
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<TopSellingItemsData> {
    const queryParams = new URLSearchParams();
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(
      `${this.baseUrl}/menu/top-selling${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  // Main Dashboard APIs
  async getDashboardOverview(params?: {
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardOverviewData> {
    const queryParams = new URLSearchParams();
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(
      `${this.baseUrl}/dashboard/overview${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  async getMonthlyOrders(params?: {
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<MonthlyOrdersData> {
    const queryParams = new URLSearchParams();
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(
      `${this.baseUrl}/dashboard/monthly-orders${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }

  async getBestSellers(params?: {
    restaurantIds?: string[];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<BestSellersData> {
    const queryParams = new URLSearchParams();
    if (params?.restaurantIds) {
      queryParams.append('restaurantIds', params.restaurantIds.join(','));
    }
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(
      `${this.baseUrl}/dashboard/best-sellers${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data;
  }
}

export default new AnalyticsService();
