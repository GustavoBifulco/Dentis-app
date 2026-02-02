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
        return res.json();
    }
};