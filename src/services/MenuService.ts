import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { MenuItem } from './MenuItemService'; // Assuming MenuItemService exists/will exist
import { Restaurant } from './RestaurantService';
import { Venue } from './VenueService'; // Assuming VenueService exists
import { Category } from './CategoryService'; // Assuming CategoryService exists
import { SubCategory } from './SubCategoryService'; // Assuming SubCategoryService exists

// Removed outdated MenuCategory interface

// Interface for Menu data received from the API
// Updated Menu interface to match backend model
export interface Menu {
  _id: string;
  name: string;
  description?: string;
  restaurantId: string | Restaurant; // ID or populated Restaurant
  venueId: string | Venue; // Added venueId (ID or populated Venue)
  categories: string[] | Category[]; // Array of Category IDs or populated Categories
  subCategories: string[] | SubCategory[]; // Array of SubCategory IDs or populated SubCategories
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a new Menu
// Updated CreateMenuDto
export interface CreateMenuDto {
  name: string;
  description?: string;
  restaurantId: string; // Required restaurant ID
  venueId: string; // Required venue ID
  isActive?: boolean;
  categories?: string[]; // Optional array of Category IDs
  subCategories?: string[]; // Optional array of SubCategory IDs
}

// Interface for updating an existing Menu (excluding categories/items management here)
// Updated UpdateMenuDto
export interface UpdateMenuDto {
  name?: string;
  description?: string;
  venueId?: string; // Allow updating venue
  isActive?: boolean;
  categories?: string[]; // Allow updating category IDs
  subCategories?: string[]; // Allow updating subCategory IDs
}

// Removed outdated DTOs (AddCategoryToMenuDto, AddMenuItemReferenceDto)

class MenuService {
  private baseUrl = `${API_BASE_URL}/menus`; // Base endpoint for menus

  // Get all menus (optionally filter by restaurantId)
  async getMenus(restaurantId?: string) {
    try {
      const params = restaurantId ? { restaurantId } : {};
      // Fetching all menus by default if no restaurantId provided
      const response = await axios.get<Menu[]>(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  }

  // Get a single menu by its ID
  async getMenu(menuId: string) {
    try {
      // Consider populating related fields if needed via query params
      // e.g., ?populate=venueId,categories,subCategories
      const response = await axios.get<Menu>(`${this.baseUrl}/${menuId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  }

  // Create a new menu
  async createMenu(menuData: CreateMenuDto) {
    try {
      const response = await axios.post<Menu>(this.baseUrl, menuData);
      return response.data;
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  }

  // Update menu details (including venue, categories, subcategories)
  async updateMenu(menuId: string, menuData: UpdateMenuDto) {
    try {
      const response = await axios.put<Menu>(`${this.baseUrl}/${menuId}`, menuData);
      return response.data;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  }

  // Delete a menu
  async deleteMenu(menuId: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/${menuId}`);
      return response.data; // Usually { message: '...' }
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  }

  // Removed outdated service methods for managing embedded categories/items
  // (addCategoryToMenu, updateMenuCategory, deleteMenuCategory,
  // addMenuItemReferenceToCategory, removeMenuItemReferenceFromCategory)

}

export const menuService = new MenuService();
