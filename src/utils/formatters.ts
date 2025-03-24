/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Format: HH:MM - DD/MM/YYYY
  return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString()}`;
};

/**
 * Format a number as currency
 * @param amount Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number with commas for thousands
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0';
  
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a percentage
 * @param value Number to format as percentage
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  if (value === undefined || value === null) return '0%';
  
  return `${value.toFixed(1)}%`;
};
