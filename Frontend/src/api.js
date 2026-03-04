import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const IMAGEN_URL = baseURL;

const clienteAxios = axios.create({
  baseURL: `${baseURL}/api`, 
});

// Interceptor de Solicitud
clienteAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta
clienteAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.clear(); 
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default clienteAxios;