// INSEAT Cashier Service
// Handles all cashier-related operations and API interactions

import axios from 'axios';

import axiosInstance from '../utils/axiosConfig';

// Interfaces
export interface WorkingHours {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface CashierUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashierShift {
  _id: string;
  cashier: string | CashierUser;
  venue: string;
  shiftStart: Date;
  shiftEnd?: Date;
  openingBalance: number;
  closingBalance?: number;
  totalSales?: number;
  transactionCount?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashierPerformanceMetrics {
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  shiftsCompleted: number;
  averageShiftDuration: number;
  customerRating: number;
  lastUpdated: Date;
}

export interface CashierAssignment {
  cashier: string | CashierUser;
  venue: string;
  workingHours: WorkingHours;
  isActive: boolean;
  assignedAt: Date;
}

export interface CreateCashierRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  venueAssignments?: {
    venue: string;
    workingHours: WorkingHours;
  }[];
}

export interface UpdateCashierRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface CashierFilters {
  venue?: string;
  isActive?: boolean;
  search?: string;
}

export interface ShiftFilters {
  cashier?: string;
  venue?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CashierStats {
  totalCashiers: number;
  activeCashiers: number;
  activeShifts: number;
  totalSalesToday: number;
  transactionsToday: number;
}

class CashierService {
  // Auth headers are handled by axiosInstance

  // Cashier Management
  async getAllCashiers(filters?: CashierFilters): Promise<CashierUser[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.venue) params.append('venue', filters.venue);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/cashiers${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching cashiers from:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('Cashiers fetch response:', response.data);
      
      // Handle the backend response format: {success: true, cashiers: [], total: 0}
      const responseData = response.data as any;
      
      if (responseData?.cashiers && Array.isArray(responseData.cashiers)) {
        return responseData.cashiers;
      } else if (responseData?.data?.cashiers && Array.isArray(responseData.data.cashiers)) {
        return responseData.data.cashiers;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData.data;
      } else if (Array.isArray(responseData)) {
        return responseData;
      } else {
        console.warn('Unexpected cashiers response format:', responseData);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching cashiers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cashiers');
    }
  }

  async getCashierById(id: string): Promise<CashierUser> {
    try {
      console.log('Fetching cashier by ID:', id);
      
      const response = await axiosInstance.get(`/cashiers/${id}`);
      
      console.log('Cashier fetch response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching cashier:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cashier');
    }
  }

  async createCashier(cashierData: CreateCashierRequest): Promise<CashierUser> {
    try {
      console.log('Creating cashier:', cashierData);
      
      const response = await axiosInstance.post(`/cashiers`, cashierData);
      
      console.log('Cashier creation response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating cashier:', error);
      throw new Error(error.response?.data?.message || 'Failed to create cashier');
    }
  }

  async updateCashier(id: string, updateData: UpdateCashierRequest): Promise<CashierUser> {
    try {
      console.log('Updating cashier:', id, updateData);
      
      const response = await axiosInstance.put(`/cashiers/${id}`, updateData);
      
      console.log('Cashier update response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating cashier:', error);
      throw new Error(error.response?.data?.message || 'Failed to update cashier');
    }
  }

  async deleteCashier(id: string): Promise<void> {
    try {
      console.log('Deleting cashier:', id);
      
      await axiosInstance.delete(`/cashiers/${id}`);
      
      console.log('Cashier deleted successfully');
    } catch (error: any) {
      console.error('Error deleting cashier:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete cashier');
    }
  }

  // Venue Assignment Management
  async assignCashierToVenue(cashierId: string, venueId: string, workingHours: WorkingHours): Promise<void> {
    try {
      console.log('Assigning cashier to venue:', { cashierId, venueId, workingHours });
      
      await axiosInstance.post(`/cashiers/${cashierId}/assign-venue`, {
        venueId,
        workingHours
      });
      
      console.log('Cashier assigned to venue successfully');
    } catch (error: any) {
      console.error('Error assigning cashier to venue:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign cashier to venue');
    }
  }

