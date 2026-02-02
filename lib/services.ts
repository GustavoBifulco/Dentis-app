import { ApiResponse, Patient, StockItem, Procedure, LabOrder } from '../types';

const getHeaders = (userId: string) => {
  return {
    'x-user-id': userId,
    'Content-Type': 'application/json'
  };
};

export const inventoryService = {
  getAll: (userId: string): Promise<StockItem[]> => fetch('/api/inventory', { headers: getHeaders(userId) }).then(res => res.json()),
};

export const procedureService = {
  getAll: (userId: string): Promise<Procedure[]> => fetch('/api/procedures', { headers: getHeaders(userId) }).then(res => res.json()),
};

export const patientService = {
  getAll: (userId: string): Promise<Patient[]> => fetch('/api/patients', { headers: getHeaders(userId) }).then(res => res.json()),
};

export const labsService = {
  list: (): Promise<ApiResponse<LabOrder[]>> => Promise.resolve({ ok: true, data: [] }),
};

export const Services = {
  patients: patientService,
  inventory: inventoryService,
  procedures: procedureService,
  labs: labsService,
};
