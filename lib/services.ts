import { ApiResponse, Patient, StockItem, Procedure, LabOrder } from '../types';
import { api } from './api';

export const inventoryService = {
  getAll: (token: string): Promise<StockItem[]> => api.get('/inventory', token),
};

export const procedureService = {
  getAll: (token: string): Promise<Procedure[]> => api.get('/procedures', token),
  update: (token: string, id: number, data: any): Promise<Procedure> => api.patch(`/procedures/${id}`, data, token),
};

export const patientService = {
  getAll: (token: string): Promise<Patient[]> => api.get('/patients', token),
};

export const labsService = {
  list: (token: string): Promise<ApiResponse<LabOrder[]>> => api.get('/lab', token),
  create: (token: string, data: any): Promise<ApiResponse<LabOrder>> => api.post('/lab', data, token),
  update: (token: string, id: number, data: any): Promise<ApiResponse<LabOrder>> => api.patch(`/lab/${id}`, data, token),
};

export const logisticsService = {
  createShipment: (token: string, data: any): Promise<ApiResponse<any>> => api.post('/logistics/shipments', data, token),
  updateStatus: (token: string, id: number, status: string): Promise<ApiResponse<any>> => api.patch(`/logistics/shipments/${id}/status`, { status }, token),
};

export const automationService = {
  list: (token: string): Promise<any[]> => api.get('/automations', token),
  create: (token: string, data: any): Promise<any> => api.post('/automations', data, token),
  delete: (token: string, id: number): Promise<any> => api.delete(`/automations/${id}`, token),
};


export const appointmentService = {
  getAvailability: (token: string, date: string): Promise<any> => api.get(`/appointments/availability?date=${date}`, token),
  list: (token: string, params?: any): Promise<any[]> => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/appointments?${query}`, token);
  },
  create: (token: string, data: any): Promise<any> => api.post('/appointments', data, token),
};

export const Services = {
  patients: patientService,
  inventory: inventoryService,
  procedures: procedureService,
  labs: labsService,
  logistics: logisticsService,
  appointments: appointmentService,
  automations: automationService,
};
