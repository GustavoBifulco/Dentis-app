import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientForm from './PatientForm';

interface NewPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create');
            }

            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Novo Paciente</h2>
                            <p className="text-gray-500 text-sm">Preencha o cadastro completo.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 text-center text-sm font-bold">{error}</div>}

                    <div className="flex-1 overflow-hidden">
                        <PatientForm mode="create" onSubmit={handleSubmit} loading={loading} />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NewPatientModal;
