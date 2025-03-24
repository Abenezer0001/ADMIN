import React from 'react';

// Generic event handler types
export type EventHandler<T = React.SyntheticEvent> = (event: T) => void;

// Generic function type
export type AnyFunction = (...args: any[]) => any;

// Utility type for optional properties
export type Nullable<T> = T | null | undefined;

// Common interfaces for data models
export interface IdentifiableItem {
  id: string | number;
}

export interface BaseEntity extends IdentifiableItem {
  createdAt?: string;
  updatedAt?: string;
}

// Generic props type for components with children
export interface ChildrenProps {
  children?: React.ReactNode;
}

// Type for event targets
export type EventTarget = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// Button color types for Material UI and Ant Design
export type ButtonColor = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'inherit' 
  | 'info' 
  | 'warning' 
  | 'success' 
  | 'error';

// Menu theme types
export type MenuTheme = 'light' | 'dark';

// Generic data response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Specific data types for the application
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  items: Item[];
}

export interface Order {
  id: string;
  seat: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  items: Item[];
  total: number;
  time: string;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface IconStyleProps {
  IconComponent: React.ElementType;
  color?: string;
  size?: number;
  variant?: 'filled' | 'outlined';
  padding?: string;
  hoverEffect?: 'scale' | 'shadow' | 'none';
  customStyles?: React.CSSProperties;
}

// Event handler types for common scenarios
export type InputChangeHandler = EventHandler<React.ChangeEvent<HTMLInputElement>>;
export type FormSubmitHandler = EventHandler<React.FormEvent<HTMLFormElement>>;
export type ButtonClickHandler = EventHandler<React.MouseEvent<HTMLButtonElement>>;

// Utility type for record manipulation
export type RecordHandler<T> = (record: T) => void;

// Generic search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
