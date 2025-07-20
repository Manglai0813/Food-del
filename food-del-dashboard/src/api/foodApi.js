import axios from 'axios';
import { getToken } from './authApi';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create food
const createFood = async (data) => {
  try {
    const response = await api.post('/api/food', data);
    return response.data;
  } catch (error) {
    console.error('Error creating food', error);
    return { success: false, message: 'Error creating food' };
  }
}

// Fetch food list
const getFoodList = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/api/food`, {
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food list', error);
    return { success: false, message: 'Error fetching food list' };
  }
};

// Fetch food by ID
const getFood = async (foodId) => {
  try {
    const response = await api.get(`/api/food/${foodId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching food bu ID', error);
    return { success: false, message: 'Error fetching food by ID' };
  }
}

// Update food
const updateFood = async (foodId, data) => {
  try {
    const response = await api.put(`/api/food/${foodId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating food', error);
    return { success: false, message: 'Error updating food' };
  }
}

// Delete food
const deleteFood = async (foodId) => {
  try {
    const response = await api.delete(`/api/food/${foodId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting food', error);
    return { success: false, message: 'Error deleting food' };
  }
};

// Export functions
export { createFood, getFoodList, getFood, updateFood, deleteFood };