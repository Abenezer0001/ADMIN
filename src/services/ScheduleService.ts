// INSEAT Schedule Service
// Handles all schedule-related operations and API interactions

import axiosInstance from '../utils/axiosConfig';

// Interfaces
export interface DailySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isOpen: boolean;
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
  breaks?: {
    startTime: string;
    endTime: string;
    name: string;
  }[];
}

export interface ScheduleException {
  date: Date;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  reason?: string;
  type: 'HOLIDAY' | 'MAINTENANCE' | 'SPECIAL_EVENT' | 'STAFF_SHORTAGE' | 'OTHER';
}

export interface Schedule {
  _id: string;
  name: string;
  description?: string;
  type: 'RESTAURANT' | 'MENU_ITEM' | 'KITCHEN' | 'VENUE' | 'CATEGORY' | 'BUSINESS';
  restaurant: string;
  venue?: string;
  kitchen?: string;
  menuItems?: string[];
  category?: string;
  business?: string;
  dailySchedules: DailySchedule[];
  exceptions: ScheduleException[];
  timezone: string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  approvalStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  type: 'RESTAURANT' | 'MENU_ITEM' | 'KITCHEN' | 'VENUE' | 'CATEGORY' | 'BUSINESS';
  restaurant: string;
  venue?: string;
  kitchen?: string;
  menuItems?: string[];
  category?: string;
  business?: string;
  dailySchedules: DailySchedule[];
  exceptions?: ScheduleException[];
  timezone: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface UpdateScheduleRequest {
  name?: string;
  description?: string;
  dailySchedules?: DailySchedule[];
  exceptions?: ScheduleException[];
  timezone?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  isActive?: boolean;
}

export interface ScheduleFilters {
  type?: string;
  restaurant?: string;
  venue?: string;
  kitchen?: string;
  category?: string;
  business?: string;
  approvalStatus?: string;
  isActive?: boolean;
  effectiveDate?: Date;
}

export interface ScheduleConflict {
  scheduleId: string;
  scheduleName: string;
  conflictType: 'OVERLAPPING_TIMES' | 'RESOURCE_CONFLICT' | 'STAFF_CONFLICT';
  details: string;
}

export interface ScheduleAvailabilityResponse {
  isAvailable: boolean;
  schedule?: Schedule;
  currentStatus: 'OPEN' | 'CLOSED' | 'ON_BREAK';
  nextStatusChange?: {
    time: Date;
    status: 'OPEN' | 'CLOSED' | 'ON_BREAK';
  };
  todaySchedule?: DailySchedule;
  activeException?: ScheduleException;
}

export interface BulkScheduleOperation {
  scheduleIds: string[];
  operation: 'APPROVE' | 'REJECT' | 'ACTIVATE' | 'DEACTIVATE';
  reason?: string;
}

class ScheduleService {
  // No need for Auth headers as axiosInstance handles this

  // Schedule Management
  async getAllSchedules(filters?: ScheduleFilters): Promise<Schedule[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.restaurant) params.append('restaurant', filters.restaurant);
      if (filters?.venue) params.append('venue', filters.venue);
      if (filters?.kitchen) params.append('kitchen', filters.kitchen);
      if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.effectiveDate) params.append('effectiveDate', filters.effectiveDate.toISOString());

