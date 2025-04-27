import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface Venue {
  _id: string;
  name: string;
  description?: string;
  capacity: number;
  isActive: boolean;
  restaurantId: string; // Added restaurantId
}

class VenueService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}`;
  }

  /**
   * Get all venues for a specific restaurant
   * @param restaurantId - The ID of the restaurant
   * @returns Promise with the venues data
   */
  async getVenues(restaurantId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/venues/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  }

  /**
   * Get a specific venue by ID
   * @param venueId - The ID of the venue
   * @returns Promise with the venue data
   */
  async getVenue(venueId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/venues/${venueId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching venue:', error);
      throw error;
    }
  }

  /**
   * Create a new venue
   * @param restaurantId - The ID of the restaurant
   * @param venueData - The venue data to create
   * @returns Promise with the created venue
   */
  async createVenue(restaurantId: string, venueData: Omit<Venue, '_id'>) {
    try {
      const response = await axios.post(`${this.baseUrl}/venues/restaurant/${restaurantId}`, venueData);
      return response.data;
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    }
  }

  /**
   * Update an existing venue
   * @param venueId - The ID of the venue to update
   * @param venueData - The updated venue data
   * @returns Promise with the updated venue
   */
  async updateVenue(venueId: string, venueData: Partial<Omit<Venue, '_id'>>) {
    try {
      const response = await axios.put(`${this.baseUrl}/venues/${venueId}`, venueData);
      return response.data;
    } catch (error) {
      console.error('Error updating venue:', error);
      throw error;
    }
  }

  /**
   * Delete a venue
   * @param venueId - The ID of the venue to delete
   * @returns Promise with the deletion result
   */
  async deleteVenue(venueId: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/venues/${venueId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting venue:', error);
      throw error;
    }
  }

  /**
   * Get all venues
   * @returns Promise with all venues data
   */
  async getAllVenues() {
    try {
      const response = await axios.get(`${this.baseUrl}/venues`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all venues:', error);
      throw error;
    }
  }
}

export const venueService = new VenueService();