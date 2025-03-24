import { API_BASE_URL } from '../utils/config';
import axios from 'axios';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

class CategoryService {
  private baseUrl = `${API_BASE_URL}/categories`;

  async getCategories() {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategory(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  async createCategory(categoryData: CreateCategoryDto) {
    try {
      const response = await axios.post(this.baseUrl, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, categoryData: UpdateCategoryDto) {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async toggleCategoryStatus(id: string) {
    try {
      const response = await axios.patch(`${this.baseUrl}/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService(); 