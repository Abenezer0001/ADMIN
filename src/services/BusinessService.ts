import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { 
  Business, 
  CreateBusinessData, 
  UpdateBusinessData,
  BusinessListResponse,
  BusinessResponse 
} from '../types/business';

export class BusinessService {
  private baseUrl: string;    // This is the base URL for the business service  
  private static instance: BusinessService;
  
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public static getInstance(): BusinessService {
    if (!BusinessService.instance) {
      BusinessService.instance = new BusinessService();
    }
    return BusinessService.instance;
  }

  /**
   * Get all businesses (SuperAdmin only)
   */
  static async getAllBusinesses(): Promise<BusinessListResponse> {
    try {
    // Use the working test endpoint while middleware issues are resolved
    const response = await axios.get(`${API_BASE_URL}/test/businesses`, {
      withCredentials: true
    });
    return response.data as BusinessListResponse;
    } catch (error: any) {
      console.error('getAllBusinesses error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get business by ID (SuperAdmin or Owner)
   */
  static async getBusinessById(businessId: string): Promise<Business> {
    try {
    const response = await axios.get(`${API_BASE_URL}/admin/businesses/${businessId}`, {
      withCredentials: true
    });
    return response.data as Business;
    } catch (error: any) {
      console.error('getBusinessById error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new business (SuperAdmin only)
   */
  static async createBusiness(businessData: CreateBusinessData): Promise<BusinessResponse> {
    try {
    const response = await axios.post(`${API_BASE_URL}/admin/businesses`, businessData, {
      withCredentials: true
    });
    return response.data as BusinessResponse;
    } catch (error: any) {
      console.error('createBusiness error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update business (SuperAdmin or Owner)
   */
  static async updateBusiness(businessId: string, updateData: UpdateBusinessData): Promise<BusinessResponse> {
    try {
    const response = await axios.put(`${API_BASE_URL}/admin/businesses/${businessId}`, updateData, {
      withCredentials: true
    });
    return response.data as BusinessResponse;
    } catch (error: any) {
      console.error('updateBusiness error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Deactivate business (SuperAdmin only)
   */
  static async deactivateBusiness(businessId: string): Promise<{ message: string }> {
    try {
    const response = await axios.delete(`${API_BASE_URL}/admin/businesses/${businessId}`, {
      withCredentials: true
    });
    return response.data as { message: string };
    } catch (error: any) {
      console.error('deactivateBusiness error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Activate business (SuperAdmin only)
   */
  static async activateBusiness(businessId: string): Promise<{ message: string }> {
    try {
    const response = await axios.put(`${API_BASE_URL}/admin/businesses/${businessId}/activate`, null, {
      withCredentials: true
    });
    return response.data as { message: string };
    } catch (error: any) {
      console.error('activateBusiness error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get current user's business (Business Owner)
   */
  static async getMyBusiness(): Promise<Business> {
    try {
      console.log('Attempting to get my business from:', `${API_BASE_URL}/businesses/my-business`);
    const response = await axios.get(`${API_BASE_URL}/businesses/my-business`, {
      withCredentials: true
    });
      console.log('getMyBusiness response:', response.data);
    return response.data as Business;
    } catch (error: any) {
      console.error('getMyBusiness error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get business users
   */
  static async getBusinessUsers(): Promise<{ users: any[], count: number }> {
    try {
    const response = await axios.get(`${API_BASE_URL}/auth/users/business-users`, {
      withCredentials: true
    });
    return response.data as { users: any[], count: number };
    } catch (error: any) {
      console.error('getBusinessUsers error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create business user
   */
  static async createBusinessUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    roleIds?: string[];
  }): Promise<{ message: string; user: any }> {
    try {
    const response = await axios.post(`${API_BASE_URL}/auth/users/create-business-user`, userData, {
      withCredentials: true
    });
    return response.data as { message: string; user: any };
    } catch (error: any) {
      console.error('createBusinessUser error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  static async assignRoleToUser(userId: string, roleId: string): Promise<{ message: string }> {
    try {
    const response = await axios.post(`${API_BASE_URL}/auth/users/${userId}/assign-role`, {
      roleId
    }, {
      withCredentials: true
    });
    return response.data as { message: string };
    } catch (error: any) {
      console.error('assignRoleToUser error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Assign business to user
   */
  static async assignBusinessToUser(userId: string, businessId: string): Promise<{ message: string }> {
    try {
    const response = await axios.post(`${API_BASE_URL}/auth/users/${userId}/assign-business`, {
      businessId
    }, {
      withCredentials: true
    });
    return response.data as { message: string };
    } catch (error: any) {
      console.error('assignBusinessToUser error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update current user's business (Business Owner)
   */
  static async updateMyBusiness(updateData: UpdateBusinessData): Promise<BusinessResponse> {
    try {
      // Get the current business first to get the business ID
      const currentBusiness = await this.getMyBusiness();
      const response = await axios.put(`${API_BASE_URL}/admin/businesses/${currentBusiness.id}`, updateData, {
        withCredentials: true
      });
      console.log('updateMyBusiness response:', response.data);
      return response.data as BusinessResponse;
    } catch (error: any) {
      console.error('updateMyBusiness error:', error.response?.data || error.message);
      throw error;
    }
  }

  async fetchBusinesses(): Promise<Business[]> {
    try {
      console.log('BusinessService: Fetching businesses...');
      
      // Use the working test endpoint while we fix the middleware issue
      const response = await fetch(`${API_BASE_URL}/test/businesses`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('BusinessService: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('BusinessService: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('BusinessService: Response data:', data);

      // Handle both array response and object with businesses property
      const businesses = Array.isArray(data) ? data : (data.businesses || []);
      console.log('BusinessService: Parsed businesses:', businesses);
      
      return businesses;
    } catch (error) {
      console.error('BusinessService: Error fetching businesses:', error);
      throw error;
    }
  }
}

export default BusinessService; 