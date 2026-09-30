import { axiosClient } from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';

export const getPublicDepartments = async () => {
  const response = await axiosClient.get('/departments/public');
  return response.data;
};

export const loginApi = async (credentials: any) => {
  const response = await axiosClient.post('/auth/login', credentials);
  const { token, email, role, departmentName } = response.data;
  
  // Set in memory store
  useAuthStore.getState().setAuth(token, email, role, departmentName);
  
  // Configure interceptor to attach token to future requests
  axiosClient.interceptors.request.use((config) => {
    const currentToken = useAuthStore.getState().token;
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  });

  return response.data;
};
