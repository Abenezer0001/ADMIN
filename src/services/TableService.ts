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
  tableTypeId: string; // Required tableTypeId
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

  async getTables(restaurantId: string, venueId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables`
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
      // Try to fetch tables from the restaurant endpoint
      try {
        const response = await axios.get(
          `${this.baseUrl}/restaurant/${restaurantId}/tables`
        );
        return response.data;
      } catch (e) {
        console.log('Primary endpoint failed, trying to get tables by venue...');
        // If that fails, try to get the restaurant's venues and then get tables for each venue
        const restaurantResponse = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}`);
        const restaurant = restaurantResponse.data;
        
        if (restaurant && restaurant.venues && restaurant.venues.length > 0) {
          // Get tables for each venue and combine them
          let allTables = [];
          for (const venueId of restaurant.venues) {
            try {
              const venueTablesResponse = await axios.get(
                `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables`
              );
              allTables = [...allTables, ...venueTablesResponse.data];
            } catch (venueError) {
              console.log(`Could not get tables for venue ${venueId}:`, venueError);
            }
          }
          return allTables;
        }
        // If we couldn't get tables by venue either, return empty array
        return [];
      }
    } catch (error) {
      console.error('Error fetching all tables for restaurant:', error);
      console.log('URL used for initial request:', `${this.baseUrl}/restaurant/${restaurantId}/tables`);
      return []; // Return empty array instead of throwing error
    }
  }

  // Method to get all tables from all restaurants
  async getAllTables() {
    try {
      // Try multiple approaches to get all tables
      try {
        // First try standard tables endpoint
        const response = await axios.get(`${this.baseUrl}/tables`);
        return response.data;
      } catch (e) {
        try {
          // Then try the tables/all endpoint
          console.log('Trying /tables/all endpoint');
          const response = await axios.get(`${this.baseUrl}/tables/all`);
          return response.data;
        } catch (e2) {
          // If both fail, try to get all restaurants and then get tables for each
          console.log('Trying to get tables through restaurants');
          const restaurantsResponse = await axios.get(`${this.baseUrl}/restaurants`);
          const restaurants = restaurantsResponse.data;
          
          let allTables = [];
          for (const restaurant of restaurants) {
            try {
              const tablesResponse = await this.getAllTablesForRestaurant(restaurant._id);
              allTables = [...allTables, ...tablesResponse];
            } catch (restaurantError) {
              console.log(`Could not get tables for restaurant ${restaurant.name}:`, restaurantError);
            }
          }
          return allTables;
        }
      }
    } catch (error) {
      console.error('Error fetching all tables:', error);
      throw error;
    }
  }

  async getTable(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}`
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
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}`,
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
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}`,
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
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting table:', error);
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
  async directUpdateTableStatus(tableId: string, isActive: boolean) {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/tables/${tableId}/status`,
        { isActive }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  }

  async getTableQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}/qrcode`
      );
      return (response.data as { qrCode: string }).qrCode;
    } catch (error) {
      console.error('Error fetching table QR code:', error);
      throw error;
    }
  }

  // Table types methods
  async getTableTypes(restaurantId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/table-types/${restaurantId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching table types:', error);
      throw error;
    }
  }

  async getTableType(restaurantId: string, tableTypeId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/table-types/${restaurantId}/${tableTypeId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching table type:', error);
      throw error;
    }
  }

  async createTableType(restaurantId: string, tableTypeData: { name: string, description?: string }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/table-types/${restaurantId}`,
        tableTypeData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating table type:', error);
      throw error;
    }
  }

  async updateTableType(
    restaurantId: string, 
    tableTypeId: string, 
    tableTypeData: { name?: string, description?: string }
  ) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/table-types/${restaurantId}/${tableTypeId}`,
        tableTypeData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating table type:', error);
      throw error;
    }
  }

  async deleteTableType(restaurantId: string, tableTypeId: string) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/table-types/${restaurantId}/${tableTypeId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting table type:', error);
      throw error;
    }
  }

  // QR code methods
  async generateQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}/qrcode`
      );
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  async getQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}/qrcode`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting QR code:', error);
      throw error;
    }
  }

  async deleteQRCode(restaurantId: string, venueId: string, tableId: string) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}/qrcode`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }

  // Generate frontend URL for QR code
  generateMenuUrl(tableId: string) {
    // Customer frontend URL (should be configurable in a real app)
    const customerUrl = 'http://localhost:8080';
    return `${customerUrl}?table=${tableId}`;
  }
}

export const tableService = new TableService();
