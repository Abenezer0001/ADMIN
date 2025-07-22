import axiosInstance from '../utils/axiosConfig';

interface KitchenStaff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Equipment {
  name: string;
  type: 'GRILL' | 'FRYER' | 'OVEN' | 'PRINTER' | 'DISPLAY' | 'OTHER';
  isWorking: boolean;
  lastMaintenanceDate?: Date;
}

interface Printer {
  name: string;
  ipAddress?: string;
  type: 'RECEIPT' | 'KITCHEN' | 'BAR';
  isConnected: boolean;
}

interface WorkingHours {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface PerformanceMetrics {
  totalOrdersProcessed: number;
  averageProcessingTime: number;
  onTimeDeliveryRate: number;
  lastUpdated: Date;
}

interface Kitchen {
  _id?: string;
  name: string;
  description?: string;
  restaurant: string;
  venue: string;
  type: 'MAIN' | 'PREP' | 'DESSERT' | 'BAR' | 'COLD' | 'HOT';
  staff: KitchenStaff[];
  equipment: Equipment[];
  printers: Printer[];
  workingHours: WorkingHours[];
  isActive: boolean;
  accessPin?: string;
  capacity: number;
  currentLoad: number;
  performanceMetrics?: PerformanceMetrics;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateKitchenStaffData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface KitchenStaffAssignment {
  staffId: string;
  role: 'HEAD_CHEF' | 'CHEF' | 'PREP_COOK' | 'LINE_COOK';
  shifts: string[];
}

export class KitchenService {
  /**
   * Get all kitchens
   */
  static async getAllKitchens(filters?: {restaurant?: string, venue?: string, status?: string}): Promise<Kitchen[]> {
    try {
      console.log('Fetching all kitchens with filters:', filters);
      let url = '/kitchens';
      const params = new URLSearchParams();
      
      // Use correct backend parameter names
      if (filters?.restaurant) params.append('restaurantId', filters.restaurant);
      if (filters?.venue) params.append('venueId', filters.venue);
      if (filters?.status) params.append('status', filters.status);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Requesting URL:', url);
      const response = await axiosInstance.get(url);
      console.log('All kitchens response:', response.data);
      
      // Handle different response formats
      const data = response.data as any;
      if (data.success && data.kitchens) {
        return data.kitchens;
      } else if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching all kitchens:', error);
      throw error;
    }
  }

