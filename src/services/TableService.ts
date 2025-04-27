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
      const response = await axios.get(
        `${this.baseUrl}/restaurants/${restaurantId}/tables`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all tables for restaurant:', error);
      console.log('URL used:', `${this.baseUrl}/restaurants/${restaurantId}/tables`);
      throw error;
    }
  }

  // Method to get all tables from all restaurants
  async getAllTables() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tables`
      );
      return response.data;
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

  // Add a specific method for toggling table status
  async toggleTableStatus(
    restaurantId: string,
    venueId: string,
    tableId: string,
    isActive: boolean
  ) {
    return this.updateTable(restaurantId, venueId, tableId, { isActive });
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
}

export const tableService = new TableService();
