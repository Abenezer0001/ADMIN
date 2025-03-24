// Global type definitions

// Extend React types
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

// Common types for the application
type AnyFunction = (...args: any[]) => any;
type AnyObject = Record<string, any>;

// Utility type for optional properties
type Nullable<T> = T | null | undefined;

// Generic type for API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Common interface for items with ID
interface IdentifiableItem {
  id: string | number;
}

// Extend window object if needed
interface Window {
  // Add any custom window properties here
}

// Mock service and data types
interface UserData extends IdentifiableItem {
  name: string;
  email: string;
  role: string;
}

interface ItemData extends IdentifiableItem {
  name: string;
  price: number;
  stock: number;
}

interface InvoiceData extends IdentifiableItem {
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  date: string;
}

interface OrderData extends IdentifiableItem {
  seat: string;
  status: string;
  time: string;
  items: any[];
  total: number;
}
