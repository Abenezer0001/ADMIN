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

  // Update table occupied status (for availability toggle)
  async updateTableOccupiedStatus(tableId: string, isOccupied: boolean) {
    try {
      console.log(`Updating table ${tableId} occupied status to ${isOccupied}`);
      const response = await axios.patch(
        `${this.baseUrl}/tables/${tableId}/occupied`,
        { isOccupied },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating table occupied status:', error);
      throw error;
    }
  }

  // Toggle table availability (occupied/available)
  async toggleTableAvailability(tableId: string, currentStatus: boolean) {
    return this.updateTableOccupiedStatus(tableId, !currentStatus);
  }

  async updateTableStatus(tableId: string, isActive: boolean) {
    try {
      console.log(`Updating table ${tableId} status to ${isActive}`);
      const response = await axios.patch(
        `${this.baseUrl}/tables/${tableId}/status`,
        { isActive },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
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
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}/qrcode`,
        { withCredentials: true }
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

  // Get customer-facing URL for a tables
  getCustomerTableUrl(tableId: string) {
    // Always use the production URL regardless of environment
    const customerUrl = "https://menu.inseat.achievengine.com";

    // Ensure the URL doesn't have a trailing slash before adding the query parameter
    const formattedUrl = customerUrl.endsWith('/') ? customerUrl.slice(0, -1) : customerUrl;
    return `${formattedUrl}?table=${tableId}`;
  }

  // Generate QR code for a table
  async generateQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}/qrcode`,
        {},
        { withCredentials: true }
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
        `${this.baseUrl}/restaurants/${restaurantId}/venues/${venueId}/tables/${tableId}/qrcode`,
        { withCredentials: true }
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
      // Use the correct endpoint from table routes: /tables/:tableId
      const response = await axios.get(`${this.baseUrl}/tables/${tableId}`, {
        withCredentials: true
      });
      const table = response.data as Table;
      
      if (!table) {
        throw new Error('Table not found');
      }
      
      return table;
    } catch (error) {
      // If direct access fails, try getting all tables as fallback
      try {
        console.warn('Direct access failed, trying filtered tables...', error);
        const allTablesResponse = await axios.get(`${this.baseUrl}/tables/filtered`, {
          withCredentials: true
        });
        const allTables = allTablesResponse.data as Table[];
        
        const table = allTables.find((t: Table) => t._id === tableId || t.id === tableId);
        if (!table) {
          throw new Error('Table not found');
        }
        
        return table;
      } catch (fallbackError) {
        console.error('All attempts to fetch table failed:', fallbackError);
        throw fallbackError;
      }
    }
  }
}

export const tableService = new TableService();
