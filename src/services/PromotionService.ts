import { API_BASE_URL } from '../utils/config';
import api from '../utils/axiosConfig';

export interface ICombo {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  menuItems: string[]; // Array of menu item IDs
  isActive: boolean;
}

export interface IPromotion {
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  restaurantId: string;
  enabledVenues: string[]; // Array of venue IDs where promotion is enabled
  isActive: boolean;
  displayOnSplash: boolean;
  startDate: Date | string;
  endDate: Date | string;
  combos: ICombo[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICreatePromotionRequest {
  title: string;
  description?: string;
  imageUrl: string;
  restaurantId: string;
  enabledVenues?: string[];
  isActive?: boolean;
  displayOnSplash?: boolean;
  startDate: string;
  endDate: string;
  combos?: ICombo[];
}

export interface IUpdatePromotionRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  enabledVenues?: string[];
  isActive?: boolean;
  displayOnSplash?: boolean;
  startDate?: string;
  endDate?: string;
  combos?: ICombo[];
}

export interface IPromotionListResponse {
  promotions: IPromotion[];
  total: number;
  page: number;
  limit: number;
}

export interface IMenuItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  restaurantId: string;
  venueId?: string;
  isActive: boolean;
  preparationTime?: number;
}

export interface IVenue {
  _id: string;
  name: string;
  description?: string;
  restaurantId: string;
  capacity?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive: boolean;
}

export interface IRestaurant {
  _id: string;
  name: string;
  description?: string;
  businessId?: string;
  venues?: IVenue[];
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  try {
    // First check localStorage for token
    const localToken = localStorage.getItem('auth_token');
    if (localToken && localToken !== 'http-only-cookie-present' && localToken.length > 10) {
      return localToken;
    }
    
    // Check for tokens in cookies (non-HTTP-only)
    const cookies = document.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(cookie => 
      cookie.startsWith('auth_token=') || 
      cookie.startsWith('access_token=')
    );
    
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      // Store in localStorage for future use
      localStorage.setItem('auth_token', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

class PromotionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Include credentials and authorization header for admin endpoints
  private getRequestOptions(method: string = 'GET', body?: any): RequestInit {
    const token = getAuthToken();
    
    const options: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add authorization header if token is available
    if (token) {
      (options.headers as any)['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  /**
   * Get all promotions for a restaurant or all promotions for system admin
   */
  async getPromotions(restaurantId?: string, venueId?: string): Promise<{ promotions: IPromotion[]; venues: IVenue[] }> {
    try {
      let url = `${this.baseUrl}/admin-promotions`;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (restaurantId) {
        params.append('restaurantId', restaurantId);
      }
      if (venueId) {
        params.append('venueId', venueId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch promotions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return { promotions: data, venues: [] };
      } else if (data.promotions && Array.isArray(data.promotions)) {
        return { promotions: data.promotions, venues: data.venues || [] };
      } else {
        return { promotions: data, venues: [] };
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  }

  /**
   * Get all restaurants across all businesses (system admin only)
   */
  async getAllRestaurants(): Promise<IRestaurant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/restaurants`, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch restaurants: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching all restaurants:', error);
      throw error;
    }
  }

  /**
   * Get all venues across all restaurants (system admin only)
   */
  async getAllVenues(): Promise<IVenue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/venues`, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch venues: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching all venues:', error);
      // Return empty array if endpoint doesn't exist or fails
      return [];
    }
  }

  /**
   * Get a specific promotion by ID
   */
  async getPromotion(promotionId: string): Promise<IPromotion> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions/${promotionId}`, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch promotion: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching promotion:', error);
      throw error;
    }
  }

  /**
   * Create a new promotion (JSON)
   */
  async createPromotion(promotionData: Partial<IPromotion>): Promise<IPromotion> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions`, {
        ...this.getRequestOptions(),
        method: 'POST',
        body: JSON.stringify(promotionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create promotion: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  /**
   * Create a new promotion with image upload
   */
  async createPromotionWithImage(formData: FormData): Promise<IPromotion> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // Don't set Content-Type header - let browser set multipart/form-data boundary
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create promotion: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating promotion with image:', error);
      throw error;
    }
  }

  /**
   * Update an existing promotion (JSON)
   */
  async updatePromotion(promotionId: string, promotionData: Partial<IPromotion>): Promise<IPromotion> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions/${promotionId}`, {
        ...this.getRequestOptions(),
        method: 'PUT',
        body: JSON.stringify(promotionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update promotion: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  /**
   * Update an existing promotion with image upload
   */
  async updatePromotionWithImage(promotionId: string, formData: FormData): Promise<IPromotion> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions/${promotionId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData, // Don't set Content-Type header - let browser set multipart/form-data boundary
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update promotion: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating promotion with image:', error);
      throw error;
    }
  }

  /**
   * Delete a promotion
   */
  async deletePromotion(promotionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions/${promotionId}`, {
        ...this.getRequestOptions(),
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete promotion: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }

  /**
   * Get menu items for a restaurant (for combo creation)
   */
  async getMenuItems(restaurantId: string): Promise<IMenuItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions/restaurants/${restaurantId}/menu-items`, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch menu items: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  /**
   * Get menu items for a specific venue (for venue-specific combo creation)
   */
  async getMenuItemsByVenue(restaurantId: string, venueId: string): Promise<IMenuItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions/restaurants/${restaurantId}/venues/${venueId}/menu-items`, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch menu items for venue: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching menu items for venue:', error);
      throw error;
    }
  }

  /**
   * Get venues for a restaurant (for venue enablement)
   */
  async getVenues(restaurantId: string): Promise<IVenue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin-promotions/restaurants/${restaurantId}/venues`, this.getRequestOptions());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch venues: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  }

  /**
   * Get restaurants for a business
   */
  async getRestaurantsByBusiness(businessId: string): Promise<IRestaurant[]> {
    try {
      const { RestaurantService } = await import('./RestaurantService');
      const restaurants = await RestaurantService.getRestaurantsByBusiness(businessId);
      return restaurants as IRestaurant[];
    } catch (error) {
      console.error('Error fetching restaurants for business:', error);
      throw new Error('Failed to fetch restaurants for business');
    }
  }

  /**
   * Upload promotion image (if needed)
   */
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/promotion-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

const promotionService = new PromotionService();
export default promotionService; 