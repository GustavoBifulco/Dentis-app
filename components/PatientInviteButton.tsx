import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { UserPlus, Copy, Check, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatientInviteButtonProps {
    patientId: number;
    patientName: string;
    hasAccount?: boolean;
}

const PatientInviteButton: React.FC<PatientInviteButtonProps> = ({
    patientId,
    patientName,
    hasAccount = false
}) => {
    const { getToken } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invitationLink, setInvitationLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateInvite = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch('/api/patient-invite/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ patientId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create invitation');
            }

            setInvitationLink(data.invitationLink);

        } catch (err: any) {
            setError(err.message || 'Failed to generate invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!invitationLink) return;

        try {
            await navigator.clipboard.writeText(invitationLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError('Failed to copy link');
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
        setInvitationLink(null);
        setError(null);
        setCopied(false);
        handleGenerateInvite();
    };

    const handleClose = () => {
        setShowModal(false);
        setInvitationLink(null);
        setError(null);
        setCopied(false);
    };

    if (hasAccount) {
        return (
            <button
                disabled
                className="px-4 py-2 rounded-xl font-bold text-lux-text-secondary bg-lux-subtle cursor-not-allowed flex items-center gap-2"
            >
                <Check size={18} />
                Conta Criada
            </button>
        );
    }

    return (
        <>
            <button
                onClick={handleOpenModal}
                className="px-4 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
                <UserPlus size={18} />
                Convidar
            </button>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-lux-border flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-lux-text">Convidar Paciente</h2>
                                    <p className="text-sm text-lux-text-secondary mt-1">{patientName}</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 rounded-full bg-lux-subtle hover:bg-lux-border transition flex items-center justify-center"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Loader size={48} className="text-blue-600 animate-spin mb-4" />
                                        <p className="text-lux-text-secondary">Gerando link de convite...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-sm font-bold text-red-900">{error}</p>
                                    </div>
                                )}

                                {invitationLink && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-sm font-bold text-blue-900 mb-2">✅ Link Gerado!</p>
                                            <p className="text-xs text-blue-700">
                                                Envie este link para o paciente via WhatsApp, Email ou SMS.
                                                Válido por 7 dias.
                                            </p>
                                        </div>

                                        <div className="bg-lux-subtle rounded-xl p-4">
                                            <p className="text-xs font-bold text-lux-text-secondary mb-2 uppercase tracking-wide">
                                                Link de Convite
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={invitationLink}
                                                    readOnly
                                                    className="flex-1 bg-white border border-lux-border rounded-lg px-3 py-2 text-sm font-mono text-lux-text"
                                                />
                                                <button
                                                    onClick={handleCopyLink}
                                                    className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${copied
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {copied ? (
                                                        <>
                                                            <Check size={18} />
                                                            Copiado!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={18} />
                                                            Copiar
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-lux-subtle rounded-xl p-4">
                                            <p className="text-xs text-lux-text-secondary">
                                                💡 <strong>Como funciona:</strong> O paciente clicará no link,
                                                verá seus dados pré-preenchidos e criará sua senha para acessar
                                                o portal do paciente.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {invitationLink && (
                                <div className="p-6 border-t border-lux-border flex justify-end">
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-3 rounded-xl font-bold bg-lux-accent text-white hover:bg-opacity-90 transition"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PatientInviteButton;
