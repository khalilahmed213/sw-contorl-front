import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth'; // Change this URL according to your backend API URL

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || 'Login failed');
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
    return response.accessToken;
  } catch (error) {
    throw new Error(error.response.data.message || 'Token refresh failed');
  }
};