import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  contactInfo?: string;
  isActive: boolean;
  locations?: Array<{
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
  venues?: string[];
  adminIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

class RestaurantService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get all restaurants
   * @returns Promise with the restaurants data
   */
  async getRestaurants() {
    try {
      const response = await axios.get(`${this.baseUrl}/restaurants`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  /**
   * Get a specific restaurant by ID
   * @param restaurantId - The ID of the restaurant
   * @returns Promise with the restaurant data
   */
  async getRestaurant(restaurantId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  }

  /**
   * Create a new restaurant
   * @param restaurantData - The restaurant data to create
   * @returns Promise with the created restaurant
   */
  async createRestaurant(restaurantData: Omit<Restaurant, '_id'>) {
    try {
      const response = await axios.post(`${this.baseUrl}/restaurants`, restaurantData);
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }

  /**
   * Update an existing restaurant
   * @param restaurantId - The ID of the restaurant to update
   * @param restaurantData - The updated restaurant data
   * @returns Promise with the updated restaurant
   */
  async updateRestaurant(restaurantId: string, restaurantData: Partial<Omit<Restaurant, '_id'>>) {
    try {
      const response = await axios.put(`${this.baseUrl}/restaurants/${restaurantId}`, restaurantData);
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  }

  /**
   * Delete a restaurant
   * @param restaurantId - The ID of the restaurant to delete
   * @returns Promise with the deletion result
   */
  async deleteRestaurant(restaurantId: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  }
}

export const restaurantService = new RestaurantService();
