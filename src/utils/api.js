// API Configuration for different environments
const getApiUrl = () => {
  // Check if we're running in production
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api';
  }
  
  // Development environment
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();

// Helper function for making API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

const apiModule = { API_BASE_URL, apiCall };
export default apiModule;
