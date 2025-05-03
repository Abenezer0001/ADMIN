import { API_BASE_URL } from '../utils/config';
import axios from 'axios';

export interface Table {
  id: string;
  _id?: string; // MongoDB ObjectId
  number: string;
  capacity: number;
  isActive: boolean;
  isOccupied: boolean;
  venueId: string;
  qrCode?: string;
  tableTypeId: string | TableType; // Can be either a string ID or a TableType object
  restaurantId?: string; // Added for direct access
}

export interface TableType {
  _id: string;
  name: string;
  description?: string;
  restaurantId: string;
}

export interface CreateTableDto {
  number: string;
  capacity: number;
  isActive: boolean;
  venueId: string;
  tableTypeId: string; // Required tableTypeId
}

export interface UpdateTableDto extends Partial<CreateTableDto> {}

class TableService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}`;
  }

  // Get tables for a specific venue in a specific restaurant
  async getTables(restaurantId: string, venueId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  // Method to get all tables from all venues of a restaurant
  async getAllTablesForRestaurant(restaurantId: string) {
    try {
      console.log(`Fetching tables for restaurant: ${restaurantId}`);
      // Use the more reliable endpoint for getting all tables from a restaurant
      const response = await axios.get(
        `${this.baseUrl}/restaurants/${restaurantId}/tables/all`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all tables for restaurant:', error);
      return []; // Return empty array instead of throwing error
    }
  }
  // Method to get all tables from all restaurants
  async getAllTables() {
    try {
      // Use the filtered endpoint with no parameters to get all tables
      const response = await axios.get(`${this.baseUrl}/tables/filtered`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all tables:', error);
      throw error;
    }
  }

  async getTable(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching table:', error);
      throw error;
    }
  }

  async createTable(restaurantId: string, venueId: string, tableData: CreateTableDto) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables`,
        tableData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  }

  async updateTable(
    restaurantId: string,
    venueId: string,
    tableId: string,
    tableData: UpdateTableDto
  ) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}`,
        tableData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  }

  async deleteTable(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting table using restaurant/venue context:', error);
      throw error;
    }
  }
  
  // Direct method to delete a table without requiring restaurant/venue context
  async deleteTableDirect(tableId: string) {
    try {
      console.log(`Deleting table ${tableId} directly without restaurant/venue context`);
      const response = await axios.delete(`${this.baseUrl}/restaurant-service/tables/${tableId}`);
      return response.data;
    } catch (error) {
      console.error('Error directly deleting table:', error);
      throw error;
    }
  }

  // Add a specific method for toggling table status
  async toggleTableStatus(
    restaurantId: string,
    venueId: string,
    tableId: string,
    isActive: boolean
  ) {
    return this.updateTable(restaurantId, venueId, tableId, { isActive });
  }

  // Dedicated method to update the table status directly
  async updateTableStatus(tableId: string, isActive: boolean) {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/tables/${tableId}/status`,
        { isActive }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating table status:', error);
      throw error;
    }
  }
  
  // Get tables with optional filtering by restaurant and/or venue
  async getFilteredTables(restaurantId?: string, venueId?: string) {
    try {
      console.log(`Filtering tables: restaurantId=${restaurantId}, venueId=${venueId}`);
      
      // Case 1: Both restaurant and venue specified (not 'all')
      if (restaurantId && restaurantId !== 'all' && venueId && venueId !== 'all') {
        console.log(`Using restaurant/venue specific endpoint: ${restaurantId}/${venueId}`);
        // Use the specific restaurant/venue endpoint
        const response = await axios.get(
          `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables`
        );
        return response.data;
      } 
      // Case 2: Only restaurant specified (not 'all')
      else if (restaurantId && restaurantId !== 'all') {
        console.log(`Using restaurant-only endpoint: ${restaurantId}`);
        // Use the restaurant-specific endpoint
        const response = await axios.get(
          `${this.baseUrl}/restaurants/${restaurantId}/tables`
        );
        return response.data;
      }
      // Case 3: Only venue specified (not 'all')
      else if (venueId && venueId !== 'all') {
        console.log(`Using venue-only endpoint: ${venueId}`);
        // Use the venue-specific endpoint
        const response = await axios.get(
          `${this.baseUrl}/venues/${venueId}/tables`
        );
        return response.data;
      }
      // Case 4: Neither specified or both are 'all' - get all tables
      else {
        console.log('Using filtered endpoint with no params (all tables)');
        // Use the main filtered endpoint with no parameters
        const response = await axios.get(`${this.baseUrl}/tables/filtered`);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching filtered tables:', error);
      return []; // Return empty array instead of throwing error
    }
  }

  async getTableQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurant-service/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}/qrcode`
      );
      return (response.data as { qrCode: string }).qrCode;
    } catch (error) {
      console.error('Error fetching table QR code:', error);
      return null;
    }
  }

  // Table types methods
  async getTableTypes(restaurantId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurants/${restaurantId}/table-types`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching table types:', error);
      throw error;
    }
  }

  
  // Update a table type
  async updateTableType(
    restaurantId: string, 
    tableTypeId: string, 
    tableTypeData: { name?: string, description?: string }
  ) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/restaurants/${restaurantId}/table-types/${tableTypeId}`,
        tableTypeData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating table type:', error);
      throw error;
    }
  }

  // Get customer-facing URL for a table
  getCustomerTableUrl(tableId: string) {
    const customerUrl = import.meta.env.VITE_CUSTOMER_URL || import.meta.env.VITE_API_BASE_URL;
    return `${customerUrl}?table=${tableId}`;
  }

  // Generate QR code for a table
  async generateQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}/qrcode`
      );
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Get QR code for a table
  async getQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}/qrcode`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting QR code:', error);
      throw error;
    }
  }

  // Delete QR code for a table
  async deleteQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}/qrcode`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }

  // Get table directly by ID - helpful when restaurant/venue context isn't available
  async getTableById(tableId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/restaurant-service/tables/${tableId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching table by ID:', error);
      throw error;
    }
  }
}

export const tableService = new TableService();
