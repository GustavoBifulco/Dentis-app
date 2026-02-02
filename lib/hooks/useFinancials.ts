import { useState, useEffect } from 'react';
import { FinancialSummary, Payment } from '../../types';

interface UseFinancialsParams {
    patientId: number | null;
}

interface UseFinancialsReturn extends FinancialSummary {
    isLoading: boolean;
    error: Error | null;
}

export const useFinancials = ({ patientId }: UseFinancialsParams): UseFinancialsReturn => {
    const [financialData, setFinancialData] = useState<FinancialSummary>({
        totalContracted: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        paymentHistory: [],
        pendingPayments: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!patientId) {
            setFinancialData({
                totalContracted: 0,
                totalPaid: 0,
                outstandingBalance: 0,
                paymentHistory: [],
                pendingPayments: []
            });
            setIsLoading(false);
            return;
        }

        const fetchFinancials = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/financials/patient/${patientId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch financial data');
                }

                const data = await response.json();

                // Separate payments by status
                const allPayments: Payment[] = data.payments || [];
                const paymentHistory = allPayments.filter(p => p.status === 'paid');
                const pendingPayments = allPayments.filter(p => p.status === 'pending' || p.status === 'overdue');

                // Calculate totals
                const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
                const totalContracted = data.totalContracted || (totalPaid + pendingPayments.reduce((sum, p) => sum + p.amount, 0));
                const outstandingBalance = totalContracted - totalPaid;

                setFinancialData({
                    totalContracted,
                    totalPaid,
                    outstandingBalance,
                    paymentHistory,
                    pendingPayments
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching financials:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                // Keep default empty state on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinancials();
    }, [patientId]);

    return {
        ...financialData,
        isLoading,
        error
    };
};
