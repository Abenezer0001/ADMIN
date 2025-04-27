import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { SubSubCategory } from './SubSubCategoryService';
import { Category } from './CategoryService';
import { SubCategory } from './SubCategoryService';
import { Venue } from './VenueService';
// If ModifierGroup is needed, import its type definition
// import { IModifierGroup } from './path/to/modifier/type';

// Interface for MenuItem data received from the API
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  subSubCategory: string | SubSubCategory; // ID or populated SubSubCategory
  categories: string[] | Category[]; // Array of Category IDs or populated Category objects
  subCategories: string[] | SubCategory[]; // Array of SubCategory IDs or populated SubCategory objects
  price: number;
  // modifierGroups?: IModifierGroup[]; // Uncomment if type is available
  modifierGroups?: any[]; // Placeholder
  image?: string;
  preparationTime: number;
  isAvailable: boolean;
  isActive: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
  };
  restaurantId: string; // Assuming it's always an ID string from backend
  venueId: string | Venue; // ID or populated Venue
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a new MenuItem
export interface CreateMenuItemDto {
  name: string;
  description: string;
  subSubCategory: string; // SubSubCategory ID is required
  categories: string[]; // Array of Category IDs
  subCategories: string[]; // Array of SubCategory IDs
  price: number;
  restaurantId: string; // Restaurant ID is required
  venueId: string; // Venue ID is required
  preparationTime: number;
  modifierGroups?: any[]; // Placeholder
  image?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
  };
}

// Interface for updating an existing MenuItem
export interface UpdateMenuItemDto extends Partial<Omit<CreateMenuItemDto, 'restaurantId'>> {} // Cannot update restaurantId

class MenuItemService {
  private baseUrl = `${API_BASE_URL}/menu-items`; // Endpoint for menu items

  // Get all menu items (optional filters)
  async getMenuItems(params?: { 
    restaurantId?: string; 
    venueId?: string;
    categoryId?: string;
    subCategoryId?: string;
    subSubCategoryId?: string; 
    includeInactive?: boolean 
  }) {
    try {
      const response = await axios.get<MenuItem[]>(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  // Get a single menu item by its ID
  async getMenuItem(id: string) {
    try {
      const response = await axios.get<MenuItem>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  }

  // Create a new menu item
  async createMenuItem(menuItemData: FormData) { // Accept FormData
    try {
      const response = await axios.post<MenuItem>(this.baseUrl, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  // Update an existing menu item
  async updateMenuItem(id: string, menuItemData: FormData) { // Accept FormData
    try {
      const response = await axios.put<MenuItem>(`${this.baseUrl}/${id}`, menuItemData);
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  // Delete a menu item (soft delete by default)
  async deleteMenuItem(id: string, hardDelete: boolean = false) {
    try {
      const params = hardDelete ? { hardDelete: 'true' } : {};
      const response = await axios.delete(`${this.baseUrl}/${id}`, { params });
      return response.data; // Usually { message: '...' }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Toggle menu item availability (isAvailable field)
  async toggleMenuItemAvailability(id: string) {
    try {
      const response = await axios.patch<MenuItem>(`${this.baseUrl}/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      throw error;
    }
  }
}

export const menuItemService = new MenuItemService();
