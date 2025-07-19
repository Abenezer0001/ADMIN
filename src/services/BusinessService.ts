import axios from 'axios';
import { Business, CreateBusinessRequest, UpdateBusinessRequest, BusinessUser, CreateBusinessUserRequest, BusinessListResponse } from '../types/business';
import { API_BASE_URL } from '../utils/config';

export class BusinessService {
  private static instance: BusinessService;
 
  private constructor() {}

  public static getInstance(): BusinessService {
    if (!BusinessService.instance) {
      BusinessService.instance = new BusinessService();
    }
    return BusinessService.instance;
  }

  /**
   * Test authentication endpoint
   */
  static async testAuthentication(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Authentication test failed:', error);
      throw error;
    }
  }

  /**
   * Helper method to get user role from API (recommended) or localStorage as fallback
   */
  private async getUserRole(): Promise<string | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true
      });
      const data = response.data as any;
      return data?.user?.role || data?.role || null;
    } catch (error) {
      console.error('BusinessService - Failed to get user role from API:', error);
      // Fallback to localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.role || null;
        } catch (localError) {
          console.error('Error parsing user from localStorage:', localError);
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Helper method to get business ID from API (recommended) or localStorage as fallback
   */
  private async getBusinessId(): Promise<string | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true
      });
      const data = response.data as any;
      return data?.user?.businessId || data?.businessId || null;
    } catch (error) {
      console.error('BusinessService - Failed to get business ID from API:', error);
      // Fallback to localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.businessId || null;
        } catch (localError) {
          console.error('Error parsing user from localStorage:', localError);
          return null;
        }
      }
      return null;
    }
  }
      
  /**
   * Get all businesses (system admin only) with multi-endpoint fallback
   */
  async getAllBusinesses(): Promise<BusinessListResponse> {
    try {
      const role = await this.getUserRole();
      
      if (role === 'system_admin') {
        // Try multiple endpoints based on role
        const endpoints = [
          `${API_BASE_URL}/restaurant-service/businesses/admin/businesses`,
          `${API_BASE_URL}/businesses-admin`,
          `${API_BASE_URL}/admin/businesses`
        ];
        
        let lastError: any = null;
        for (const endpoint of endpoints) {
          try {
            console.log(`BusinessService - Trying endpoint: ${endpoint}`);
            const response = await axios.get(endpoint, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log(`BusinessService - Success with endpoint: ${endpoint}`, response.data);
            
            // Handle different response formats
            const data = response.data as any;
            let businesses = [];
            let count = 0;
            
            if (Array.isArray(data)) {
              businesses = data;
              count = data.length;
            } else if (data.businesses && Array.isArray(data.businesses)) {
              businesses = data.businesses;
              count = data.count || data.businesses.length;
            } else if (data.data && Array.isArray(data.data)) {
              businesses = data.data;
              count = data.count || data.data.length;
            }
            
            return {
              businesses: businesses || [],
              count: count || 0
            };
          } catch (error: any) {
            console.log(`BusinessService - Failed with endpoint: ${endpoint}`, error.response?.status, error.message);
            lastError = error;
            continue;
          }
        }
        
        throw lastError || new Error('All business endpoints failed');
      } else {
        throw new Error('Unauthorized: System admin role required');
      }
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch businesses');
    }
  }

  /**
   * Get current user's business (restaurant admin only) with multi-endpoint fallback
   */
  async getMyBusiness(): Promise<Business> {
    try {
      const role = await this.getUserRole();
      
      if (role === 'restaurant_admin') {
        // Try multiple endpoints based on role
        const endpoints = [
          `${API_BASE_URL}/restaurant-service/businesses/my-business`,
          `${API_BASE_URL}/auth/businesses/my-business`
        ];
        
        let lastError: any = null;
        for (const endpoint of endpoints) {
          try {
            console.log(`BusinessService - Trying endpoint: ${endpoint}`);
            const response = await axios.get(endpoint, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log(`BusinessService - Success with endpoint: ${endpoint}`, response.data);
            return response.data as Business;
          } catch (error: any) {
            console.log(`BusinessService - Failed with endpoint: ${endpoint}`, error.response?.status, error.message);
            lastError = error;
            continue;
          }
        }
        
        throw lastError || new Error('All my-business endpoints failed');
      } else {
        throw new Error('Unauthorized: Restaurant admin role required');
      }
    } catch (error: any) {
      console.error('Error fetching my business:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch business');
    }
  }

  /**
   * Get business by ID (system admin and restaurant admin)
   */
  async getBusinessById(businessId: string): Promise<Business> {
    try {
      const role = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      
      if (role === 'system_admin') {
        // Try multiple endpoints for system admin
        const endpoints = [
          `${API_BASE_URL}/restaurant-service/businesses-admin/${businessId}`,
          `${API_BASE_URL}/auth/businesses/${businessId}`,
          `${API_BASE_URL}/admin/businesses/${businessId}`
        ];
        
        let lastError: any = null;
        for (const endpoint of endpoints) {
          try {
            console.log(`BusinessService - Trying endpoint: ${endpoint}`);
            const response = await axios.get(endpoint, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log(`BusinessService - Success with endpoint: ${endpoint}`, response.data);
            return response.data as Business;
          } catch (error: any) {
            console.log(`BusinessService - Failed with endpoint: ${endpoint}`, error.response?.status, error.message);
            lastError = error;
            continue;
          }
        }
        
        throw lastError || new Error('All business endpoints failed');
      } else if (role === 'restaurant_admin') {
        // Restaurant admin can access their own business or any business if they have permission
        const endpoints = [
          `${API_BASE_URL}/restaurant-service/businesses-admin/${businessId}`,
          `${API_BASE_URL}/restaurant-service/businesses/my-business`,
          `${API_BASE_URL}/auth/businesses/${businessId}`
        ];
        
        let lastError: any = null;
        for (const endpoint of endpoints) {
          try {
            console.log(`BusinessService - Trying endpoint: ${endpoint}`);
            const response = await axios.get(endpoint, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log(`BusinessService - Success with endpoint: ${endpoint}`, response.data);
            return response.data as Business;
          } catch (error: any) {
            console.log(`BusinessService - Failed with endpoint: ${endpoint}`, error.response?.status, error.message);
            lastError = error;
            continue;
          }
        }
        
        throw lastError || new Error('All business endpoints failed for restaurant admin');
      } else {
        throw new Error('Unauthorized: Business access requires admin role');
      }
    } catch (error: any) {
      console.error('Error fetching business:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch business');
    }
  }

  /**
   * Create a new business (system admin only)
   */
  async createBusiness(businessData: CreateBusinessRequest): Promise<Business> {
    try {
      const role = await this.getUserRole();
      
      if (role === 'system_admin') {
        // Use the working businesses-admin route
        const response = await axios.post(`${API_BASE_URL}/businesses-admin`, businessData, {
          withCredentials: true,
        });
        
        // Handle the response format: {message: string, business: Business, owner: {...}, emailSent: boolean}
        const data = response.data as { message: string; business: Business; owner: any; emailSent: boolean };
        return data.business;
      } else {
        throw new Error('Unauthorized: System admin role required');
      }
    } catch (error: any) {
      console.error('Error creating business:', error);
      throw new Error(error.response?.data?.message || 'Failed to create business');
    }
  }

  /**
   * Update a business
   */
  async updateBusiness(businessId: string, updateData: UpdateBusinessRequest): Promise<Business> {
    try {
      const role = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      
      if (role === 'system_admin') {
        // System admin can update any business
        const response = await axios.put(`${API_BASE_URL}/businesses-admin/${businessId}`, updateData, {
          withCredentials: true,
        });
        return response.data as Business;
      } else if (role === 'restaurant_admin' && userBusinessId === businessId) {
        // Restaurant admin can only update their own business
        const response = await axios.put(`${API_BASE_URL}/businesses/my-business`, updateData, {
          withCredentials: true,
    });
        return response.data as Business;
      } else {
        throw new Error('Unauthorized: You can only update your own business');
      }
    } catch (error: any) {
      console.error('Error updating business:', error);
      throw new Error(error.response?.data?.message || 'Failed to update business');
    }
  }

  /**
   * Delete a business (system admin only)
   */
  async deleteBusiness(businessId: string): Promise<void> {
    try {
      const role = await this.getUserRole();
      
      if (role === 'system_admin') {
        await axios.delete(`${API_BASE_URL}/businesses-admin/${businessId}`, {
          withCredentials: true,
        });
      } else {
        throw new Error('Unauthorized: System admin role required');
      }
    } catch (error: any) {
      console.error('Error deleting business:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete business');
    }
  }

  /**
   * Activate a business (system admin only)
   */
  async activateBusiness(businessId: string): Promise<Business> {
    try {
      const role = await this.getUserRole();
      
      if (role === 'system_admin') {
        const response = await axios.post(`${API_BASE_URL}/businesses-admin/${businessId}/activate`, {}, {
          withCredentials: true,
    });
        
        return response.data as Business;
      } else {
        throw new Error('Unauthorized: System admin role required');
      }
    } catch (error: any) {
      console.error('Error activating business:', error);
      throw new Error(error.response?.data?.message || 'Failed to activate business');
    }
  }

  /**
   * Deactivate a business (system admin only)
   */
  async deactivateBusiness(businessId: string): Promise<Business> {
    try {
      const role = await this.getUserRole();
      
      if (role === 'system_admin') {
        const response = await axios.post(`${API_BASE_URL}/businesses-admin/${businessId}/deactivate`, {}, {
          withCredentials: true,
    });
        
    return response.data as Business;
      } else {
        throw new Error('Unauthorized: System admin role required');
      }
    } catch (error: any) {
      console.error('Error deactivating business:', error);
      throw new Error(error.response?.data?.message || 'Failed to deactivate business');
    }
  }

  /**
   * Get business users with multi-endpoint fallback
   */
  async getBusinessUsers(businessId?: string): Promise<{ users: BusinessUser[]; count: number }> {
    try {
      const role = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      
      let targetBusinessId = businessId;
      
      if (!targetBusinessId && role === 'restaurant_admin') {
        targetBusinessId = userBusinessId;
      }
      
      if (!targetBusinessId) {
        throw new Error('Business ID not found');
      }
      
      // Try multiple endpoints based on role
      let endpoints: string[] = [];
      if (role === 'system_admin') {
        endpoints = [
          `${API_BASE_URL}/restaurant-service/businesses/admin/businesses/${targetBusinessId}/users`,
          `${API_BASE_URL}/businesses-admin/${targetBusinessId}/users`,
          `${API_BASE_URL}/admin/businesses/${targetBusinessId}/users`
        ];
      } else if (role === 'restaurant_admin') {
        endpoints = [
          `${API_BASE_URL}/business-admin/admins`,
          `${API_BASE_URL}/restaurant-service/businesses/admin/businesses/${targetBusinessId}/users`,
          `${API_BASE_URL}/businesses-admin/${targetBusinessId}/users`,
          `${API_BASE_URL}/admin/businesses/${targetBusinessId}/users`
        ];
      } else {
        throw new Error('Unauthorized: Insufficient permissions');
      }
      
      let lastError: any = null;
      for (const endpoint of endpoints) {
        try {
          console.log(`BusinessService - Trying endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log(`BusinessService - Success with endpoint: ${endpoint}`, response.data);
          
          // Handle different response formats
          const data = response.data as any;
          let users = [];
          let count = 0;
          
          if (Array.isArray(data)) {
            users = data;
            count = data.length;
          } else if (data.users && Array.isArray(data.users)) {
            users = data.users;
            count = data.count || data.users.length;
          } else if (data.admins && Array.isArray(data.admins)) {
            users = data.admins;
            count = data.count || data.admins.length;
          }
          
          return {
            users: users || [],
            count: count || 0
          };
        } catch (error: any) {
          console.log(`BusinessService - Failed with endpoint: ${endpoint}`, error.response?.status, error.message);
          lastError = error;
          continue;
        }
      }
      
      throw lastError || new Error('All business users endpoints failed');
    } catch (error: any) {
      console.error('Error fetching business users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch business users');
    }
  }

  /**
   * Create a business user
   */
  async createBusinessUser(userData: CreateBusinessUserRequest & { businessId: string }): Promise<{ user: BusinessUser; message: string; emailSent: boolean }> {
    try {
      const role = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      const { businessId, ...userDataWithoutBusinessId } = userData;
      
      if (role === 'system_admin') {
        // System admin can create users for any business
        const response = await axios.post(`${API_BASE_URL}/businesses-admin/${businessId}/users`, userDataWithoutBusinessId, {
          withCredentials: true,
        });
        
        // Handle the correct response format: {message: string, user: BusinessUser, emailSent: boolean}
        const data = response.data as { message: string; user: BusinessUser; emailSent: boolean };
        return {
          user: data.user,
          message: data.message,
          emailSent: data.emailSent
        };
      } else if (role === 'restaurant_admin' && userBusinessId === businessId) {
        // Restaurant admin can create users for their own business
        const response = await axios.post(`${API_BASE_URL}/businesses-admin/${businessId}/users`, userDataWithoutBusinessId, {
          withCredentials: true,
    });
        
        // Handle the correct response format: {message: string, user: BusinessUser, emailSent: boolean}
        const data = response.data as { message: string; user: BusinessUser; emailSent: boolean };
        return {
          user: data.user,
          message: data.message,
          emailSent: data.emailSent
        };
      } else {
        throw new Error('Unauthorized: You can only create users for your own business');
      }
    } catch (error: any) {
      console.error('Error creating business user:', error);
      throw new Error(error.response?.data?.message || 'Failed to create business user');
    }
  }

  /**
   * Update a business user
   */
  async updateBusinessUser(businessId: string, userId: string, userData: Partial<BusinessUser>): Promise<BusinessUser> {
    try {
      const role = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      
      if (role === 'system_admin') {
        // System admin can update users for any business
        const response = await axios.put(`${API_BASE_URL}/businesses-admin/${businessId}/users/${userId}`, userData, {
          withCredentials: true,
        });
        return response.data as BusinessUser;
      } else if (role === 'restaurant_admin' && userBusinessId === businessId) {
        // Restaurant admin can update users for their own business
        const response = await axios.put(`${API_BASE_URL}/businesses-admin/${businessId}/users/${userId}`, userData, {
          withCredentials: true,
    });
        return response.data as BusinessUser;
      } else {
        throw new Error('Unauthorized: You can only update users for your own business');
      }
    } catch (error: any) {
      console.error('Error updating business user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update business user');
    }
  }

  /**
   * Delete a business user
   */
  async deleteBusinessUser(businessId: string, userId: string): Promise<void> {
    try {
      const role = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      
      if (role === 'system_admin') {
        // System admin can delete users for any business
        await axios.delete(`${API_BASE_URL}/businesses-admin/${businessId}/users/${userId}`, {
          withCredentials: true,
        });
      } else if (role === 'restaurant_admin' && userBusinessId === businessId) {
        // Restaurant admin can delete users for their own business
        await axios.delete(`${API_BASE_URL}/businesses-admin/${businessId}/users/${userId}`, {
          withCredentials: true,
        });
      } else {
        throw new Error('Unauthorized: You can only delete users for your own business');
      }
    } catch (error: any) {
      console.error('Error deleting business user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete business user');
    }
  }
}

// Export both named and default export for compatibility
export default BusinessService; 