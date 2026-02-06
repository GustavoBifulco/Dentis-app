import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Download,
    CreditCard,
    Clock,
    CheckCircle2,
    ChevronRight,
    ArrowUpRight,
    FileText,
    Loader2,
    ExternalLink,
    Shield
} from 'lucide-react';
import { usePatientFinancials } from '../lib/hooks/usePatientFinancials';
import { useAuth } from '@clerk/clerk-react';
import { LuxButton } from './Shared';

interface PatientWalletProps {
    onBack?: () => void;
    patientId?: number;
    clinicId?: string;
}

export default function PatientWallet({ onBack, patientId, clinicId }: PatientWalletProps) {
    const { financials, loading, error } = usePatientFinancials();
    const { getToken } = useAuth();
    const [stripeStatus, setStripeStatus] = useState<any>(null);
    const [loadingStripe, setLoadingStripe] = useState(false);

    useEffect(() => {
        if (clinicId) {
            fetchStripeStatus();
        }
    }, [clinicId]);

    const fetchStripeStatus = async () => {
        setLoadingStripe(true);
        try {
            const token = await getToken();
            const res = await fetch('/api/stripe-connect/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStripeStatus(data);
            }
        } catch (e) {
            console.error('Failed to fetch Stripe status');
        } finally {
            setLoadingStripe(false);
        }
    };

    const handlePayment = async (amount: string, description: string, financialId?: string) => {
        if (!stripeStatus?.hasAccount || !stripeStatus?.chargesEnabled) {
            alert('Sistema de pagamentos não configurado. Entre em contato com a clínica.');
            return;
        }

        try {
            const token = await getToken();
            const res = await fetch('/api/stripe-connect/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Math.round(Number(amount) * 100), // Convert to cents
                    description,
                    metadata: {
                        patientId: patientId?.toString(),
                        financialId: financialId || ''
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.open(data.url, '_blank');
                }
            } else {
                alert('Erro ao criar link de pagamento. Tente novamente.');
            }
        } catch (e) {
            console.error('Payment error:', e);
            alert('Erro ao processar pagamento.');
        }
    };

    const downloadInvoice = (id: string) => {
        alert(`Baixando NF-e #${id} (Funcionalidade em desenvolvimento)`);
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4" style={{ color: 'hsl(var(--text-muted))' }}>
                <Loader2 className="animate-spin" size={40} style={{ color: 'hsl(var(--primary))' }} />
                <p className="font-bold text-sm uppercase tracking-widest">Sincronizando Carteira...</p>
            </div>
        );
    }

    const totalDebt = financials
        .filter(f => f.status === 'PENDING')
        .reduce((sum, f) => sum + Number(f.amount), 0);

    const totalPaid = financials
        .filter(f => f.status === 'PAID')
        .reduce((sum, f) => sum + Number(f.amount), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-0">
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all"
                    style={{ color: 'hsl(var(--text-secondary))' }}
                >
                    <ChevronRight className="rotate-180" size={14} /> Voltar
                </button>
            )}

            {/* Wallet Header Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-[32px] p-8 relative overflow-hidden shadow-2xl"
                style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--violet-hint)) 100%)',
                    color: 'white'
                }}
            >
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                        <CreditCard size={32} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Seu Saldo em Aberto</p>
                    <h2 className="text-5xl font-light mb-2">
                        R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs opacity-60 mb-8">
                        Total pago: R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    {stripeStatus?.hasAccount && stripeStatus?.chargesEnabled ? (
                        <LuxButton
                            variant="primary"
                            size="lg"
                            disabled={totalDebt === 0}
                            onClick={() => handlePayment(totalDebt.toString(), "Pagamento Pendente")}
                            className="bg-white text-primary hover:scale-105 shadow-xl"
                        >
                            {totalDebt > 0 ? 'Pagar Saldo Total' : 'Tudo em Dia'}
                        </LuxButton>
                    ) : (
                        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                            <Shield size={16} />
                            <span className="text-xs font-bold">Pagamentos em configuração</span>
                        </div>
                    )}
                </div>

                {/* Abstract Visuals */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
            </motion.div>

            {/* Transaction List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-lg" style={{ color: 'hsl(var(--text-main))' }}>
                        Histórico Financeiro
                    </h3>
                    <button className="text-xs font-bold flex items-center gap-1 uppercase tracking-wider" style={{ color: 'hsl(var(--primary))' }}>
                        Filtrar <ChevronRight size={14} />
                    </button>
                </div>

                <div className="space-y-3">
                    {financials.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-5 rounded-3xl flex items-center justify-between group hover:shadow-md transition-all"
                            style={{ border: '1px solid hsl(var(--border))' }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{
                                        backgroundColor: item.status === 'PAID' ? 'hsl(var(--success-bg))' : 'hsl(var(--warning-bg))',
                                        color: item.status === 'PAID' ? 'hsl(var(--success))' : 'hsl(var(--warning))'
                                    }}
                                >
                                    {item.status === 'PAID' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm" style={{ color: 'hsl(var(--text-main))' }}>
                                        {item.description || 'Tratamento'}
                                    </h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'hsl(var(--text-muted))' }}>
                                        {new Date(item.dueDate || item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className="font-black text-sm" style={{ color: 'hsl(var(--text-main))' }}>
                                        R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <button
                                        onClick={() => downloadInvoice(item.id)}
                                        className="text-[10px] font-bold flex items-center gap-1 mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: 'hsl(var(--primary))' }}
                                    >
                                        NF-e <Download size={10} />
                                    </button>
                                </div>
                                {item.status === 'PENDING' && stripeStatus?.chargesEnabled && (
                                    <button
                                        onClick={() => handlePayment(item.amount, item.description, item.id)}
                                        className="p-2 rounded-xl transition-all hover:scale-110 shadow-lg"
                                        style={{
                                            backgroundColor: 'hsl(var(--primary))',
                                            color: 'white'
                                        }}
                                    >
                                        <ArrowUpRight size={18} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {financials.length === 0 && (
                        <div className="text-center py-12 rounded-[32px] border-2 border-dashed" style={{
                            backgroundColor: 'hsl(var(--muted))',
                            borderColor: 'hsl(var(--border))'
                        }}>
                            <FileText size={48} className="mx-auto mb-4" style={{ color: 'hsl(var(--text-muted))' }} />
                            <p className="font-bold" style={{ color: 'hsl(var(--text-muted))' }}>
                                Nenhum registro financeiro encontrado.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
