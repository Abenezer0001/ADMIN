import { api, API_BASE_URL } from '../utils/apiUtils';

// Rating-related interfaces
export interface Review {
  _id: string;
  menuItemId: string;
  restaurantId: string;
  userId: string;
  orderId?: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  helpfulVotes: {
    up: number;
    down: number;
  };
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields when available
  user?: {
    firstName: string;
    lastName: string;
  };
  menuItem?: {
    name: string;
    description: string;
    price: number;
  };
  restaurant?: {
    name: string;
  };
}

export interface RatingAggregated {
  average: number;
  count: number;
  wilsonScore: number;
  bayesianAverage: number;
  recentTrend: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface MenuItemRatingData {
  aggregated: RatingAggregated;
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface RestaurantRatingData {
  aggregated: RatingAggregated;
  topRatedItems: Array<{
    entityId: string;
    aggregatedData: RatingAggregated;
    name?: string;
    description?: string;
    price?: number;
  }>;
}

export interface RatingAnalytics {
  restaurantOverview: RatingAggregated;
  menuItemsPerformance: Array<{
    menuItemId: string;
    name: string;
    category: string;
    averageRating: number;
    totalReviews: number;
    recentTrend: number;
    needsAttention: boolean;
  }>;
  reviewTrends: Array<{
    date: string;
    averageRating: number;
    reviewCount: number;
  }>;
  customerInsights: {
    topReviewers: Array<{
      userId: string;
      userName: string;
      reviewCount: number;
      averageRating: number;
      verifiedPurchases: number;
    }>;
    reviewFrequency: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  alertItems: Array<{
    type: 'low_rating' | 'no_reviews' | 'trending_down';
    menuItemId: string;
    menuItemName: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export interface CreateReviewRequest {
  menuItemId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  orderId?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low' | 'verified';
  minRating?: number;
  maxRating?: number;
  verifiedOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

class RatingService {
  private baseUrl = `${API_BASE_URL}/v1/ratings`;

  // Submit new rating/review
  async submitReview(reviewData: CreateReviewRequest): Promise<Review> {
    const response = await api.post(`${this.baseUrl}`, reviewData);
    return response.data.data;
  }

  // Get ratings for a specific menu item
  async getMenuItemRatings(
    menuItemId: string,
    filters?: ReviewFilters
  ): Promise<MenuItemRatingData> {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);

    const response = await api.get(
      `${this.baseUrl}/menu-item/${menuItemId}${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Get restaurant aggregate ratings
  async getRestaurantRatings(restaurantId: string): Promise<RestaurantRatingData> {
    const response = await api.get(`${this.baseUrl}/restaurant/${restaurantId}`);
    return response.data.data;
  }

  // Get all reviews for a restaurant with advanced filtering
  async getRestaurantReviews(
    restaurantId: string,
    filters?: ReviewFilters
  ): Promise<{ reviews: Review[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.minRating) queryParams.append('minRating', filters.minRating.toString());
    if (filters?.maxRating) queryParams.append('maxRating', filters.maxRating.toString());
    if (filters?.verifiedOnly) queryParams.append('verifiedOnly', 'true');
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.searchTerm) queryParams.append('search', filters.searchTerm);

    // Custom endpoint for restaurant admin to get all reviews
    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/reviews${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Update a review
  async updateReview(reviewId: string, updateData: UpdateReviewRequest): Promise<Review> {
    const response = await api.put(`${this.baseUrl}/${reviewId}`, updateData);
    return response.data.data;
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${reviewId}`);
  }

  // Get user's ratings
  async getUserRatings(userId: string, page?: number, limit?: number): Promise<{
    reviews: Review[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());

    const response = await api.get(
      `${this.baseUrl}/user/${userId}${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Mark review as helpful
  async markReviewHelpful(reviewId: string, helpful: boolean): Promise<void> {
    await api.post(`${this.baseUrl}/${reviewId}/helpful`, { helpful });
  }

  // Flag a review (admin action)
  async flagReview(reviewId: string, reason?: string): Promise<void> {
    await api.post(`${this.baseUrl}/${reviewId}/flag`, { reason });
  }

  // Unflag a review (admin action)
  async unflagReview(reviewId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${reviewId}/unflag`);
  }

  // Get comprehensive rating analytics for restaurant admin
  async getRestaurantRatingAnalytics(
    restaurantId: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<RatingAnalytics> {
    const queryParams = new URLSearchParams();
    if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);

    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/analytics${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Get menu items performance for restaurant
  async getMenuItemsRatingPerformance(
    restaurantId: string,
    filters?: {
      categoryId?: string;
      sortBy?: 'rating' | 'review_count' | 'recent_activity';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    items: Array<{
      menuItemId: string;
      name: string;
      category: string;
      averageRating: number;
      totalReviews: number;
      recentTrend: number;
      lastReviewDate: string;
      needsAttention: boolean;
      ratingDistribution: RatingAggregated['distribution'];
    }>;
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/menu-items/performance${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  }

  // Get rating trends over time
  async getRatingTrends(
    restaurantId: string,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<Array<{
    date: string;
    averageRating: number;
    reviewCount: number;
    verifiedReviewCount: number;
  }>> {
    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/trends?period=${period}`
    );
    return response.data.data;
  }

  // Export reviews to CSV
  async exportReviews(
    restaurantId: string,
    filters?: ReviewFilters,
    format: 'csv' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.minRating) queryParams.append('minRating', filters.minRating.toString());
    if (filters?.maxRating) queryParams.append('maxRating', filters.maxRating.toString());
    if (filters?.verifiedOnly) queryParams.append('verifiedOnly', 'true');

    const response = await api.get(
      `${this.baseUrl}/restaurant/${restaurantId}/export?${queryParams}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Get low rating alerts
  async getLowRatingAlerts(restaurantId: string): Promise<Array<{
    menuItemId: string;
    menuItemName: string;
    currentRating: number;
    reviewCount: number;
    alertType: 'critical' | 'warning';
    message: string;
    createdAt: string;
  }>> {
    const response = await api.get(`${this.baseUrl}/restaurant/${restaurantId}/alerts`);
    return response.data.data;
  }

  // Respond to review (if backend supports)
  async respondToReview(reviewId: string, response: string): Promise<void> {
    await api.post(`${this.baseUrl}/${reviewId}/respond`, { response });
  }

  // Get review response
  async getReviewResponse(reviewId: string): Promise<{
    response: string;
    respondedAt: string;
    respondedBy: string;
  } | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${reviewId}/response`);
      return response.data.data;
    } catch (error) {
      // No response exists
      return null;
    }
  }
}

export default new RatingService();