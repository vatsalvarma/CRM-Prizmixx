import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For httpOnly refresh tokens if used
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // We will retrieve the access token from wherever it is securely stored
    // For now, checking if there is one in memory (handled by a store later)
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Add logic to handle 401 Unauthorized errors and refresh tokens
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      try {
        // Example: const response = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        // Set new token and retry
        // return axiosClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
