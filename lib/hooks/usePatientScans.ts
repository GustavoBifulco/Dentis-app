import { useState, useEffect } from 'react';

export function usePatientScans() {
    const [scans, setScans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const res = await fetch('/api/patient/scans');
                const data = await res.json();
                if (data.scans) setScans(data.scans);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchScans();
    }, []);

    return { scans, loading };
}
