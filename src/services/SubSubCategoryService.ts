import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { SubCategory } from './SubCategoryService'; // Import SubCategory type for reference

// Interface for SubSubCategory data received from the API
export interface SubSubCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  subCategory: string | SubCategory; // Can be ID string or populated SubCategory object
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a new SubSubCategory
export interface CreateSubSubCategoryDto {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
  subCategory: string; // Parent SubCategory ID is required
}

// Interface for updating an existing SubSubCategory
export interface UpdateSubSubCategoryDto extends Partial<CreateSubSubCategoryDto> {}

class SubSubCategoryService {
  private baseUrl = `${API_BASE_URL}/subsubcategories`; // Updated endpoint

  // Get all sub-subcategories, optionally filter by subCategory ID
  async getSubSubCategories(subCategoryId?: string) {
    try {
      // Looking at the backend controller, it expects 'subCategoryId' in the query params
      const params = subCategoryId ? { subCategoryId } : {};
      console.log('Fetching subsubcategories with params:', params);
      const response = await axios.get<SubSubCategory[]>(this.baseUrl, { params });
      console.log('SubSubcategories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sub-subcategories:', error);
      throw error;
    }
  }

  // Get a single sub-subcategory by its ID
  async getSubSubCategory(id: string) {
    try {
      const response = await axios.get<SubSubCategory>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sub-subcategory:', error);
      throw error;
    }
  }

  // Create a new sub-subcategory
  async createSubSubCategory(subSubCategoryData: CreateSubSubCategoryDto) {
    try {
      const response = await axios.post<SubSubCategory>(this.baseUrl, subSubCategoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating sub-subcategory:', error);
      throw error;
    }
  }

  // Update an existing sub-subcategory
  async updateSubSubCategory(id: string, subSubCategoryData: UpdateSubSubCategoryDto) {
    try {
      const response = await axios.put<SubSubCategory>(`${this.baseUrl}/${id}`, subSubCategoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating sub-subcategory:', error);
      throw error;
    }
  }

  // Delete a sub-subcategory
  async deleteSubSubCategory(id: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/${id}`);
      return response.data; // Usually { message: '...' }
    } catch (error) {
      console.error('Error deleting sub-subcategory:', error);
      throw error;
    }
  }

  // Toggle sub-subcategory active status
  async toggleSubSubCategoryStatus(id: string) {
    try {
      const response = await axios.patch<SubSubCategory>(`${this.baseUrl}/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      console.error('Error toggling sub-subcategory status:', error);
      throw error;
    }
  }
}

export const subSubCategoryService = new SubSubCategoryService();
