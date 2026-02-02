const getHeaders = () => {
  const clerkUser = (window as any).Clerk?.user || (window as any).clerk?.user;
  const userId = clerkUser?.id || '';
  
  return { 
    'x-user-id': userId,
    'Content-Type': 'application/json'
  };
};

export const inventoryService = {
  getAll: () => fetch('/api/inventory', { headers: getHeaders() }).then(res => res.json()),
};

export const procedureService = {
  getAll: () => fetch('/api/procedures', { headers: getHeaders() }).then(res => res.json()),
};

export const patientService = {
  getAll: () => fetch('/api/patients', { headers: getHeaders() }).then(res => res.json()),
};

// Este objeto Services (no plural) é o que o seu Dashboard e Patients.tsx usam
export const Services = {
  patients: patientService,
  inventory: inventoryService,
  procedures: procedureService
};
