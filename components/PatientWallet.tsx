import React from 'react';
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
    Loader2
} from 'lucide-react';
import { usePatientFinancials } from '../lib/hooks/usePatientFinancials';

interface PatientWalletProps {
    onBack?: () => void;
}

export default function PatientWallet({ onBack }: PatientWalletProps) {
    const { financials, loading, error } = usePatientFinancials();

    const handlePayment = (amount: string, description: string) => {
        // Redirect to mock checkout route or Stripe
        window.location.href = `/api/checkout?amount=${amount}&description=${description}`;
    };

    const downloadInvoice = (id: string) => {
        alert(`Baixando NF-e #${id} (Simulado)`);
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="animate-spin text-lux-accent" size={40} />
                <p className="font-bold text-sm uppercase tracking-widest">Sincronizando Carteira...</p>
            </div>
        );
    }

    const totalDebt = financials
        .filter(f => f.status === 'PENDING')
        .reduce((sum, f) => sum + Number(f.amount), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-0">
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-lux-text-secondary hover:text-lux-text transition font-bold text-xs uppercase tracking-widest"
                >
                    <ChevronRight className="rotate-180" size={14} /> Voltar
                </button>
            )}
            {/* Wallet Header Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-lux-text text-lux-background rounded-[32px] p-8 relative overflow-hidden shadow-2xl"
            >
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                        <CreditCard className="text-lux-accent" size={32} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Seu Saldo em Aberto</p>
                    <h2 className="text-5xl font-light mb-8">
                        R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>

                    <button
                        disabled={totalDebt === 0}
                        onClick={() => handlePayment(totalDebt.toString(), "Pagamento Pendente")}
                        className={`
                            px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl
                            ${totalDebt > 0
                                ? 'bg-lux-accent text-white hover:scale-105 hover:shadow-lux-accent/20'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'}
                        `}
                    >
                        {totalDebt > 0 ? 'Pagar Saldo Total' : 'Tudo em Dia'}
                    </button>
                </div>

                {/* Abstract Visuals */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-lux-accent/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
            </motion.div>

            {/* Transaction List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-lux-text text-lg">Histórico Financeiro</h3>
                    <button className="text-xs font-bold text-lux-accent flex items-center gap-1 uppercase tracking-wider">
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
                            className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group hover:border-lux-accent transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110
                                    ${item.status === 'PAID' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}
                                `}>
                                    {item.status === 'PAID' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{item.description || 'Tratamento'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {new Date(item.dueDate || item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className="font-black text-slate-900 text-sm">R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <button
                                        onClick={() => downloadInvoice(item.id)}
                                        className="text-[10px] font-bold text-lux-accent flex items-center gap-1 mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        NF-e <Download size={10} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handlePayment(item.amount, item.description)}
                                    className={`
                                        p-2 rounded-xl transition-all
                                        ${item.status === 'PENDING' ? 'bg-lux-accent text-white hover:scale-110 shadow-lg shadow-lux-accent/20' : 'bg-slate-50 text-slate-300'}
                                    `}
                                >
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {financials.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                            <FileText size={48} className="text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">Nenhum registro financeiro encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
