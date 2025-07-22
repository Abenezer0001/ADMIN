/**
 * INSEAT Inventory Service - Frontend API Client
 * Developer: Maria Santos (Frontend Specialist)
 * Phase: 3 - Frontend Service Layer Implementation
 * Total Methods: 41 API Integration Methods
 */

import api from '../utils/axiosConfig';
import { AxiosResponse } from 'axios';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface InventoryItem {
  _id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  averageCost: number;
  lastCost?: number;
  location?: string;
  expirationDays?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  _id: string;
  name: string;
  description?: string;
  category: string;
  servingSize: number;
  prepTime: number;
  cookTime: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  ingredients: RecipeIngredient[];
  calculatedCost: number;
  calculatedCostPerPortion: number;
  version: number;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName?: string;
  quantity: number;
  unit: string;
  cost?: number;
}

export interface Supplier {
  _id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentTerms?: string;
  deliveryDays?: string[];
  minimumOrderAmount?: number;
  rating?: number;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax?: number;
  total: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  quantityReceived?: number;
  quantityDamaged?: number;
}

export interface WasteRecord {
  _id: string;
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  wasteReason: string;
  costImpact: number;
  wasteDate: string;
  reportedBy: string;
  location?: string;
  notes?: string;
  preventable: boolean;
  restaurantId: string;
  createdAt: string;
}

export interface StockMovement {
  _id: string;
  inventoryItemId: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  unitCost?: number;
  reference?: string;
  performedBy: string;
  restaurantId: string;
  createdAt: string;
}

export interface InventoryAnalytics {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  expiredItems: number;
  topCategories: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  costTrends: Array<{
    date: string;
    totalCost: number;
  }>;
}

// ========================================
// API REQUEST/RESPONSE INTERFACES
// ========================================

export interface CreateInventoryItemRequest {
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  averageCost: number;
  location?: string;
  expirationDays?: number;
  restaurantId: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  description?: string;
  category?: string;
  minimumStock?: number;
  maximumStock?: number;
  averageCost?: number;
  location?: string;
  expirationDays?: number;
  restaurantId: string;
}

export interface StockAdjustmentRequest {
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  unitCost?: number;
  restaurantId: string;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  category: string;
  servingSize: number;
  prepTime: number;
  cookTime: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  ingredients: RecipeIngredient[];
  restaurantId: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: any;
  paymentTerms?: string;
  deliveryDays?: string[];
  minimumOrderAmount?: number;
  rating?: number;
  restaurantId: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  expectedDeliveryDate?: string;
  notes?: string;
  restaurantId: string;
}

// ========================================
// INVENTORY SERVICE CLASS
// ========================================

class InventoryService {
  private readonly baseURL = '/inventory';

  // ========================================
  // INVENTORY ITEMS (8 methods)
  // ========================================

