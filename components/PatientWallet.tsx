import React, { useState } from 'react';
import { ArrowLeft, Download, Copy, CheckCircle2, Clock, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../lib/useAppContext';
import { useFinancials } from '../lib/hooks/useFinancials';
import { Payment } from '../types';

interface PatientWalletProps {
    onBack?: () => void;
}

const PatientWallet: React.FC<PatientWalletProps> = ({ onBack }) => {
    const { session } = useAppContext();
    const patientId = session?.activeContext?.type === 'PATIENT' ? session.activeContext.id : null;

    const {
        totalContracted,
        totalPaid,
        outstandingBalance,
        paymentHistory,
        pendingPayments,
        isLoading,
        error
    } = useFinancials({ patientId });

    const [copiedId, setCopiedId] = useState<number | null>(null);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleCopyPix = (paymentId: number) => {
        // Mock PIX code - in production, this would be a real PIX code from the API
        const pixCode = `00020126580014br.gov.bcb.pix0136${paymentId}-mock-pix-code-here`;
        navigator.clipboard.writeText(pixCode);
        setCopiedId(paymentId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDownloadReceipt = (payment: Payment) => {
        // Mock receipt download - in production, this would download a real PDF
        console.log('Downloading receipt for payment:', payment.id);
        alert(`Download do recibo #${payment.id} iniciado (mockado)`);
    };

    const getPaymentStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'overdue':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPaymentStatusIcon = (status: Payment['status']) => {
        switch (status) {
            case 'paid':
                return <CheckCircle2 size={16} />;
            case 'pending':
                return <Clock size={16} />;
            case 'overdue':
                return <AlertCircle size={16} />;
            default:
                return <DollarSign size={16} />;
        }
    };

    const getPaymentStatusLabel = (status: Payment['status']) => {
        switch (status) {
            case 'paid':
                return 'Pago';
            case 'pending':
                return 'Pendente';
            case 'overdue':
                return 'Vencido';
            default:
                return 'Desconhecido';
        }
    };

    const paymentProgress = totalContracted > 0 ? (totalPaid / totalContracted) * 100 : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-lux-accent" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-lux-subtle rounded-xl transition-colors"
                    >
                        <ArrowLeft size={24} className="text-lux-text" />
                    </button>
                )}
                <div>
                    <h2 className="text-3xl font-bold text-lux-text">Carteira Digital</h2>
                    <p className="text-lux-text-secondary">Gerencie seus pagamentos e faturas</p>
                </div>
            </div>

            {/* Financial Summary Card */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="apple-card p-8 bg-gradient-to-br from-lux-text to-lux-text/90 text-lux-background relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-lux-accent rounded-full blur-[100px] opacity-20"></div>
                <div className="relative z-10">
                    <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-6">Resumo Financeiro</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <p className="text-xs opacity-70 mb-1">Total Contratado</p>
                            <p className="text-2xl font-light">{formatCurrency(totalContracted)}</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-70 mb-1">Total Pago</p>
                            <p className="text-2xl font-light text-emerald-300">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-70 mb-1">Saldo Devedor</p>
                            <p className={`text-2xl font-light ${outstandingBalance === 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                                {formatCurrency(outstandingBalance)}
                            </p>
                        </div>
                    </div>

                    <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${paymentProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        ></motion.div>
                    </div>
                    <p className="text-xs mt-2 opacity-70">{paymentProgress.toFixed(1)}% do tratamento pago</p>
                </div>
            </motion.div>

            {/* Pending Payments */}
            {pendingPayments.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="font-bold text-lux-text text-xl mb-4">Pagamentos Pendentes</h3>
                    <div className="space-y-4">
                        {pendingPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className={`apple-card p-6 border-2 ${payment.status === 'overdue' ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${getPaymentStatusColor(payment.status)}`}>
                                                {getPaymentStatusIcon(payment.status)}
                                                {getPaymentStatusLabel(payment.status)}
                                            </span>
                                            {payment.status === 'overdue' && (
                                                <span className="text-xs text-red-600 font-bold">⚠️ Vencido</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-lux-text-secondary">
                                            Vencimento: {formatDate(payment.dueDate)}
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-lux-text">{formatCurrency(payment.amount)}</p>
                                </div>

                                <button
                                    onClick={() => handleCopyPix(payment.id)}
                                    className="w-full bg-lux-accent text-white px-4 py-3 rounded-xl font-bold hover:bg-lux-accent/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    {copiedId === payment.id ? (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Código PIX Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            Copiar Código PIX
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Payment History */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-lux-text text-xl mb-4">Histórico de Pagamentos</h3>
                {paymentHistory.length === 0 ? (
                    <div className="apple-card p-12 text-center">
                        <DollarSign size={48} className="text-lux-text-secondary mx-auto mb-4 opacity-50" />
                        <p className="text-lux-text-secondary">Nenhum pagamento realizado ainda</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {paymentHistory.map((payment) => (
                            <div
                                key={payment.id}
                                className="apple-card p-5 hover:border-lux-accent/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lux-text">{formatCurrency(payment.amount)}</p>
                                            <p className="text-sm text-lux-text-secondary">
                                                Pago em {payment.paidDate ? formatDate(payment.paidDate) : 'N/A'}
                                                {payment.method && ` • ${payment.method}`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadReceipt(payment)}
                                        className="p-2 hover:bg-lux-subtle rounded-lg transition-colors text-lux-text-secondary hover:text-lux-text"
                                        title="Baixar Recibo"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Help Section */}
            <div className="apple-card p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Precisa de Ajuda?</h4>
                        <p className="text-sm text-blue-700 mb-3">
                            Se você tiver dúvidas sobre seus pagamentos ou precisar negociar valores, entre em contato com nossa equipe financeira.
                        </p>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 underline">
                            Falar com Financeiro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientWallet;
