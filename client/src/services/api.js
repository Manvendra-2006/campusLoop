import axios from 'axios';

// Base URL is taken from Vite env variable VITE_API_URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send HttpOnly cookies
});

export default api;
