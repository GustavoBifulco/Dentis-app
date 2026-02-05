import React, { useState } from 'react';
import { IslandCard, LuxButton } from '../components/Shared';
import { ShoppingCart, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { useAppContext } from '../lib/useAppContext';
import { ViewType } from '../types';

export default function Storefront() {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('50.00');
    const [patientId, setPatientId] = useState('1');
    const [description, setDescription] = useState('Limpeza Dental de Exemplo');
    const { showToast, setView } = useAppContext();

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe-connect/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    description,
                    patientId,
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center relative">
            <button
                onClick={() => setView?.(ViewType.SETTINGS)}
                className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Voltar para Configurações</span>
            </button>

            <IslandCard className="w-full max-w-md border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <ShoppingCart className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Demo Pagamento Direto
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Simule um pagamento direto para sua conta conectada.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor (BRL)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição do Serviço</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        />
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-xl space-y-2">
                        <p className="text-[10px] text-cyan-400/80 leading-relaxed italic">
                            Esta transação será vinculada à sua conta Stripe Connect.
                            O valor será creditado após a confirmação do pagamento.
                        </p>
                    </div>

                    <LuxButton
                        onClick={handleCheckout}
                        loading={loading}
                        icon={<CreditCard size={18} />}
                        className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-lg font-bold"
                    >
                        Gerar Link de Pagamento
                    </LuxButton>
                </div>
            </IslandCard>
        </div>
    );
}
