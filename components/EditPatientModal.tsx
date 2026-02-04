import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, MapPin, Phone, Mail, Calendar, FileText, AlertTriangle, Pill } from 'lucide-react';
import { Patient } from '../types';
import { LuxButton } from './Shared';
import { useAuth } from '@clerk/clerk-react';

interface EditPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    onSave: (updatedPatient: Patient) => void;
}

const InputField = ({ label, icon: Icon, value, onChange, disabled = false, type = "text", placeholder = "" }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-xl border ${disabled ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} outline-none transition-all font-medium`}
        />
    </div>
);

const TextAreaField = ({ label, icon: Icon, value, onChange, placeholder = "" }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none"
        />
    </div>
);

const EditPatientModal: React.FC<EditPatientModalProps> = ({ isOpen, onClose, patient, onSave }) => {
    const { getToken } = useAuth();
    const [formData, setFormData] = useState<Partial<Patient>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && patient) {
            setFormData({ ...patient });
            setError(null);
        }
    }, [isOpen, patient]);

    const handleChange = (field: keyof Patient, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            const response = await fetch(`/api/patients/${patient.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar perfil');
            }

            const updated = await response.json();
            onSave(updated);
            onClose();
        } catch (err) {
            console.error(err);
            setError('Erro ao salvar alterações. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Editar Perfil do Paciente</h2>
                                    <p className="text-slate-500 text-sm font-medium">Atualize as informações cadastrais e clínicas.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                                        <AlertTriangle size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Personal Data */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                                            <User className="text-blue-600" size={20} />
                                            <h3 className="font-bold text-slate-900">Dados Pessoais</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <InputField
                                                label="Nome Completo"
                                                icon={User}
                                                value={formData.name}
                                                onChange={(v: string) => handleChange('name', v)}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="CPF (Imutável)"
                                                    icon={FileText}
                                                    value={formData.cpf}
                                                    disabled={true}
                                                    onChange={() => { }}
                                                />
                                                <InputField
                                                    label="Data de Nascimento"
                                                    icon={Calendar}
                                                    value={formData.birthdate} // Assuming text or date string format
                                                    type="date"
                                                    onChange={(v: string) => handleChange('birthdate', v)} // Handle date formatting if needed
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Email"
                                                    icon={Mail}
                                                    value={formData.email}
                                                    type="email"
                                                    onChange={(v: string) => handleChange('email', v)}
                                                />
                                                <InputField
                                                    label="Telefone"
                                                    icon={Phone}
                                                    value={formData.phone}
                                                    onChange={(v: string) => handleChange('phone', v)}
                                                />
                                            </div>

                                            <InputField
                                                label="Endereço"
                                                icon={MapPin}
                                                value={formData.address}
                                                onChange={(v: string) => handleChange('address', v)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <FileText className="text-blue-600 mt-1" size={20} />
                                            <div>
                                                <h3 className="font-bold text-blue-900 text-sm">Dados Clínicos (Anamnese)</h3>
                                                <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                                                    O histórico médico, alergias e medicamentos agora são gerenciados na aba <strong>Anamnese</strong> do prontuário para manter um histórico detalhado e dinâmico.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                                <LuxButton variant="ghost" onClick={onClose}>Cancelar</LuxButton>
                                <LuxButton
                                    onClick={handleSubmit}
                                    icon={loading ? undefined : <Save size={18} />}
                                    disabled={loading}
                                    className={`${loading ? 'opacity-70' : ''}`}
                                >
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </LuxButton>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditPatientModal;
