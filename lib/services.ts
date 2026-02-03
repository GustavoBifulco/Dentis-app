import { ApiResponse, Patient, StockItem, Procedure, LabOrder } from '../types';
import { api } from './api';

export const inventoryService = {
  getAll: (token: string): Promise<StockItem[]> => api.get('/inventory', token),
};

export const procedureService = {
  getAll: (token: string): Promise<Procedure[]> => api.get('/procedures', token),
};

export const patientService = {
  getAll: (token: string): Promise<Patient[]> => api.get('/patients', token),
};

export const labsService = {
  list: (): Promise<ApiResponse<LabOrder[]>> => Promise.resolve({ ok: true, data: [] }),
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
  appointments: appointmentService,
};
