import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { UserPlus, Copy, Check, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuxButton } from './Shared';

interface PatientInviteButtonProps {
    patientId: number;
    patientName: string;
    hasAccount?: boolean;
    label?: string;
    variant?: 'primary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

const PatientInviteButton: React.FC<PatientInviteButtonProps> = ({
    patientId,
    patientName,
    hasAccount = false,
    label = 'Convidar',
    variant = 'primary',
    size = 'md'
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
                if (data.hasAccount) {
                    setError('Paciente já possui conta.');
                } else {
                    throw new Error(data.error || 'Failed to create invitation');
                }
                return;
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
        return null; // As per user request: "se a pessoa ja tiver conta esse botão some"
        // Previous implementation showed a disabled button. User explicitly asked for it to disappear.
    }

    return (
        <>
            <LuxButton
                onClick={handleOpenModal}
                variant={variant}
                size={size}
                icon={<UserPlus size={size === 'sm' ? 16 : 18} />}
            >
                {label}
            </LuxButton>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                            style={{ border: '1px solid hsl(var(--border))' }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between" style={{ borderColor: 'hsl(var(--border))' }}>
                                <div>
                                    <h2 className="text-2xl font-black" style={{ color: 'hsl(var(--text-main))' }}>Convidar Paciente</h2>
                                    <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-muted))' }}>{patientName}</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                                    style={{ color: 'hsl(var(--text-muted))' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Loader size={48} className="animate-spin mb-4" style={{ color: 'hsl(var(--primary))' }} />
                                        <p style={{ color: 'hsl(var(--text-muted))' }}>Gerando link de convite...</p>
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

                                        <div className="bg-gray-50 rounded-xl p-4" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                                            <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>
                                                Link de Convite
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={invitationLink}
                                                    readOnly
                                                    className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm font-mono"
                                                    style={{
                                                        borderColor: 'hsl(var(--border))',
                                                        color: 'hsl(var(--text-main))'
                                                    }}
                                                />
                                                <div onClick={handleCopyLink} className="cursor-pointer">
                                                    <LuxButton
                                                        variant={copied ? "primary" : "outline"}
                                                        size="sm"
                                                        icon={copied ? <Check size={16} /> : <Copy size={16} />}
                                                    >
                                                        {copied ? "Copiado!" : "Copiar"}
                                                    </LuxButton>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {invitationLink && (
                                <div className="p-6 border-t border-gray-100 flex justify-end" style={{ borderColor: 'hsl(var(--border))' }}>
                                    <LuxButton onClick={handleClose} variant="primary">
                                        Fechar
                                    </LuxButton>
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