  /**
   * Get kitchen by ID
   */
  static async getKitchenById(id: string): Promise<Kitchen> {
    try {
      console.log('Fetching kitchen by ID:', id);
      const response = await axiosInstance.get(`/kitchens/${id}`);
      console.log('Kitchen by ID response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error fetching kitchen by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new kitchen
   */
  static async createKitchen(kitchenData: Partial<Kitchen>, staffData?: CreateKitchenStaffData): Promise<Kitchen> {
    try {
      console.log('Creating kitchen:', kitchenData);
      
      const requestData = {
        ...kitchenData,
        // Backend expects staffEmails array, so wrap the single staffData in an array
        ...(staffData && { staffEmails: [staffData] })
      };
      
      const response = await axiosInstance.post('/kitchens', requestData);
      console.log('Create kitchen response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error creating kitchen:', error);
      throw error;
    }
  }

  /**
   * Update kitchen
   */
  static async updateKitchen(id: string, updateData: Partial<Kitchen>): Promise<Kitchen> {
    try {
      console.log('Updating kitchen:', id, updateData);
      const response = await axiosInstance.put(`/kitchens/${id}`, updateData);
      console.log('Update kitchen response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error updating kitchen:', error);
      throw error;
    }
  }

  /**
   * Delete kitchen
   */
  static async deleteKitchen(id: string): Promise<{ message: string }> {
    try {
      console.log('Deleting kitchen:', id);
      const response = await axiosInstance.delete(`/kitchens/${id}`);
      console.log('Delete kitchen response:', response.data);
      return response.data as { message: string };
    } catch (error: any) {
      console.error('Error deleting kitchen:', error);
      throw error;
    }
  }

  /**
   * Add staff to kitchen
   */
  static async addStaffToKitchen(kitchenId: string, staffAssignment: KitchenStaffAssignment): Promise<Kitchen> {
    try {
      console.log('Adding staff to kitchen:', kitchenId, staffAssignment);
      // Backend expects staffEmails array, so wrap the single assignment in an array
      const requestData = {
        staffEmails: [staffAssignment]
      };
      const response = await axiosInstance.post(`/kitchens/${kitchenId}/staff`, requestData);
      console.log('Add staff to kitchen response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error adding staff to kitchen:', error);
      throw error;
    }
  }

  /**
   * Remove staff from kitchen
   */
  static async removeStaffFromKitchen(kitchenId: string, staffId: string): Promise<Kitchen> {
    try {
      console.log('Removing staff from kitchen:', kitchenId, staffId);
      const response = await axiosInstance.delete(`/kitchens/${kitchenId}/staff/${staffId}`);
      console.log('Remove staff from kitchen response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error removing staff from kitchen:', error);
      throw error;
    }
  }

  /**
   * Update kitchen status
   */
  static async updateKitchenStatus(id: string, status: string): Promise<Kitchen> {
    try {
      console.log('Updating kitchen status:', id, status);
      const response = await axiosInstance.patch(`/kitchens/${id}/status`, { status });
      console.log('Update kitchen status response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error updating kitchen status:', error);
      throw error;
    }
  }

  /**
   * Update kitchen load
   */
  static async updateKitchenLoad(id: string, currentLoad: number): Promise<Kitchen> {
    try {
      console.log('Updating kitchen load:', id, currentLoad);
      const response = await axiosInstance.patch(`/kitchens/${id}/load`, { currentLoad });
      console.log('Update kitchen load response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error updating kitchen load:', error);
      throw error;
    }
  }

  /**
   * Get kitchen performance metrics
   */
  static async getKitchenPerformance(id: string, startDate?: string, endDate?: string): Promise<PerformanceMetrics> {
    try {
      console.log('Fetching kitchen performance:', id);
      let url = `/kitchens/${id}/performance`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axiosInstance.get(url);
      console.log('Kitchen performance response:', response.data);
      return response.data as PerformanceMetrics;
    } catch (error: any) {
      console.error('Error fetching kitchen performance:', error);
      throw error;
    }
  }

  /**
   * Update equipment status
   */
  static async updateEquipmentStatus(kitchenId: string, equipmentName: string, isWorking: boolean): Promise<Kitchen> {
    try {
      console.log('Updating equipment status:', kitchenId, equipmentName, isWorking);
      const response = await axiosInstance.patch(`/kitchens/${kitchenId}/equipment/${equipmentName}`, { isWorking });
      console.log('Update equipment status response:', response.data);
      return response.data as Kitchen;
    } catch (error: any) {
      console.error('Error updating equipment status:', error);
      throw error;
    }
  }

  /**
   * Test printer connection
   */
  static async testPrinterConnection(kitchenId: string, printerName: string): Promise<{ isConnected: boolean }> {
    try {
      console.log('Testing printer connection:', kitchenId, printerName);
      const response = await axiosInstance.post(`/kitchens/${kitchenId}/printers/${printerName}/test`);
      console.log('Test printer connection response:', response.data);
      return response.data as { isConnected: boolean };
    } catch (error: any) {
      console.error('Error testing printer connection:', error);
      throw error;
    }
  }

  /**
   * Get kitchen availability
   */
  static async getKitchenAvailability(id: string, date?: string): Promise<{ isAvailable: boolean; workingHours?: WorkingHours }> {
    try {
      console.log('Checking kitchen availability:', id, date);
      let url = `/kitchens/${id}/availability`;
      
      if (date) {
        url += `?date=${date}`;
      }
      
      const response = await axiosInstance.get(url);
      console.log('Kitchen availability response:', response.data);
      return response.data as { isAvailable: boolean; workingHours?: WorkingHours };
    } catch (error: any) {
      console.error('Error checking kitchen availability:', error);
      throw error;
    }
  }
}

// Export both default and named for backwards compatibility
export default KitchenService;
export const kitchenService = KitchenService; 