import axios from 'axios';
import { API_BASE_URL } from './config';

// Debug API_BASE_URL to ensure it's correctly set
console.log('API Configuration:', {
  API_BASE_URL,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV
});

// Check if API_BASE_URL is properly configured
if (!API_BASE_URL) {
  console.error('WARNING: API_BASE_URL is not configured! Please check your .env file and config.ts');
}

// Test API connection at startup
async function testApiConnection() {
  try {
    // Test both with and without /api prefix to determine correct path
    const testUrls = [
      `${API_BASE_URL}/auth/login`,
      // Try removing /api if it's in the URL
      API_BASE_URL.includes('/api') 
        ? API_BASE_URL.replace('/api', '') + '/auth/login' 
        : null,
      // Try adding /api if not present
      !API_BASE_URL.includes('/api') 
        ? `${API_BASE_URL}/api/auth/login` 
        : null
    ].filter(Boolean) as string[];
    
    console.log('Testing API connections with URLs:', testUrls);
    
    for (const testUrl of testUrls) {
      try {
        const response = await fetch(testUrl, { 
          method: 'OPTIONS',
          headers: { 'Origin': window.location.origin }
        });
        
        console.log(`API connection test for ${testUrl}:`, {
          status: response.status,
          statusText: response.statusText,
          // Check for CORS headers
          corsHeaders: {
            allowOrigin: response.headers.get('access-control-allow-origin'),
            allowMethods: response.headers.get('access-control-allow-methods'),
            allowCredentials: response.headers.get('access-control-allow-credentials')
          }
        });
        
        // If we get a 200 or 204 (OPTIONS success) or even 401 (auth required),
        // this is a valid endpoint
        if ([200, 204, 401].includes(response.status)) {
          console.log(`Found working API endpoint: ${testUrl}`);
          break;
        }
      } catch (error) {
        console.warn(`API endpoint test failed for ${testUrl}:`, error);
      }
    }
  } catch (error) {
    console.error('API connection testing failed:', error);
  }
}

// Run the connection test
testApiConnection();

// Create axios instance with withCredentials to support cookies
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // No need to set Authorization header manually
    // HTTP-only cookies will be sent automatically with withCredentials: true
    
    // Add detailed request logging
    // Validate URL format
    if (config.url && !config.url.startsWith('/')) {
      console.warn('API URL path does not start with /, adding it:', config.url);
      config.url = `/${config.url}`;
    }
    
    // Check for empty payload on POST/PUT requests
    if ((config.method === 'post' || config.method === 'put') && !config.data) {
      console.warn('POST/PUT request without data payload:', config.url);
    }
    
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      baseURL: config.baseURL,
      headers: {
        ...config.headers,
        // Don't log actual Cookie values
        Cookie: config.headers?.Cookie ? '[PRESENT]' : '[NONE]'
      },
      withCredentials: config.withCredentials,
      // Log data without exposing sensitive information
      data: config.data ? {
        ...config.data,
        password: config.data.password ? '[REDACTED]' : undefined
      } : undefined
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses with more details
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      fullUrl: `${response.config.baseURL}${response.config.url}`,
      contentType: response.headers['content-type'],
      data: response.data,
      // Extract useful information for debugging
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token using the refresh cookie
        // No need to send the token in the request body, the cookie will be sent automatically
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`, 
          {}, // Empty body, the refresh token is in the HTTP-only cookie
          { withCredentials: true }
        );
        
        if (response.status === 200) {
          // The server has set new HTTP-only cookies
          // No need to manually update tokens or headers
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Log detailed refresh error information
        if (refreshError.response) {
          console.error('Refresh error details:', {
            status: refreshError.response.status,
            statusText: refreshError.response.statusText,
            data: refreshError.response.data
          });
        }
        
        // No need to clear localStorage tokens, just redirect to login
        // The server should clear the HTTP-only cookies on logout or failed refresh
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    // Log detailed error information before rejecting
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
        headers: error.response.headers,
        method: error.config?.method
      });
      
      // Special handling for common error status codes
      if (error.response.status === 404) {
        console.error('API ENDPOINT NOT FOUND. Check if the URL is correct:', error.config?.url);
        
        // Try alternative URL without /api prefix
        if (error.config?.url?.includes('/api/')) {
          console.log('Original URL has /api/ prefix. Consider removing it in config.ts');
        }
      } else if (error.response.status === 400) {
        console.error('BAD REQUEST: The server rejected the request. Details:', error.response.data);
        console.log('Request payload was:', error.config?.data);
      } else if (error.response.status === 403) {
        console.error('FORBIDDEN: Check permissions and authentication', error.response.data);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 