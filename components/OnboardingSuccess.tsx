import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { completeOnboarding } from '../lib/api';
import SetupWizard from './SetupWizard';

interface OnboardingSuccessProps {
    onComplete: () => void;
}

export default function OnboardingSuccess({ onComplete }: OnboardingSuccessProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function finalize() {
            if (!user) return;

            const savedData = localStorage.getItem('pending_onboarding_data');
            if (!savedData) {
                setError("Dados de cadastro não encontrados. Por favor, contate o suporte.");
                setLoading(false);
                return;
            }

            try {
                const data = JSON.parse(savedData);
                await completeOnboarding({
                    userId: user.id,
                    name: user.fullName || '',
                    role: data.role,
                    cpf: data.cpf,
                    phone: data.phone,
                    cro: data.cro,
                });

                // Limpa após sucesso
                localStorage.removeItem('pending_onboarding_data');
                setLoading(false);
            } catch (err: any) {
                setError(err.message || "Erro ao finalizar o cadastro.");
                setLoading(false);
            }
        }

        finalize();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-slate-900">Finalizando seu cadastro...</h2>
                    <p className="text-slate-500">Estamos preparando seu ambiente.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Ops!</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    return <SetupWizard onComplete={onComplete} />;
}
