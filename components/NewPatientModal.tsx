import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
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
                body: JSON.stringify({ name: name.trim() })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Failed to create patient:", result);
                throw new Error(result.error || 'Falha ao criar paciente. Verifique os dados.');
            }

            // Success - reset and close
            setName('');
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
        setName('');
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
                    className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <User size={16} className="inline mr-2" />
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Digite o nome completo do paciente"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-xs text-blue-700">
                                <strong>💡 Dica:</strong> Após criar o paciente, você poderá editar o prontuário
                                para adicionar telefone, email, documentos e outras informações.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Criar Paciente'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NewPatientModal;
