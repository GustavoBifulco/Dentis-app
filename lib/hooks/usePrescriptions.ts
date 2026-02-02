import { useState, useEffect } from 'react';
import { Prescription } from '../../types';

interface UsePrescriptionsParams {
    patientId: number | null;
}

interface UsePrescriptionsReturn {
    prescriptions: Prescription[];
    activePrescriptions: Prescription[];
    isLoading: boolean;
    error: Error | null;
}

export const usePrescriptions = ({ patientId }: UsePrescriptionsParams): UsePrescriptionsReturn => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!patientId) {
            setPrescriptions([]);
            setIsLoading(false);
            return;
        }

        const fetchPrescriptions = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/prescriptions?patientId=${patientId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch prescriptions');
                }

                const data = await response.json();
                setPrescriptions(data.prescriptions || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching prescriptions:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setPrescriptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescriptions();
    }, [patientId]);

    // Filter for active (non-expired) prescriptions
    const activePrescriptions = prescriptions.filter(p => {
        if (!p.isActive) return false;
        const expiryDate = new Date(p.expiryDate);
        return expiryDate > new Date();
    });

    return {
        prescriptions,
        activePrescriptions,
        isLoading,
        error
    };
};