  async removeCashierFromVenue(cashierId: string, venueId: string): Promise<void> {
    try {
      console.log('Removing cashier from venue:', { cashierId, venueId });
      
      await axiosInstance.delete(`/cashiers/${cashierId}/remove-venue/${venueId}`);
      
      console.log('Cashier removed from venue successfully');
    } catch (error: any) {
      console.error('Error removing cashier from venue:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove cashier from venue');
    }
  }

  async getCashierAssignments(cashierId: string): Promise<CashierAssignment[]> {
    try {
      console.log('Fetching cashier assignments:', cashierId);
      
      const response = await axiosInstance.get(`/cashiers/${cashierId}/assignments`);
      
      console.log('Cashier assignments response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching cashier assignments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cashier assignments');
    }
  }

  // Shift Management
  async startShift(cashierId: string, venueId: string, openingBalance: number): Promise<CashierShift> {
    try {
      console.log('Starting shift:', { cashierId, venueId, openingBalance });
      
      const response = await axiosInstance.post(`/cashiers/shifts/start`, {
        cashierId,
        venueId,
        openingBalance
      });
      
      console.log('Shift started successfully:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error starting shift:', error);
      throw new Error(error.response?.data?.message || 'Failed to start shift');
    }
  }

  async endShift(shiftId: string, closingBalance: number, notes?: string): Promise<CashierShift> {
    try {
      console.log('Ending shift:', { shiftId, closingBalance, notes });
      
      const response = await axiosInstance.post(`/cashiers/shifts/${shiftId}/end`, {
        closingBalance,
        notes
      });
      
      console.log('Shift ended successfully:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error ending shift:', error);
      throw new Error(error.response?.data?.message || 'Failed to end shift');
    }
  }

  async getShifts(filters?: ShiftFilters): Promise<CashierShift[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.cashier) params.append('cashier', filters.cashier);
      if (filters?.venue) params.append('venue', filters.venue);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());

      const queryString = params.toString();
      const url = `/cashiers/shifts${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching shifts from:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('Shifts fetch response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching shifts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch shifts');
    }
  }

  async getActiveShifts(venueId?: string): Promise<CashierShift[]> {
    try {
      const params = new URLSearchParams();
      params.append('status', 'ACTIVE');
      if (venueId) params.append('venue', venueId);

      const queryString = params.toString();
      const url = `/cashiers/shifts?${queryString}`;
      
      console.log('Fetching active shifts from:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('Active shifts fetch response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching active shifts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active shifts');
    }
  }

  // Performance and Statistics
  async getCashierPerformance(cashierId: string, startDate?: Date, endDate?: Date): Promise<CashierPerformanceMetrics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const queryString = params.toString();
      const url = `/cashiers/${cashierId}/performance${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching cashier performance from:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('Cashier performance response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching cashier performance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cashier performance');
    }
  }

  async getCashierStats(venueId?: string): Promise<CashierStats> {
    try {
      const params = new URLSearchParams();
      if (venueId) params.append('venue', venueId);

      const queryString = params.toString();
      const url = `/cashiers/stats${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching cashier stats from:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('Cashier stats response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching cashier stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cashier stats');
    }
  }

  // Utility Methods
  async getCashierAvailability(cashierId: string, venueId: string, date: Date): Promise<boolean> {
    try {
      console.log('Checking cashier availability:', { cashierId, venueId, date });
      
      const response = await axiosInstance.get(`/cashiers/${cashierId}/availability`, {
        params: { venueId, date: date.toISOString() }
      });
      
      console.log('Cashier availability response:', response.data);
      return response.data.data?.available || false;
    } catch (error: any) {
      console.error('Error checking cashier availability:', error);
      throw new Error(error.response?.data?.message || 'Failed to check cashier availability');
    }
  }
}

export const cashierService = new CashierService(); 