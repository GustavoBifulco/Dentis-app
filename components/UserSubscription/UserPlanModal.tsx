import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Star, Shield, Zap, Sparkles } from 'lucide-react';
import { LuxButton } from '../Shared';
import { useAuth, useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY);



interface UserPlanModalProps {
    onCancel: () => void;
}

type Step = 'OFFER' | 'CHECKOUT_REDIRECT';

const UserPlanModal: React.FC<UserPlanModalProps> = ({ onCancel }) => {
    const [step, setStep] = useState<Step>('OFFER');
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const { getToken } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const isPro = user?.publicMetadata?.planType === 'dentis_pro';

    const handleCheckout = async () => {
        setIsCreatingCheckout(true);
        try {
            const token = await getToken();

            const res = await fetch('/api/billing-provisioning/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mode: 'user_upgrade',
                    planType: 'dentis_pro',
                    seats: 1, // Irrelevant for user plan but required by schema
                    interval: billingCycle,
                })
            });

            if (res.ok) {
                const data = await res.json();
                setClientSecret(data.clientSecret);
                setStep('CHECKOUT_REDIRECT');

            } else {
                alert('Erro ao iniciar checkout.');
            }

        } catch (e) {
            console.error(e);
            alert('Erro ao conectar.');
        } finally {
            setIsCreatingCheckout(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Star className="text-amber-400 fill-amber-400" size={20} />
                            Dentis ID <span className="text-indigo-600">Pro</span>
                        </h2>
                        <p className="text-sm text-slate-500">Potencialize sua carreira.</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition"><div className="w-5 h-5 text-slate-500">✕</div></button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <AnimatePresence mode="wait">
                        {step === 'OFFER' && (
                            <motion.div key="offer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                                {isPro ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">Você já é Pro!</h3>
                                        <p className="text-slate-500 mt-2">Sua assinatura está ativa e você tem acesso a todos os benefícios.</p>
                                        <div className="mt-6">
                                            <button onClick={onCancel} className="text-indigo-600 font-bold hover:underline">Fechar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Benefits */}
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><Zap size={18} /></div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">Sem Limites</h4>
                                                    <p className="text-sm text-slate-500">Crie tratamentos ilimitados e acesse histórico completo.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><Shield size={18} /></div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">Segurança Avançada</h4>
                                                    <p className="text-sm text-slate-500">Backups prioritários e suporte dedicado.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><Sparkles size={18} /></div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">IA Assistant</h4>
                                                    <p className="text-sm text-slate-500">Acesso antecipado às ferramentas de IA.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing Toggle */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-center mb-6">
                                                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex gap-1">
                                                    <button
                                                        onClick={() => setBillingCycle('month')}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'month' ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Mensal
                                                    </button>
                                                    <button
                                                        onClick={() => setBillingCycle('year')}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'year' ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Anual <span className="text-[10px] text-green-600 ml-1">(-10%)</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-slate-800">
                                                    {billingCycle === 'month' ? 'R$ 49,90' : 'R$ 538,90'}
                                                    <span className="text-sm font-normal text-slate-400">/{billingCycle === 'month' ? 'mês' : 'ano'}</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">Cancele quando quiser.</p>
                                            </div>
                                        </div>

                                        <LuxButton onClick={handleCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 text-lg" disabled={isCreatingCheckout}>
                                            {isCreatingCheckout ? <Loader2 className="animate-spin" /> : 'Começar Agora'}
                                        </LuxButton>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {step === 'CHECKOUT_REDIRECT' && clientSecret && (
                            <div className="py-4">
                                <EmbeddedCheckoutProvider
                                    stripe={stripePromise}
                                    options={{ clientSecret }}
                                >
                                    <EmbeddedCheckout />
                                </EmbeddedCheckoutProvider>
                            </div>
                        )}

                        {step === 'CHECKOUT_REDIRECT' && !clientSecret && (
                            <div className="text-center py-10 space-y-4">
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                                <h3 className="text-xl font-bold text-slate-800">Processando...</h3>
                                <p className="text-slate-500">Por favor, aguarde o carregamento do pagamento.</p>
                            </div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
};

export default UserPlanModal;
