// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000',
  withCredentials: true,
});

export default api;
 // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' ,
/*// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ← CRITICAL: Full URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Log all requests
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

export default api;*/