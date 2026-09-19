import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api', // Points to your Express server
// });

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
// });

const api = axios.create({
  // Hardcoded to guarantee Vercel connects to your live Render backend
  baseURL: 'https://weeklystatus-api.onrender.com/api', 
});

// Automatically attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;