      const queryString = params.toString();
      const url = `/schedules${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching schedules from:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('Schedules fetch response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      const url = `/schedules/${id}`;
      
      const response = await axiosInstance.get(url);
      
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }

  /**
   * Create a new schedule
   */
  async createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
    try {
      console.log('Creating schedule with data:', scheduleData);
      
      // Map frontend field names to backend field names
      const mappedData = {
        ...scheduleData,
        // Map dailySchedules with field name conversion
        dailySchedule: scheduleData.dailySchedules.map(day => ({
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          startTime: day.openTime, // Map openTime to startTime
          endTime: day.closeTime,  // Map closeTime to endTime
          breaks: day.breaks?.map(breakItem => ({
            startTime: breakItem.startTime,
            endTime: breakItem.endTime,
            name: breakItem.name
          })) || []
        })),
        // Remove the original dailySchedules field
        dailySchedules: undefined,
        // Map other fields
        scheduleType: scheduleData.type,
        type: undefined, // Remove frontend type field
        restaurantId: scheduleData.restaurant,
        restaurant: undefined, // Remove frontend restaurant field
        venueId: scheduleData.venue,
        venue: undefined, // Remove frontend venue field
        kitchenId: scheduleData.kitchen,
        kitchen: undefined, // Remove frontend kitchen field
        menuItemId: scheduleData.menuItems?.[0], // Take first menu item if array
        menuItems: undefined, // Remove frontend menuItems field
        startDate: scheduleData.effectiveFrom,
        effectiveFrom: undefined, // Remove frontend effectiveFrom field
        endDate: scheduleData.effectiveTo,
        effectiveTo: undefined, // Remove frontend effectiveTo field
        schedulePattern: 'CUSTOM',
        status: 'ACTIVE'
      };
      
      console.log('Mapped data for backend:', mappedData);
      
      const response = await axiosInstance.post('/schedules', mappedData);
      console.log('Create schedule response:', response.data);
      return response.data as Schedule;
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  /**
   * Update a schedule
   */
  async updateSchedule(id: string, updateData: UpdateScheduleRequest): Promise<Schedule> {
    try {
      console.log('Updating schedule:', id, updateData);
      
      // Map frontend field names to backend field names similar to createSchedule
      const mappedData: any = { ...updateData };
      
      // Map dailySchedules if provided
      if (updateData.dailySchedules) {
        mappedData.dailySchedule = updateData.dailySchedules.map(day => ({
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          startTime: day.openTime, // Map openTime to startTime
          endTime: day.closeTime,  // Map closeTime to endTime
          breaks: day.breaks?.map(breakItem => ({
            startTime: breakItem.startTime,
            endTime: breakItem.endTime,
            name: breakItem.name
          })) || []
        }));
        // Remove the original dailySchedules field
        delete mappedData.dailySchedules;
      }
      
      // Map other fields if provided
      if (updateData.effectiveFrom) {
        mappedData.startDate = updateData.effectiveFrom;
        delete mappedData.effectiveFrom;
      }
      
      if (updateData.effectiveTo) {
        mappedData.endDate = updateData.effectiveTo;
        delete mappedData.effectiveTo;
      }
      
      console.log('Mapped update data for backend:', mappedData);
      
      const response = await axiosInstance.put(`/schedules/${id}`, mappedData);
      console.log('Update schedule response:', response.data);
      return (response.data as any).data || response.data as Schedule;
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      console.log('Deleting schedule:', id);
      
      await axiosInstance.delete(`/schedules/${id}`);
      
      console.log('Schedule successfully deleted');
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete schedule');
    }
  }

  // Schedule Approval Workflow
  async submitScheduleForApproval(id: string): Promise<Schedule> {
    try {
      console.log('Submitting schedule for approval:', id);
      
      const response = await axiosInstance.post(`/schedules/${id}/submit-approval`, {});
      
      console.log('Schedule approval submission response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error submitting schedule for approval:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit schedule for approval');
    }
  }

  async approveSchedule(id: string, comments?: string): Promise<Schedule> {
    try {
      console.log('Approving schedule:', id, { comments });
      
      const response = await axiosInstance.post(`/schedules/${id}/approve`, {
        comments
      });
      
      console.log('Schedule approval response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error approving schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve schedule');
    }
  }

  async rejectSchedule(id: string, reason: string): Promise<Schedule> {
    try {
      console.log('Rejecting schedule:', id, { reason });
      
      const response = await axiosInstance.post(`/schedules/${id}/reject`, {
        reason
      });
      
      console.log('Schedule rejection response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error rejecting schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject schedule');
    }
  }

  // Schedule Activation
  async activateSchedule(id: string): Promise<Schedule> {
    try {
      console.log('Activating schedule:', id);
      
      const response = await axiosInstance.post(`/schedules/${id}/activate`, {});
      
      console.log('Schedule activation response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error activating schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to activate schedule');
    }
  }

  async deactivateSchedule(id: string, reason?: string): Promise<Schedule> {
    try {
      console.log('Deactivating schedule:', id, { reason });
      
      const response = await axiosInstance.post(`/schedules/${id}/deactivate`, {
        reason
      });
      
      console.log('Schedule deactivation response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error deactivating schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to deactivate schedule');
    }
  }

  // Schedule Availability and Status
  async checkScheduleAvailability(type: string, resourceId: string, date?: Date): Promise<ScheduleAvailabilityResponse> {
    try {
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('resourceId', resourceId);
      if (date) params.append('date', date.toISOString());

      const response = await axiosInstance.get('/schedules/availability', { params });
      
      console.log('Schedule availability response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error checking schedule availability:', error);
      throw new Error(error.response?.data?.message || 'Failed to check schedule availability');
    }
  }

  async getActiveSchedule(type: string, resourceId: string, date?: Date): Promise<Schedule | null> {
    try {
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('resourceId', resourceId);
      if (date) params.append('date', date.toISOString());

      console.log('Fetching active schedule');
      
      const response = await axiosInstance.get('/schedules/active', { params });
      
      console.log('Active schedule response:', response.data);
      return response.data.data || null;
    } catch (error: any) {
      console.error('Error fetching active schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active schedule');
    }
  }

  // Exception Management
  async addScheduleException(id: string, exception: ScheduleException): Promise<Schedule> {
    try {
      console.log('Adding schedule exception:', id, exception);
      
      const response = await axiosInstance.post(`/schedules/${id}/exceptions`, exception);
      
      console.log('Schedule exception addition response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error adding schedule exception:', error);
      throw new Error(error.response?.data?.message || 'Failed to add schedule exception');
    }
  }

  async removeScheduleException(id: string, exceptionDate: Date): Promise<Schedule> {
    try {
      console.log('Removing schedule exception:', id, exceptionDate);
      
      const response = await axiosInstance.delete(`/schedules/${id}/exceptions`, {
        data: { date: exceptionDate.toISOString() }
      });
      
      console.log('Schedule exception removal response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error removing schedule exception:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove schedule exception');
    }
  }

  // Conflict Detection
  async detectScheduleConflicts(scheduleData: CreateScheduleRequest): Promise<ScheduleConflict[]> {
    try {
      console.log('Detecting schedule conflicts:', scheduleData);
      
      const response = await axiosInstance.post('/schedules/detect-conflicts', scheduleData);
      
      console.log('Schedule conflict detection response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error detecting schedule conflicts:', error);
      throw new Error(error.response?.data?.message || 'Failed to detect schedule conflicts');
    }
  }

  // Bulk Operations
  async performBulkOperation(operation: BulkScheduleOperation): Promise<Schedule[]> {
    try {
      console.log('Performing bulk schedule operation:', operation);
      
      const response = await axiosInstance.post('/schedules/bulk-operation', operation);
      
      console.log('Bulk schedule operation response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error performing bulk schedule operation:', error);
      throw new Error(error.response?.data?.message || 'Failed to perform bulk schedule operation');
    }
  }

  // Schedule Templates
  async getScheduleTemplates(type?: string): Promise<Schedule[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('template', 'true');

      console.log('Fetching schedule templates');
      
      const response = await axiosInstance.get('/schedules/templates', { params });
      
      console.log('Schedule templates response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching schedule templates:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedule templates');
    }
  }

  async createScheduleFromTemplate(templateId: string, data: CreateScheduleRequest): Promise<Schedule> {
    try {
      console.log('Creating schedule from template:', templateId, data);
      
      const response = await axiosInstance.post(`${API_BASE}/schedules/from-template/${templateId}`, data, {
        headers: this.getAuthHeaders()
      });
      
      console.log('Schedule from template creation response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating schedule from template:', error);
      throw new Error(error.response?.data?.message || 'Failed to create schedule from template');
    }
  }

  // Utility Methods
  async getSchedulesByDateRange(startDate: Date, endDate: Date, filters?: ScheduleFilters): Promise<Schedule[]> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.restaurant) params.append('restaurant', filters.restaurant);
      if (filters?.venue) params.append('venue', filters.venue);
      if (filters?.kitchen) params.append('kitchen', filters.kitchen);

      const url = `${API_BASE}/schedules/date-range?${params.toString()}`;
      
      console.log('Fetching schedules by date range:', url);
      
      const response = await axiosInstance.get(url, {
        headers: this.getAuthHeaders()
      });
      
      console.log('Schedules by date range response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error fetching schedules by date range:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedules by date range');
    }
  }

  async validateScheduleData(scheduleData: CreateScheduleRequest): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      console.log('Validating schedule data:', scheduleData);
      
      const response = await axiosInstance.post(`${API_BASE}/schedules/validate`, scheduleData, {
        headers: this.getAuthHeaders()
      });
      
      console.log('Schedule validation response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error validating schedule data:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate schedule data');
    }
  }
}

export const scheduleService = new ScheduleService(); 