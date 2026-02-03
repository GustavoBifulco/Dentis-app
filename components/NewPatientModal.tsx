import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X, Upload, User, Calendar, Phone, MapPin, FileText, UserPlus, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { getToken } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        birthDate: '',
        phone: '',
        email: '',
        address: '',
        guardianName: '',
        guardianPhone: '',
        notes: '',
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sendInvite, setSendInvite] = useState(false);

    // Calculate age from birth date
    const isMinor = () => {
        if (!formData.birthDate) return false;
        const today = new Date();
        const birthDate = new Date(formData.birthDate);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 < 18;
        }
        return age < 18;
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            // Create patient
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    status: 'active',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create patient');
            }

            // If send invite is checked and patient has email
            if (sendInvite && formData.email) {
                try {
                    await fetch('/api/patient-invite/create', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ patientId: data.id }),
                    });
                } catch (inviteError) {
                    console.error('Failed to send invite:', inviteError);
                    // Don't fail the whole operation if invite fails
                }
            }

            onSuccess();
            handleClose();

        } catch (err: any) {
            setError(err.message || 'Erro ao criar paciente');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            cpf: '',
            birthDate: '',
            phone: '',
            email: '',
            address: '',
            guardianName: '',
            guardianPhone: '',
            notes: '',
        });
        setPhoto(null);
        setPhotoPreview(null);
        setError(null);
        setSendInvite(false);
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
                    className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-lux-border flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div>
                            <h2 className="text-2xl font-black text-lux-text">Novo Paciente</h2>
                            <p className="text-sm text-lux-text-secondary mt-1">
                                Preencha os dados básicos. Apenas o nome é obrigatório.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-white hover:bg-lux-subtle transition flex items-center justify-center shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        <div className="space-y-6">
                            {/* Photo Upload */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-2xl bg-lux-subtle border-2 border-dashed border-lux-border overflow-hidden flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-lux-text-secondary" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-xl cursor-pointer hover:bg-blue-700 transition shadow-lg"
                                    >
                                        <Upload size={16} />
                                    </label>
                                </div>
                            </div>

                            {/* Name - Required */}
                            <div>
                                <label className="block text-sm font-bold text-lux-text mb-2">
                                    Nome Completo <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                    placeholder="Ex: João Silva Santos"
                                    required
                                />
                            </div>

                            {/* CPF and Birth Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">CPF</label>
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Guardian Info (if minor) */}
                            {isMinor() && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-4">
                                    <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                        <UserPlus size={16} />
                                        Paciente Menor de Idade - Dados do Responsável
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-amber-900 mb-2">
                                                Nome do Responsável
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.guardianName}
                                                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none transition bg-white"
                                                placeholder="Nome completo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-amber-900 mb-2">
                                                Telefone do Responsável
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.guardianPhone}
                                                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none transition bg-white"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Telefone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-bold text-lux-text mb-2">Endereço</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                    placeholder="Rua, número, bairro, cidade"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-lux-text mb-2">
                                    Observações
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                                    rows={3}
                                    placeholder="Alergias, condições médicas, preferências..."
                                />
                            </div>

                            {/* Send Invite Option */}
                            {formData.email && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={sendInvite}
                                            onChange={(e) => setSendInvite(e.target.checked)}
                                            className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">
                                                Enviar convite para criar conta
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                O paciente receberá um link para completar o cadastro
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm font-bold text-red-900">{error}</p>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-lux-border flex gap-3 justify-end bg-lux-subtle">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 rounded-xl font-bold text-lux-text hover:bg-lux-border transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.name.trim()}
                            className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Criar Paciente
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NewPatientModal;
