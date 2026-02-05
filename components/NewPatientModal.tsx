import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X, User } from 'lucide-react';
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

    const handleSubmitData = async (data: any) => {
        if (!data.name?.trim()) {
            setError('Nome é obrigatório');
            return;
        }

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

            const result = await response.json();

            if (!response.ok) {
                console.error("Failed to create patient:", result);
                throw new Error(result.error || 'Falha ao criar paciente. Verifique os dados.');
            }

            // Success - reset and close
            onSuccess();
            onClose();
        } catch (e: any) {
            console.error("Create patient error:", e);
            setError(e.message || "Erro desconhecido ao criar paciente.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
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
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Cadastrar Paciente</h2>
                            <p className="text-gray-500 text-sm mt-1">Cadastro rápido - apenas o nome é obrigatório</p>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Footer - Using same wrapper as PatientForm or just matching style if needed, 
                        but PatientForm already has its own footer for Save button. 
                        Let's use PatientForm directly in a scrollable container. */}
                    <div className="flex-1 overflow-hidden">
                        {error && (
                            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <PatientForm
                            mode="create"
                            onSubmit={handleSubmitData}
                            loading={loading}
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NewPatientModal;
