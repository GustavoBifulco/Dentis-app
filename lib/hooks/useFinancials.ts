import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { FinancialSummary, Payment } from '../../types';

export const useFinancials = ({ patientId }: { patientId: number | null }) => {
    const { getToken } = useAuth();
    const [rawData, setRawData] = useState<FinancialSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFinancials = async () => {
            if (!patientId) {
                setRawData(null); setIsLoading(false); return;
            }
            try {
                setIsLoading(true);
                const token = await getToken();
                // Tenta fetch real, se falhar loga e para (segurança)
                try {
                    const res = await fetch(`/api/financials/patient/${patientId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setRawData(data);
                    }
                } catch(e) { console.warn("Erro no fetch financeiro"); }
            } finally {
                setIsLoading(false);
            }
        };
        fetchFinancials();
    }, [patientId, getToken]);

    // Otimização: Memoização para evitar re-render desnecessário
    const stats = useMemo(() => {
        if (!rawData) return { totalPaid: 0, outstandingBalance: 0, totalContracted: 0 };
        return rawData;
    }, [rawData]);

    return { ...stats, isLoading, financialData: rawData };
};