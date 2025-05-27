import api from './api';

const register = (username, password, name, email, role) => {
  return api.post('/auth/register', {
    username,
    password,
    name,
    email,
    role
  });
};

const login = (username, password) => {
  console.log('Calling login API with:', { username, password });
  return api.post('/auth/login', {
    username,
    password
  }).then(response => {
    console.log('Login response:', response.data);
    if (response.data && response.data.token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      // Lưu thông tin user vào localStorage
      const userData = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      };
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Invalid login response');
  });
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser
};

export default AuthService;

