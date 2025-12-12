import axios from 'axios';

// Prioritize the environment variable
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;/*// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com',
  withCredentials: true,
});

export default api;*/