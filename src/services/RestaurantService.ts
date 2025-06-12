import axiosInstance from '../utils/axiosConfig';

interface Location {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface Restaurant {
  _id?: string;
  name: string;
  locations: Location[];
  isActive?: boolean;
}

export class RestaurantService {
  /**
   * Get all restaurants
   */
  static async getAllRestaurants(): Promise<Restaurant[]> {
    try {
      console.log('Fetching all restaurants...');
      const response = await axiosInstance.get('/restaurants');
      console.log('All restaurants response:', response.data);
      return response.data as Restaurant[];
    } catch (error: any) {
      console.error('Error fetching all restaurants:', error);
      throw error;
    }
  }

  /**
   * Get all restaurants (alias for backwards compatibility)
   */
  static async getRestaurants(): Promise<Restaurant[]> {
    return this.getAllRestaurants();
  }

  /**
   * Get restaurant by ID
   */
  static async getRestaurantById(id: string): Promise<Restaurant> {
    try {
      console.log('Fetching restaurant by ID:', id);
      const response = await axiosInstance.get(`/restaurants/${id}`);
      console.log('Restaurant by ID response:', response.data);
      return response.data as Restaurant;
    } catch (error: any) {
      console.error('Error fetching restaurant by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new restaurant
   */
  static async createRestaurant(restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    try {
      console.log('Creating restaurant:', restaurantData);
      const response = await axiosInstance.post('/restaurants', restaurantData);
      console.log('Create restaurant response:', response.data);
      return response.data as Restaurant;
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }

  /**
   * Update restaurant
   */
  static async updateRestaurant(id: string, updateData: Partial<Restaurant>): Promise<Restaurant> {
    try {
      console.log('Updating restaurant:', id, updateData);
      const response = await axiosInstance.put(`/restaurants/${id}`, updateData);
      console.log('Update restaurant response:', response.data);
      return response.data as Restaurant;
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  }

  /**
   * Delete restaurant
   */
  static async deleteRestaurant(id: string): Promise<{ message: string }> {
    try {
      console.log('Deleting restaurant:', id);
      const response = await axiosInstance.delete(`/restaurants/${id}`);
      console.log('Delete restaurant response:', response.data);
      return response.data as { message: string };
    } catch (error: any) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  }
}

// Export both default and named for backwards compatibility
export default RestaurantService;
export const restaurantService = RestaurantService;
