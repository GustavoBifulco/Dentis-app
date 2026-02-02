const API_URL = '/api';

// Objeto para manter compatibilidade com lib/services.ts
export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error('Erro na requisição');
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro na requisição');
    return res.json();
  }
};

// Função usada pelo Onboarding
export async function completeOnboarding(data: any) {
  console.log("📡 Enviando onboarding para o servidor...", data);
  const response = await fetch(`${API_URL}/onboarding/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro no servidor');
  }
  
  return response.json();
}
