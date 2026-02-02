import { useState, useEffect } from 'react';
import { TreatmentPhase } from '../../types';

interface UseTreatmentProgressParams {
    patientId: number | null;
}

interface UseTreatmentProgressReturn {
    phases: TreatmentPhase[];
    currentPhase: TreatmentPhase | null;
    overallProgress: number;
    isLoading: boolean;
    error: Error | null;
}

export const useTreatmentProgress = ({ patientId }: UseTreatmentProgressParams): UseTreatmentProgressReturn => {
    const [phases, setPhases] = useState<TreatmentPhase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!patientId) {
            setPhases([]);
            setIsLoading(false);
            return;
        }

        const fetchTreatmentProgress = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/treatment/progress/${patientId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch treatment progress');
                }

                const data = await response.json();
                setPhases(data.phases || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching treatment progress:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setPhases([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreatmentProgress();
    }, [patientId]);

    // Find current active phase
    const currentPhase = phases.find(p => p.status === 'current') || null;

    // Calculate overall progress percentage
    const overallProgress = phases.length > 0
        ? Math.round((phases.filter(p => p.status === 'completed').length / phases.length) * 100)
        : 0;

    return {
        phases,
        currentPhase,
        overallProgress,
        isLoading,
        error
    };
};
