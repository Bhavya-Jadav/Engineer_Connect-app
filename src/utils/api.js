// API Configuration for different environments
const getApiUrl = () => {
  // Check if we're running in production (Vercel deployment)
  if (process.env.NODE_ENV === 'production') {
    // Use Vercel serverless functions (same domain)
    return process.env.REACT_APP_API_BASE_URL_PROD || '/api';
  }
  
  // Development environment - use local backend
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();

console.log('🔧 API Configuration:');
console.log('   Environment:', process.env.NODE_ENV);
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   Full URL example:', `${API_BASE_URL}/users/google-auth`);

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