  /**
   * Get all inventory items for a restaurant
   */
  async getInventoryItems(restaurantId: string): Promise<InventoryItem[]> {
    const response: AxiosResponse<{success: boolean, data: InventoryItem[]}> = await api.get(
      `${this.baseURL}/items?restaurantId=${restaurantId}`
    );
    return response.data.data;
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItem(id: string, restaurantId: string): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryItem> = await api.get(
      `${this.baseURL}/inventory/${id}?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Create new inventory item
   */
  async createInventoryItem(item: CreateInventoryItemRequest): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryItem> = await api.post(
      `${this.baseURL}/inventory`,
      item
    );
    return response.data;
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id: string, updates: UpdateInventoryItemRequest): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryItem> = await api.put(
      `${this.baseURL}/inventory/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id: string, restaurantId: string): Promise<void> {
    await api.delete(`${this.baseURL}/inventory/${id}?restaurantId=${restaurantId}`);
  }

  /**
   * Adjust stock levels
   */
  async adjustStock(id: string, adjustment: StockAdjustmentRequest): Promise<void> {
    await api.post(`${this.baseURL}/inventory/${id}/stock/adjust`, adjustment);
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(restaurantId: string): Promise<InventoryItem[]> {
    const response: AxiosResponse<{success: boolean, data: InventoryItem[]}> = await api.get(
      `${this.baseURL}/low-stock?restaurantId=${restaurantId}`
    );
    return response.data.data;
  }

  /**
   * Get inventory by category
   */
  async getInventoryByCategory(category: string, restaurantId: string): Promise<InventoryItem[]> {
    const response: AxiosResponse<InventoryItem[]> = await api.get(
      `${this.baseURL}/inventory/category/${encodeURIComponent(category)}?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  // ========================================
  // RECIPES (10 methods)
  // ========================================

  /**
   * Get all recipes for a restaurant
   */
  async getRecipes(restaurantId: string): Promise<Recipe[]> {
    const response: AxiosResponse<{success: boolean, data: Recipe[]}> = await api.get(
      `${this.baseURL}/recipes?restaurantId=${restaurantId}`
    );
    return response.data.data;
  }

  /**
   * Get recipe by ID
   */
  async getRecipe(id: string, restaurantId: string): Promise<Recipe> {
    const response: AxiosResponse<Recipe> = await api.get(
      `${this.baseURL}/recipes/${id}?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Create new recipe
   */
  async createRecipe(recipe: CreateRecipeRequest): Promise<Recipe> {
    const response: AxiosResponse<Recipe> = await api.post(
      `${this.baseURL}/recipes`,
      recipe
    );
    return response.data;
  }

  /**
   * Update recipe
   */
  async updateRecipe(id: string, updates: Partial<CreateRecipeRequest>): Promise<Recipe> {
    const response: AxiosResponse<Recipe> = await api.put(
      `${this.baseURL}/recipes/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete recipe
   */
  async deleteRecipe(id: string, restaurantId: string): Promise<void> {
    await api.delete(`${this.baseURL}/recipes/${id}?restaurantId=${restaurantId}`);
  }

  /**
   * Calculate recipe cost
   */
  async calculateRecipeCost(id: string, restaurantId: string): Promise<{
    totalCost: number;
    costPerPortion: number;
    ingredients: Array<{
      ingredientId: string;
      ingredientName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
    }>;
  }> {
    const response = await api.get(
      `${this.baseURL}/recipes/${id}/cost?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Scale recipe quantities
   */
  async scaleRecipe(id: string, scaleFactor: number, restaurantId: string): Promise<Recipe> {
    const response: AxiosResponse<Recipe> = await api.post(
      `${this.baseURL}/recipes/${id}/scale`,
      { scaleFactor, restaurantId }
    );
    return response.data;
  }

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(category: string, restaurantId: string): Promise<Recipe[]> {
    const response: AxiosResponse<Recipe[]> = await api.get(
      `${this.baseURL}/recipes/category/${encodeURIComponent(category)}?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Search recipes
   */
  async searchRecipes(query: string, restaurantId: string): Promise<Recipe[]> {
    const response: AxiosResponse<Recipe[]> = await api.get(
      `${this.baseURL}/recipes/search?q=${encodeURIComponent(query)}&restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Duplicate recipe
   */
  async duplicateRecipe(id: string, newName: string, restaurantId: string): Promise<Recipe> {
    const response: AxiosResponse<Recipe> = await api.post(
      `${this.baseURL}/recipes/${id}/duplicate`,
      { newName, restaurantId }
    );
    return response.data;
  }

  // ========================================
  // SUPPLIERS (5 methods)
  // ========================================

  /**
   * Get all suppliers
   */
  async getSuppliers(restaurantId: string): Promise<Supplier[]> {
    try {
      const response: AxiosResponse<{success: boolean, data: Supplier[]}> = await api.get(
        `${this.baseURL}/suppliers?restaurantId=${restaurantId}`
      );
      return response.data.data || [];
    } catch (error) {
      console.warn('Suppliers endpoint not available, returning empty array');
      return [];
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplier(id: string, restaurantId: string): Promise<Supplier> {
    const response: AxiosResponse<Supplier> = await api.get(
      `${this.baseURL}/suppliers/${id}?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Create new supplier
   */
  async createSupplier(supplier: CreateSupplierRequest): Promise<Supplier> {
    const response: AxiosResponse<Supplier> = await api.post(
      `${this.baseURL}/suppliers`,
      supplier
    );
    return response.data;
  }

  /**
   * Update supplier
   */
  async updateSupplier(id: string, updates: Partial<CreateSupplierRequest>): Promise<Supplier> {
    const response: AxiosResponse<Supplier> = await api.put(
      `${this.baseURL}/suppliers/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string, restaurantId: string): Promise<void> {
    await api.delete(`${this.baseURL}/suppliers/${id}?restaurantId=${restaurantId}`);
  }

  // ========================================
  // PURCHASE ORDERS (6 methods)
  // ========================================

  /**
   * Get all purchase orders
   */
  async getPurchaseOrders(restaurantId: string): Promise<PurchaseOrder[]> {
    try {
      const response: AxiosResponse<{success: boolean, data: PurchaseOrder[]}> = await api.get(
        `${this.baseURL}/purchase-orders?restaurantId=${restaurantId}`
      );
      return response.data.data || [];
    } catch (error) {
      console.warn('Purchase orders endpoint not available, returning empty array');
      return [];
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrder(id: string, restaurantId: string): Promise<PurchaseOrder> {
    const response: AxiosResponse<PurchaseOrder> = await api.get(
      `${this.baseURL}/purchase-orders/${id}?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(order: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response: AxiosResponse<PurchaseOrder> = await api.post(
      `${this.baseURL}/purchase-orders`,
      order
    );
    return response.data;
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(id: string, updates: Partial<CreatePurchaseOrderRequest>): Promise<PurchaseOrder> {
    const response: AxiosResponse<PurchaseOrder> = await api.put(
      `${this.baseURL}/purchase-orders/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * Approve purchase order
   */
  async approvePurchaseOrder(id: string, restaurantId: string, approvalData?: any): Promise<PurchaseOrder> {
    const response: AxiosResponse<PurchaseOrder> = await api.post(
      `${this.baseURL}/purchase-orders/${id}/approve`,
      { ...approvalData, restaurantId }
    );
    return response.data;
  }

  /**
   * Delete purchase order
   */
  async deletePurchaseOrder(id: string, restaurantId: string): Promise<void> {
    await api.delete(`${this.baseURL}/purchase-orders/${id}?restaurantId=${restaurantId}`);
  }

  // ========================================
  // WASTE TRACKING (4 methods)
  // ========================================

  /**
   * Get all waste records
   */
  async getWasteRecords(restaurantId: string): Promise<WasteRecord[]> {
    try {
      const response: AxiosResponse<{success: boolean, data: WasteRecord[]}> = await api.get(
        `${this.baseURL}/waste?restaurantId=${restaurantId}`
      );
      return response.data.data || [];
    } catch (error) {
      console.warn('Waste records endpoint not available, returning empty array');
      return [];
    }
  }

  /**
   * Create waste record
   */
  async createWasteRecord(wasteData: Partial<WasteRecord> & { restaurantId: string }): Promise<WasteRecord> {
    const response: AxiosResponse<WasteRecord> = await api.post(
      `${this.baseURL}/waste`,
      wasteData
    );
    return response.data;
  }

  /**
   * Update waste record
   */
  async updateWasteRecord(id: string, updates: Partial<WasteRecord> & { restaurantId: string }): Promise<WasteRecord> {
    const response: AxiosResponse<WasteRecord> = await api.put(
      `${this.baseURL}/waste/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete waste record
   */
  async deleteWasteRecord(id: string, restaurantId: string): Promise<void> {
    await api.delete(`${this.baseURL}/waste/${id}?restaurantId=${restaurantId}`);
  }

  // ========================================
  // ANALYTICS (8 methods)
  // ========================================

  /**
   * Get inventory analytics overview
   */
  async getInventoryAnalytics(restaurantId: string): Promise<InventoryAnalytics> {
    const response: AxiosResponse<{success: boolean, data: InventoryAnalytics}> = await api.get(
      `${this.baseURL}/analytics/inventory/value?restaurantId=${restaurantId}`
    );
    return response.data.data;
  }

  /**
   * Get cost trends analysis
   */
  async getCostTrends(restaurantId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const response = await api.get(
      `${this.baseURL}/analytics/cost-trends?period=${period}&restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Get ABC analysis
   */
  async getABCAnalysis(restaurantId: string): Promise<any> {
    const response = await api.get(
      `${this.baseURL}/analytics/abc-analysis?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Get supplier performance
   */
  async getSupplierPerformance(restaurantId: string, period: 'month' | 'quarter' = 'month'): Promise<any> {
    const response = await api.get(
      `${this.baseURL}/analytics/supplier-performance?period=${period}&restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Get waste analytics
   */
  async getWasteAnalytics(restaurantId: string, period: 'month' | 'quarter' = 'month'): Promise<any> {
    const response = await api.get(
      `${this.baseURL}/analytics/waste?period=${period}&restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Get inventory turnover analysis
   */
  async getTurnoverAnalysis(restaurantId: string, days: number = 30): Promise<any> {
    const response = await api.get(
      `${this.baseURL}/analytics/turnover?days=${days}&restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Get profitability analysis
   */
  async getProfitabilityAnalysis(restaurantId: string): Promise<any> {
    const response = await api.get(
      `${this.baseURL}/analytics/profitability/menu-items?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(restaurantId: string, reportType: string, format: 'csv' | 'json' = 'json'): Promise<any> {
    const response = await api.get(
      `${this.baseURL}/analytics/export?reportType=${reportType}&format=${format}&restaurantId=${restaurantId}`
    );
    return response.data;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get stock movements for an item
   */
  async getStockMovements(itemId: string, restaurantId: string): Promise<StockMovement[]> {
    const response: AxiosResponse<StockMovement[]> = await api.get(
      `${this.baseURL}/inventory/${itemId}/movements?restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Search inventory items
   */
  async searchInventory(query: string, restaurantId: string): Promise<InventoryItem[]> {
    const response: AxiosResponse<InventoryItem[]> = await api.get(
      `${this.baseURL}/inventory/search?q=${encodeURIComponent(query)}&restaurantId=${restaurantId}`
    );
    return response.data;
  }

  /**
   * Get inventory categories
   */
  async getInventoryCategories(restaurantId: string): Promise<string[]> {
    const response: AxiosResponse<string[]> = await api.get(
      `${this.baseURL}/inventory/categories?restaurantId=${restaurantId}`
    );
    return response.data;
  }
}

// Create and export singleton instance
const inventoryService = new InventoryService();
export default inventoryService;

// Export types for use in components
export type {
  InventoryItem,
  Recipe,
  Supplier,
  PurchaseOrder,
  WasteRecord,
  StockMovement,
  InventoryAnalytics,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  StockAdjustmentRequest,
  CreateRecipeRequest,
  CreateSupplierRequest,
  CreatePurchaseOrderRequest
};