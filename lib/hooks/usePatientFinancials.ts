import { useState, useEffect } from 'react';

export function usePatientFinancials() {
    const [financials, setFinancials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFinancials = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/billing/charges');
            const data = await res.json();
            if (data) {
                setFinancials(data);
            }
        } catch (err) {
            setError('Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, []);

    return { financials, loading, error, refetch: fetchFinancials };
}
