import { API_BASE_URL } from '../utils/config';
import axios from 'axios';

export interface Table {
  id: string;
  _id?: string; // MongoDB ObjectId
  number: string;
  capacity: number;
  type: 'REGULAR' | 'VIP' | 'COUNTER' | 'LOUNGE';
  isActive: boolean;
  isOccupied: boolean;
  venueId: string;
  qrCode?: string;
}

export interface CreateTableDto {
  number: string;
  capacity: number;
  type: string;
  isActive: boolean;
  venueId: string;
}

export interface UpdateTableDto extends Partial<CreateTableDto> {}

class TableService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
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
        `${this.baseUrl}/restaurant/${restaurantId}/venue/${venueId}/tables`,
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
      return response.data.qrCode;
    } catch (error) {
      console.error('Error fetching table QR code:', error);
      throw error;
    }
  }
}

export const tableService = new TableService();
