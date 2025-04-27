import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface Zone {
  _id: string;
  name: string;
  description?: string;
  venueId: string;
  capacity: number;
  isActive: boolean;
  tables: string[];
}

class ZoneService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}`;
  }

  /**
   * Get all zones for a specific venue
   * @param venueId - The ID of the venue
   * @returns Promise with the zones data
   */
  async getZones(venueId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/zones/venue/${venueId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  }

  /**
   * Get a specific zone by ID
   * @param zoneId - The ID of the zone
   * @returns Promise with the zone data
   */
  async getZone(zoneId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/zones/${zoneId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching zone:', error);
      throw error;
    }
  }

  /**
   * Create a new zone
   * @param zoneData - The zone data to create
   * @returns Promise with the created zone
   */
  async createZone(zoneData: Omit<Zone, '_id'>) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/zones`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  /**
   * Update an existing zone
   * @param zoneId - The ID of the zone to update
   * @param zoneData - The updated zone data
   * @returns Promise with the updated zone
   */
  async updateZone(zoneId: string, zoneData: Partial<Omit<Zone, '_id'>>) {
    try {
      const response = await axios.put(`${this.baseUrl}/api/zones/${zoneId}`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  }

  /**
   * Delete a zone
   * @param zoneId - The ID of the zone to delete
   * @returns Promise with the deletion result
   */
  async deleteZone(zoneId: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/zones/${zoneId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }
}

export const zoneService = new ZoneService();
