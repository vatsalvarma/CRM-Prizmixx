import { axiosClient } from '../../api/axiosClient';

export const checkInApi = async () => {
  const response = await axiosClient.post('/attendance/check-in');
  return response.data;
};

export const checkOutApi = async () => {
  const response = await axiosClient.post('/attendance/check-out');
  return response.data;
};

export const getTodayStatusApi = async () => {
  const response = await axiosClient.get('/attendance/status');
  return response.data;
};
