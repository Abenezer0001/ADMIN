import { API_BASE_URL } from '../utils/config';
import axios from 'axios';

export interface Modifier {
  _id: string;
  name: string;
  arabicName?: string;
  description?: string;
  arabicDescription?: string;
  price: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModifierDto {
  name: string;
  arabicName?: string;
  description?: string;
  arabicDescription?: string;
  price: number;
  isAvailable?: boolean;
}

export interface UpdateModifierDto extends Partial<CreateModifierDto> {}

class ModifierService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getModifiers() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/modifiers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modifiers:', error);
      throw error;
    }
  }

  async getModifier(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/modifiers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modifier:', error);
      throw error;
    }
  }

  async createModifier(modifierData: CreateModifierDto) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/modifiers`, modifierData);
      return response.data;
    } catch (error) {
      console.error('Error creating modifier:', error);
      throw error;
    }
  }

  async updateModifier(id: string, modifierData: UpdateModifierDto) {
    try {
      const response = await axios.put(`${this.baseUrl}/api/modifiers/${id}`, modifierData);
      return response.data;
    } catch (error) {
      console.error('Error updating modifier:', error);
      throw error;
    }
  }

  async deleteModifier(id: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/modifiers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting modifier:', error);
      throw error;
    }
  }

  async toggleModifierAvailability(id: string) {
    try {
      const response = await axios.patch(`${this.baseUrl}/api/modifiers/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      console.error('Error toggling modifier availability:', error);
      throw error;
    }
  }

  /**
   * Get all modifiers for a specific restaurant
   * @param restaurantId - The ID of the restaurant
   * @returns Promise with the modifiers data
   */
  async getModifiersByRestaurant(restaurantId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/modifiers/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modifiers by restaurant:', error);
      throw error;
    }
  }

  /**
   * Add a modifier to a menu item
   * @param menuItemId - The ID of the menu item
   * @param modifierId - The ID of the modifier to add
   * @returns Promise with the updated menu item
   */
  async addModifierToMenuItem(menuItemId: string, modifierId: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/menu-items/${menuItemId}/modifiers/${modifierId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding modifier to menu item:', error);
      throw error;
    }
  }

  /**
   * Remove a modifier from a menu item
   * @param menuItemId - The ID of the menu item
   * @param modifierId - The ID of the modifier to remove
   * @returns Promise with the updated menu item
   */
  async removeModifierFromMenuItem(menuItemId: string, modifierId: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/menu-items/${menuItemId}/modifiers/${modifierId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing modifier from menu item:', error);
      throw error;
    }
  }
}

export const modifierService = new ModifierService();