import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

class MenuItemService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get all menu items for a specific restaurant
   * @param restaurantId - The ID of the restaurant
   * @returns Promise with the menu items data
   */
  async getMenuItems(restaurantId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/menu-items/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  /**
   * Get a specific menu item by ID
   * @param menuItemId - The ID of the menu item
   * @returns Promise with the menu item data
   */
  async getMenuItem(menuItemId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/menu-items/${menuItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  }

  /**
   * Create a new menu item
   * @param restaurantId - The ID of the restaurant
   * @param menuItemData - The menu item data to create
   * @returns Promise with the created menu item
   */
  async createMenuItem(restaurantId: string, menuItemData: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/menu-items/restaurant/${restaurantId}`, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  /**
   * Update an existing menu item
   * @param menuItemId - The ID of the menu item to update
   * @param menuItemData - The updated menu item data
   * @returns Promise with the updated menu item
   */
  async updateMenuItem(menuItemId: string, menuItemData: any) {
    try {
      const response = await axios.put(`${this.baseUrl}/api/menu-items/${menuItemId}`, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  /**
   * Delete a menu item
   * @param menuItemId - The ID of the menu item to delete
   * @returns Promise with the deletion result
   */
  async deleteMenuItem(menuItemId: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/menu-items/${menuItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  /**
   * Get all modifiers for a menu item
   * @param menuItemId - The ID of the menu item
   * @returns Promise with the modifiers data
   */
  async getMenuItemModifiers(menuItemId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/menu-items/${menuItemId}/modifiers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item modifiers:', error);
      throw error;
    }
  }
}

export const menuItemService = new MenuItemService();
