import { API_BASE_URL } from '../utils/config';
import axios from 'axios';

export interface Restaurant {
  _id: string;
  name: string;
  locations: Array<{
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
  venues: string[];
  adminIds: string[];
  createdAt: string;
  updatedAt: string;
}

class RestaurantService {
  private baseUrl = `${API_BASE_URL}/restaurants`;

  async getRestaurants() {
    try {
      const response = await axios.get(`${this.baseUrl}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  async getRestaurant(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  }
}

export const restaurantService = new RestaurantService();