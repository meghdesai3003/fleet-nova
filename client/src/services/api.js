import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetnova_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fleetnova_token');
      localStorage.removeItem('fleetnova_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || fallback;
}

// ---- Auth ----
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// ---- Vehicles ----
export const vehicleApi = {
  getAll: () => api.get('/vehicles'),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  remove: (id) => api.delete(`/vehicles/${id}`),
};

// ---- Drivers ----
export const driverApi = {
  getAll: () => api.get('/drivers'),
  getOne: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  remove: (id) => api.delete(`/drivers/${id}`),
};

// ---- Trips ----
export const tripApi = {
  getAll: () => api.get('/trips'),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  dispatch: (id) => api.put(`/trips/${id}/dispatch`),
  complete: (id, data) => api.put(`/trips/${id}/complete`, data),
  cancel: (id) => api.put(`/trips/${id}/cancel`),
  remove: (id) => api.delete(`/trips/${id}`),
};

// ---- Maintenance ----
export const maintenanceApi = {
  getAll: () => api.get('/maintenance'),
  getOne: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  close: (id) => api.put(`/maintenance/${id}/close`),
};

// ---- Fuel & Expenses ----
export const fuelExpenseApi = {
  getFuelLogs: () => api.get('/fuel'),
  createFuelLog: (data) => api.post('/fuel', data),
  getExpenses: () => api.get('/expenses'),
  createExpense: (data) => api.post('/expenses', data),
  getOperationalCost: (vehicleId) => api.get(`/cost/${vehicleId}`),
};

// ---- Reports ----
export const reportApi = {
  getReports: () => api.get('/reports'),
};

export default api;
