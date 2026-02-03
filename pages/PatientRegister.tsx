import React, { useEffect, useState } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

const PatientRegister: React.FC = () => {
    // Extract token from URL path
    const token = window.location.pathname.split('/register/')[1];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [prefilledData, setPrefilledData] = useState<any>(null);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token de convite inválido');
            setLoading(false);
            return;
        }

        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await fetch(`/api/patient-invite/${token}`);
            const data = await response.json();

            if (!response.ok) {
                if (data.expired) {
                    setError('Este convite expirou. Solicite um novo convite ao seu dentista.');
                } else if (data.used) {
                    setError('Este convite já foi utilizado.');
                } else {
                    setError(data.error || 'Convite inválido');
                }
                setLoading(false);
                return;
            }

            setPrefilledData(data.prefilledData);
            setLoading(false);

        } catch (err: any) {
            setError('Erro ao validar convite. Tente novamente.');
            setLoading(false);
        }
    };

    const handleSignUpComplete = async (clerkUserId: string) => {
        if (!token) return;

        setRegistering(true);

        try {
            const response = await fetch(`/api/patient-invite/${token}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerkUserId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to link account');
            }

            // Redirect to patient portal
            window.location.href = '/patient/dashboard';

        } catch (err: any) {
            setError('Erro ao criar conta. Tente novamente.');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader size={48} className="text-lux-accent animate-spin mx-auto mb-4" />
                    <p className="text-lux-text-secondary">Validando convite...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle size={64} className="text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-lux-text mb-2">Convite Inválido</h1>
                    <p className="text-lux-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 rounded-xl font-bold bg-lux-accent text-white hover:bg-opacity-90 transition"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    if (registering) {
        return (
            <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader size={48} className="text-lux-accent animate-spin mx-auto mb-4" />
                    <p className="text-lux-text-secondary">Finalizando cadastro...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Welcome Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
                    <CheckCircle size={64} className="text-emerald-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-black text-lux-text mb-2">
                        Bem-vindo, {prefilledData?.name}!
                    </h1>
                    <p className="text-lux-text-secondary">
                        Seu dentista te convidou para acessar o portal do paciente.
                        Complete seu cadastro abaixo para começar.
                    </p>
                </div>

                {/* Pre-filled Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                    <p className="text-sm font-bold text-blue-900 mb-3">📋 Seus Dados</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {prefilledData?.name && (
                            <div>
                                <p className="text-blue-700 font-medium">Nome</p>
                                <p className="text-blue-900 font-bold">{prefilledData.name}</p>
                            </div>
                        )}
                        {prefilledData?.email && (
                            <div>
                                <p className="text-blue-700 font-medium">Email</p>
                                <p className="text-blue-900 font-bold">{prefilledData.email}</p>
                            </div>
                        )}
                        {prefilledData?.phone && (
                            <div>
                                <p className="text-blue-700 font-medium">Telefone</p>
                                <p className="text-blue-900 font-bold">{prefilledData.phone}</p>
                            </div>
                        )}
                        {prefilledData?.cpf && (
                            <div>
                                <p className="text-blue-700 font-medium">CPF</p>
                                <p className="text-blue-900 font-bold">{prefilledData.cpf}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Clerk SignUp */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: 'w-full',
                                card: 'shadow-none',
                            },
                        }}
                        initialValues={{
                            emailAddress: prefilledData?.email || '',
                            firstName: prefilledData?.name?.split(' ')[0] || '',
                            lastName: prefilledData?.name?.split(' ').slice(1).join(' ') || '',
                        }}
                        unsafeMetadata={{
                            patientId: prefilledData?.patientId,
                            invitationToken: token,
                            role: 'patient',
                        }}
                        afterSignUpUrl="/patient/dashboard"
                        redirectUrl="/patient/dashboard"
                    />
                </div>

                <p className="text-center text-xs text-lux-text-secondary mt-6">
                    Ao criar sua conta, você concorda com nossos Termos de Uso e Política de Privacidade.
                </p>
            </div>
        </div>
    );
};

export default PatientRegister;
