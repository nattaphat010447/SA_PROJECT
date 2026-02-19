import axios from 'axios';

// สร้าง instance ของ axios และชี้ไปที่ Backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Middleware: ก่อนส่ง Request ทุกครั้ง ให้แนบ Token ไปด้วย
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;