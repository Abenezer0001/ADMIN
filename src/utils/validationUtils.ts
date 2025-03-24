import { Order, OrderItem } from '../types/order';

/**
 * Validate an email address
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a phone number
 * @param phone Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Basic validation for phone numbers
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Validate if a string has minimum length
 * @param value String to validate
 * @param minLength Minimum length
 * @returns Boolean indicating if string has minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  if (!value) return false;
  return value.length >= minLength;
};

/**
 * Validate if a number is positive
 * @param value Number to validate
 * @returns Boolean indicating if number is positive
 */
export const isPositive = (value: number): boolean => {
  return typeof value === 'number' && value > 0;
};

/**
 * Validate if a value is not empty
 * @param value Value to validate
 * @returns Boolean indicating if value is not empty
 */
export const isNotEmpty = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  
  return !!value;
};

/**
 * Validate an order item
 * @param item Order item to validate
 * @returns Object with validation result and error message
 */
export const validateOrderItem = (item: OrderItem): { isValid: boolean; error?: string } => {
  if (!item) {
    return { isValid: false, error: 'Item is required' };
  }
  
  if (!isNotEmpty(item.name)) {
    return { isValid: false, error: 'Item name is required' };
  }
  
  if (!isPositive(item.price)) {
    return { isValid: false, error: 'Item price must be positive' };
  }
  
  if (!isPositive(item.quantity)) {
    return { isValid: false, error: 'Item quantity must be positive' };
  }
  
  return { isValid: true };
};

/**
 * Validate an order
 * @param order Order to validate
 * @returns Object with validation result and error message
 */
export const validateOrder = (order: Partial<Order>): { isValid: boolean; error?: string } => {
  if (!order) {
    return { isValid: false, error: 'Order is required' };
  }
  
  if (!order.customer || !isNotEmpty(order.customer.name)) {
    return { isValid: false, error: 'Customer name is required' };
  }
  
  if (order.customer.email && !isValidEmail(order.customer.email)) {
    return { isValid: false, error: 'Customer email is invalid' };
  }
  
  if (order.customer.phone && !isValidPhone(order.customer.phone)) {
    return { isValid: false, error: 'Customer phone is invalid' };
  }
  
  if (!isPositive(order.tableNumber)) {
    return { isValid: false, error: 'Table number is required and must be positive' };
  }
  
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return { isValid: false, error: 'Order must have at least one item' };
  }
  
  // Validate each item
  for (const item of order.items) {
    const itemValidation = validateOrderItem(item);
    if (!itemValidation.isValid) {
      return itemValidation;
    }
  }
  
  return { isValid: true };
};
