import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Prescription } from '../../types';

export const usePrescriptions = ({ patientId }: { patientId: number | null }) => {
    const { getToken } = useAuth();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            if (!patientId) return;
            try {
                const token = await getToken();
                const res = await fetch(`/api/prescriptions?patientId=${patientId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setPrescriptions(data.prescriptions || []);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrescriptions();
    }, [patientId, getToken]);

    const activePrescriptions = prescriptions.filter(p => p.isActive);

    return { prescriptions, activePrescriptions, isLoading };
};