/**
 * Authentication utility functions
 */

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Get stored user data from localStorage
 * @returns {object|null} User object or null if not found
 */
export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get authorization headers for API requests
 * @returns {object} Headers object with Authorization token
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Example: How to make authenticated API requests
 * 
 * Usage with axios:
 * 
 * import axios from 'axios';
 * import { getAuthHeaders } from '@/lib/auth';
 * 
 * // GET request
 * const response = await axios.get('/api/protected-route', getAuthHeaders());
 * 
 * // POST request
 * const response = await axios.post(
 *   '/api/protected-route', 
 *   { data: 'your data' }, 
 *   getAuthHeaders()
 * );
 */

