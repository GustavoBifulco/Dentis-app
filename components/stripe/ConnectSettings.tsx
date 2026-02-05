import React, { useState, useEffect } from 'react';
import { IslandCard, LuxButton, LoadingState } from '../Shared';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, CreditCard } from "lucide-react";
import { useAppContext } from '../../lib/useAppContext';

interface AccountStatus {
    status: 'not_created' | 'pending' | 'verified';
    charges_enabled: boolean;
    payouts_enabled: boolean;
    requirements?: {
        currently_due: string[];
    };
}

export function ConnectSettings() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<AccountStatus | null>(null);
    const { showToast } = useAppContext();

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/stripe-connect/status');
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleCreateAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe-connect/accounts', { method: 'POST' });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Now get onboarding link
            const linkRes = await fetch('/api/stripe-connect/onboarding', { method: 'POST' });
            const linkData = await linkRes.json();

            if (linkData.url) {
                window.location.href = linkData.url;
            }
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResumeOnboarding = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe-connect/onboarding', { method: 'POST' });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!status) {
        return <LoadingState message="Verificando status do Stripe..." />;
    }

    return (
        <IslandCard className="p-6 bg-slate-950/50 backdrop-blur-sm border-cyan-500/20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-cyan-400" />
                        Stripe Connect Marketplace
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Receba pagamentos diretamente de seus pacientes.
                    </p>
                </div>
                <div>
                    {status.status === 'verified' ? (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ativo
                        </span>
                    ) : status.status === 'pending' ? (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Pendente
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Inativo
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {status.status === 'not_created' && (
                    <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-6 text-center">
                        <p className="text-slate-300 mb-6 text-sm max-w-sm mx-auto">
                            Ao conectar sua conta, o Dentis OS poderá facilitar pagamentos diretos entre você e seus pacientes.
                        </p>
                        <LuxButton
                            onClick={handleCreateAccount}
                            loading={loading}
                            icon={<ExternalLink size={18} />}
                            className="bg-cyan-600 hover:bg-cyan-500"
                        >
                            Configurar Recebimentos
                        </LuxButton>
                    </div>
                )}

                {status.status === 'pending' && (
                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-6">
                        <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> Ação Necessária
                        </h4>
                        <p className="text-slate-300 mb-4 text-xs">
                            Sua conta Stripe Connect precisa ser verificada.
                        </p>
                        <LuxButton
                            onClick={handleResumeOnboarding}
                            loading={loading}
                            variant="outline"
                            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                        >
                            Continuar Verificação
                        </LuxButton>
                    </div>
                )}

                {status.status === 'verified' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cobranças</span>
                            <div className="flex items-center gap-2 mt-1">
                                {status.charges_enabled ? (
                                    <span className="text-emerald-400 text-sm font-semibold">Habilitadas</span>
                                ) : (
                                    <span className="text-rose-400 text-sm font-semibold">Desabilitadas</span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Saques</span>
                            <div className="flex items-center gap-2 mt-1">
                                {status.payouts_enabled ? (
                                    <span className="text-emerald-400 text-sm font-semibold">Habilitados</span>
                                ) : (
                                    <span className="text-rose-400 text-sm font-semibold">Desabilitados</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-[10px] text-slate-500 text-center italic opacity-50">
                    Processado por Stripe Connect.
                </p>
            </div>
        </IslandCard>
    );
}
