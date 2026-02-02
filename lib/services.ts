const getHeaders = (userId: string) => {
  return { 
    'x-user-id': userId,
    'Content-Type': 'application/json'
  };
};

export const inventoryService = {
  getAll: (userId: string) => fetch('/api/inventory', { headers: getHeaders(userId) }).then(res => res.json()),
};

export const procedureService = {
  getAll: (userId: string) => fetch('/api/procedures', { headers: getHeaders(userId) }).then(res => res.json()),
};

export const patientService = {
  // Agora aceita userId e o nome é getAll (padronizado)
  getAll: (userId: string) => fetch('/api/patients', { headers: getHeaders(userId) }).then(res => res.json()),
};

export const Services = {
  patients: patientService,
  inventory: inventoryService,
  procedures: procedureService
};
