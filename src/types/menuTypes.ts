export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  [key: string]: any; // For dynamic language fields like name_ar, name_fr, etc.
}

export interface ModifierGroup {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  modifiers: Modifier[];
  [key: string]: any; // For dynamic language fields
}

export interface MenuItem {
  id: string;
  mainItemName: string;
  arabicName: string;
  preparation: number;
  description: string;
  arabicDescription: string;
  sku: string;
  barcode: string;
  price: number;
  currency: string;
  ingredients: string[];
  modifierGroups: ModifierGroup[];
  classifications: string[];
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  instructions: string[];
  tags: string[];
  image?: string;
  isAvailable: boolean;
  eightySixReason: string;
  menuId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For dynamic language fields
}

export interface MenuItemFormData extends Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface ModifierFormData {
  name: string;
  price: number;
  isAvailable: boolean;
  [key: string]: any; // For dynamic language fields
}

export interface ModifierGroupFormData extends Omit<ModifierGroup, 'id'> {
  id?: string;
}
