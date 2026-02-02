import { useState, useEffect } from 'react';
import { Appointment } from '../../types';

interface UseAppointmentsParams {
    patientId: number | null;
}

interface UseAppointmentsReturn {
    appointments: Appointment[];
    nextAppointment: Appointment | null;
    isLoading: boolean;
    error: Error | null;
}

export const useAppointments = ({ patientId }: UseAppointmentsParams): UseAppointmentsReturn => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!patientId) {
            setAppointments([]);
            setIsLoading(false);
            return;
        }

        const fetchAppointments = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/appointments?patientId=${patientId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const data = await response.json();
                setAppointments(data.appointments || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setAppointments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [patientId]);

    // Find next upcoming appointment
    const nextAppointment = appointments.length > 0
        ? appointments
            .filter(apt => new Date(apt.startTime) > new Date())
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null
        : null;

    return {
        appointments,
        nextAppointment,
        isLoading,
        error
    };
};
