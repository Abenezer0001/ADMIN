import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { showError } from './notificationUtils';
import { API_BASE_URL } from './config';

// Re-export API_BASE_URL for backward compatibility
export { API_BASE_URL };

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Handle API errors
 * @param error Axios error
 * @returns Rejected promise with error message
 */
export const handleApiError = (error: AxiosError): Promise<never> => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const data = error.response.data as any;
    errorMessage = data.message || `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response received from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || errorMessage;
  }
  
  // Show error notification
  showError(errorMessage);
  
  // Return rejected promise
  return Promise.reject(errorMessage);
};

/**
 * Make a GET request
 * @param url API endpoint
 * @param config Axios request config
 * @returns Promise with response data
 */
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

/**
 * Make a POST request
 * @param url API endpoint
 * @param data Request data
 * @param config Axios request config
 * @returns Promise with response data
 */
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

/**
 * Make a PUT request
 * @param url API endpoint
 * @param data Request data
 * @param config Axios request config
 * @returns Promise with response data
 */
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

/**
 * Make a PATCH request
 * @param url API endpoint
 * @param data Request data
 * @param config Axios request config
 * @returns Promise with response data
 */
export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

/**
 * Make a DELETE request
 * @param url API endpoint
 * @param config Axios request config
 * @returns Promise with response data
 */
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

/**
 * Build API URL with query parameters
 * @param endpoint API endpoint
 * @param params Query parameters
 * @returns Full API URL with query parameters
 */
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};
