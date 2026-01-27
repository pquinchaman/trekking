import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('Error de red:', error.request);
    } else {
      // Algo pasó al configurar la solicitud
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
