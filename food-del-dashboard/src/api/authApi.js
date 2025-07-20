import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

const setToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const getToken = () => {
  return localStorage.getItem('token');
};

const login = async (data) => {
  const response = await api.post('/api/user/auth/login', data);
  if (response.data.success) {
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    document.cookie = `authToken=${response.data.token}; path=/; max-age=${60*60*24*7}`;
  }
  return response.data;
};

const register = async (data) => {
  const response = await api.post('/api/user/auth/register', data);
  if (response.data.success) {
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    document.cookie = `authToken=${response.data.token}; path=/; max-age=${60*60*24*7}`;
  }
  return response.data;
};

const logout = async () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.post('/api/user/auth/logout');
    if (response.data.success) {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    return response.data;
  }
};

export { login, register, logout, getToken };