const API_URL = '/api';

export const api = {
    get: async (endpoint: string, token: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Falha na requisição');
        return res.json();
    },
    post: async (endpoint: string, data: any, token: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Falha na requisição post');
        return res.json();
    },
    patch: async (endpoint: string, data: any, token: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Falha na requisição patch');
        return res.json();
    },
    delete: async (endpoint: string, token: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Falha na requisição delete');
        return res.json();
    }
};

/**
 * Função exigida pelo componente Onboarding.tsx
 * Adicionada para corrigir o erro de build no Coolify
 */
export const completeOnboarding = async (data: any, token: string) => {
    return api.post('/onboarding/complete', data, token);
};