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

// Export business types
export * from './business';
