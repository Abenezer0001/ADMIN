import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { Category } from './CategoryService'; // Import Category type for reference

// Interface for SubCategory data received from the API
export interface SubCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string; // Added image field
  isActive: boolean;
  order: number;
  category: string | Category; // Can be ID string or populated Category object
  restaurantId: string; // Added restaurantId (assuming it's populated/available from backend)
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a new SubCategory
export interface CreateSubCategoryDto {
  name: string;
  description?: string;
  image?: string; // Added image field
  isActive?: boolean;
  order?: number;
  category: string; // Parent Category ID is required
  restaurantId: string; // Added required restaurantId
}

// Interface for updating an existing SubCategory
export interface UpdateSubCategoryDto extends Partial<CreateSubCategoryDto> {}

class SubCategoryService {
  private baseUrl = `${API_BASE_URL}/subcategories`; // Updated endpoint

  // Get all subcategories, optionally filter by category ID
  async getSubCategories(categoryId?: string) {
    try {
      // Looking at the backend controller, it expects 'categoryId' in the query
      const params = categoryId ? { categoryId } : {};
      console.log('Fetching subcategories with params:', params);
      const response = await axios.get<SubCategory[]>(this.baseUrl, { params });
      console.log('Subcategories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }

  // Get a single subcategory by its ID
  async getSubCategory(id: string) {
    try {
      const response = await axios.get<SubCategory>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategory:', error);
      throw error;
    }
  }

  // Create a new subcategory
  async createSubCategory(subCategoryData: CreateSubCategoryDto) {
    try {
      const response = await axios.post<SubCategory>(this.baseUrl, subCategoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  }

  // Update an existing subcategory
  async updateSubCategory(id: string, subCategoryData: UpdateSubCategoryDto) {
    try {
      const response = await axios.put<SubCategory>(`${this.baseUrl}/${id}`, subCategoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }
  }

  // Delete a subcategory
  async deleteSubCategory(id: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/${id}`);
      return response.data; // Usually { message: '...' }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  }

  // Toggle subcategory active status
  async toggleSubCategoryStatus(id: string) {
    try {
      const response = await axios.patch<SubCategory>(`${this.baseUrl}/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      console.error('Error toggling subcategory status:', error);
      throw error;
    }
  }
}

export const subCategoryService = new SubCategoryService();
