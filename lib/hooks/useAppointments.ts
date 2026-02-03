import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Appointment } from '../../types';

export const useAppointments = ({ patientId }: { patientId: number | null }) => {
    const { getToken } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
                const response = await fetch(`/api/appointments${patientId ? `?patientId=${patientId}` : ''}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Erro ao carregar agenda');
                const data = await response.json();
                setAppointments(data.appointments || []);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Erro de conexão'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, [patientId, getToken]);

    const nextAppointment = appointments.find(a => new Date(a.startTime) > new Date()) || null;

    return { appointments, nextAppointment, isLoading, error };
};