import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Submit interest form
  submitInterest: async (data) => {
    const response = await api.post('/api/interest', data);
    return response.data;
  },

  // Upload file
  uploadFile: async (formData) => {
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get job status
  getJobStatus: async (jobId) => {
    const response = await api.get(`/api/job/${jobId}`);
    return response.data;
  },

  // Get job result
  getJobResult: async (jobId) => {
    const response = await api.get(`/api/result/${jobId}`);
    return response.data;
  },
};

export default api;
