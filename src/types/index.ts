import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export interface ThemeMode {
  mode: 'light' | 'dark';
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  restaurantId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// Rating and Review types
export interface Rating {
  id: string;
  menuItemId: string;
  restaurantId: string;
  userId: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface MenuItemRating extends Rating {
  menuItem: {
    name: string;
    description: string;
    price: number;
  };
}

export interface ReviewFilter {
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
  verifiedOnly?: boolean;
  sortBy?: 'date' | 'rating' | 'helpful';
}

// Export business types
export * from './business';
