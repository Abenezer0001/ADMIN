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
    // Use the correct admin business endpoint
    const response = await axios.get(`${API_BASE_URL}/admin/businesses`, {
      withCredentials: true
    });
    return response.data as BusinessListResponse;
    } catch (error: any) {
      console.error('getAllBusinesses error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Test authentication by checking if we can access a simple endpoint
   */
  static async testAuthentication(): Promise<any> {
    try {
      console.log('Testing authentication...');
      console.log('Current cookies:', document.cookie);
      
      // Use the correct authentication endpoint
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Auth test successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Auth test failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  /**
   * Test system admin debug endpoint
   */
  static async testSystemAdminAuth(): Promise<any> {
    try {
      console.log('Testing system admin authentication...');
      
      // Use the correct authentication endpoint to check user role
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('System admin auth test successful:', response.data);
      
      // Check if user has system admin role
      const user = response.data.user || response.data;
      if (user.role !== 'system_admin' && !user.roles?.includes('system_admin')) {
        throw new Error('User does not have system admin privileges');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('System admin auth test failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get business by ID (SuperAdmin or Owner) - try test endpoint first
   */
  static async getBusinessById(businessId: string): Promise<Business> {
    try {
      console.log('Attempting to fetch business by ID:', businessId);
      console.log('Request URL:', `${API_BASE_URL}/admin/businesses/${businessId}`);
      
      // Check if we have authentication cookies
      console.log('Current cookies:', document.cookie);
      
      // First try the authentication endpoint to check if auth is working
      try {
        console.log('Testing authentication with auth endpoint...');
        const authTest = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true
        });
        console.log('Authentication test passed:', authTest.data);
      } catch (authError: any) {
        console.error('Authentication test failed:', authError.response?.data);
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/businesses/${businessId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('getBusinessById response:', response.data);
      return response.data as Business;
    } catch (error: any) {
      console.error('getBusinessById error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Provide more descriptive error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You don\'t have permission to view this business.');
      } else if (error.response?.status === 404) {
        throw new Error('Business not found.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Create a new business (SuperAdmin only)
   */
  static async createBusiness(businessData: CreateBusinessData): Promise<BusinessResponse> {
    try {
    // Use the correct admin business endpoint
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
      const response = await axios.put(`${API_BASE_URL}/admin/businesses/${currentBusiness._id}`, updateData, {
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
      
      // Use the correct admin business endpoint
      const response = await fetch(`${API_BASE_URL}/admin/businesses`, {
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