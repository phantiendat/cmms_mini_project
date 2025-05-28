import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Thay đổi thành false để tránh vấn đề CORS
} );

// Add request interceptor to add auth header
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      
      // Nếu lỗi là do token hết hạn hoặc không hợp lệ
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('Token expired or invalid');
        // Chỉ xóa token và chuyển hướng nếu không phải đang ở trang login
        if (!window.location.pathname.includes('/login')) {
          console.log('Redirecting to login page');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }
      }
    } else if (error.request) {
      console.error('Request made but no response received');
      console.error(error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
