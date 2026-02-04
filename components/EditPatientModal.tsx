import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Patient } from '../types';
import PatientForm from './PatientForm';

interface EditPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    onSave: (updatedPatient: Patient) => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({ isOpen, onClose, patient, onSave }) => {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`/api/patients/${patient.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update');
            }

            const updated = await response.json();
            onSave(updated);
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
                            <h2 className="text-2xl font-black text-gray-900">Editar Paciente</h2>
                            <p className="text-gray-500 text-sm">Atualize os dados cadastrais.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 text-center text-sm font-bold">{error}</div>}

                    <div className="flex-1 overflow-hidden">
                        <PatientForm
                            mode="edit"
                            onSubmit={handleSubmit}
                            loading={loading}
                            initialData={patient}
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditPatientModal;
