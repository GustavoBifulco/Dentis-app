import React, { useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { completeOnboarding } from '../lib/api';
import SetupWizard from './SetupWizard';
import { User, Building2, CheckCircle2, Zap, Shield, Star, Briefcase, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

// --- CONFIGURAÇÃO PÚBLICA DO STRIPE ---
const stripePromise = loadStripe("pk_live_51SvoupKEW8h95m27mgQtM0FKwoMZnRJLJlxbHAIf1mUWQ7blhRqiUlgFmpDqe3M8J2PWgNspv18A4ymi1CZMLDQ200oUks3NDV");

// --- 8 IDs DE PREÇO (COLE SEUS IDs REAIS AQUI) ---
const PLANS = {
  DENTIST_FREE: { MONTHLY: "price_FREE_M", YEARLY: "price_FREE_Y" },
  DENTIST_PRO:  { MONTHLY: "price_PRO_M",  YEARLY: "price_PRO_Y" },
  CLINIC_BASIC: { MONTHLY: "price_CB_M",   YEARLY: "price_CB_Y" },
  CLINIC_PRO:   { MONTHLY: "price_CP_M",   YEARLY: "price_CP_Y" }
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useUser();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); 
  const [isOwnerDentist, setIsOwnerDentist] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  
  // Estado para o Embedded Checkout
  const [clientSecret, setClientSecret] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [formData, setFormData] = useState({
    role: '', cpf: '', cro: '', phone: '',
    responsibleDentistName: '', responsibleDentistCpf: '', responsibleDentistCro: ''
  });

  const selectRole = (role: 'dentist' | 'clinic_owner') => {
    setFormData(prev => ({ ...prev, role }));
    setIsOwnerDentist(true); 
    setStep(2);
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validações simplificadas para brevidade
    if (!formData.cpf || !formData.phone) return alert("Preencha CPF e Telefone.");
    setStep(3);
  };

  // --- LÓGICA DO EMBEDDED CHECKOUT ---
  const handleCheckoutOpen = async (priceId: string) => {
    if (priceId.includes("FREE")) {
      finishSetup(); // Plano grátis não precisa de Stripe
      return;
    }
    
    // Chama o backend para criar a sessão
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowCheckoutModal(true);
      } else {
        alert("Erro ao iniciar pagamento: " + (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  };

  const finishSetup = async () => {
    if (!user) return;
    setStep(4); 
    try {
      const finalCro = formData.role === 'clinic_owner' && !isOwnerDentist ? formData.responsibleDentistCro : formData.cro;
      await completeOnboarding({
        userId: user.id,
        name: user.fullName || '',
        role: formData.role,
        cpf: formData.cpf,
        phone: formData.phone,
        cro: finalCro, 
      });
    } catch (err: any) {
      alert("Erro no setup: " + err.message);
      setStep(3); 
    }
  };

  if (step === 4) return <SetupWizard onComplete={onComplete} />;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative">
      
      {/* --- MODAL DO STRIPE EMBEDDED --- */}
      {showCheckoutModal && clientSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
            <button 
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 z-10 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition"
            >
              <X size={20} />
            </button>
            <div className="flex-1 overflow-y-auto">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      )}

      {/* TELA PRINCIPAL DO ONBOARDING (Sidebar + Conteúdo) */}
      <div className="max-w-6xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-slate-900 text-white p-8 flex flex-col justify-between relative">
           <div className="relative z-10">
            <h1 className="text-2xl font-black mb-2">Dentis.OS</h1>
            <StepIndicator current={step} step={1} label="Perfil" />
            <StepIndicator current={step} step={2} label="Dados" />
            <StepIndicator current={step} step={3} label="Plano" />
            <StepIndicator current={step} step={4} label="Setup" />
           </div>
        </div>

        {/* Conteúdo */}
        <div className="w-full md:w-3/4 p-8 md:p-12 overflow-y-auto bg-slate-50/50">
          
          {step === 1 && (
             <div className="max-w-2xl mx-auto">
               <h2 className="text-3xl font-bold mb-8">Qual seu perfil?</h2>
               <div className="grid md:grid-cols-2 gap-4">
                 <button onClick={() => selectRole('dentist')} className="p-8 rounded-3xl bg-white border hover:border-indigo-600 transition-all text-left">
                   <h3 className="text-xl font-bold mb-1">Sou Dentista</h3>
                 </button>
                 <button onClick={() => selectRole('clinic_owner')} className="p-8 rounded-3xl bg-white border hover:border-emerald-600 transition-all text-left">
                   <h3 className="text-xl font-bold mb-1">Dono de Clínica</h3>
                 </button>
               </div>
             </div>
          )}

          {step === 2 && (
            <form onSubmit={handleInfoSubmit} className="max-w-xl mx-auto space-y-4">
               <h2 className="text-2xl font-bold mb-6">Suas Credenciais</h2>
               <input required placeholder="CPF" className="w-full p-4 rounded-xl border" value={formData.cpf} onChange={e=>setFormData({...formData, cpf:e.target.value})} />
               <input required placeholder="Celular" className="w-full p-4 rounded-xl border" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
               {(formData.role === 'dentist' || (formData.role === 'clinic_owner' && isOwnerDentist)) && 
                 <input required placeholder="CRO" className="w-full p-4 rounded-xl border" value={formData.cro} onChange={e=>setFormData({...formData, cro:e.target.value})} />
               }
               {/* Checkbox Dono... (Simplificado para o exemplo) */}
               {formData.role === 'clinic_owner' && (
                 <label className="flex items-center gap-2 mt-4"><input type="checkbox" checked={isOwnerDentist} onChange={e=>setIsOwnerDentist(e.target.checked)}/> Sou Dentista também</label>
               )}
               <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4">Continuar</button>
            </form>
          )}

          {step === 3 && (
            <div className="h-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">Escolha seu nível</h2>
                <div className="inline-flex bg-slate-200 p-1 rounded-xl">
                   <button onClick={() => setBillingCycle('MONTHLY')} className={`px-6 py-2 rounded-lg font-bold ${billingCycle === 'MONTHLY' ? 'bg-white shadow' : ''}`}>Mensal</button>
                   <button onClick={() => setBillingCycle('YEARLY')} className={`px-6 py-2 rounded-lg font-bold ${billingCycle === 'YEARLY' ? 'bg-white shadow' : ''}`}>Anual</button>
                </div>
              </div>
              
              {/* PLANOS DENTISTA */}
              {formData.role === 'dentist' && (
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                   <div className="bg-white p-8 rounded-3xl border hover:border-slate-400">
                      <h3 className="text-xl font-bold">Dentis ID</h3>
                      <div className="my-4 text-4xl font-black">R$ 0</div>
                      <button onClick={() => handleCheckoutOpen(PLANS.DENTIST_FREE[billingCycle])} className="w-full py-4 rounded-xl font-bold bg-slate-100">Começar Grátis</button>
                   </div>
                   <div className="bg-slate-900 text-white p-8 rounded-3xl border-4 border-indigo-500">
                      <h3 className="text-xl font-bold">Dentis ID Pro</h3>
                      <div className="my-4 text-4xl font-black">{billingCycle === 'MONTHLY' ? 'R$ 97' : 'R$ 79'}</div>
                      <button onClick={() => handleCheckoutOpen(PLANS.DENTIST_PRO[billingCycle])} className="w-full py-4 rounded-xl font-bold bg-indigo-600">Assinar Pro</button>
                   </div>
                </div>
              )}

              {/* PLANOS CLÍNICA */}
              {formData.role === 'clinic_owner' && (
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                   <div className="bg-white p-8 rounded-3xl border hover:border-emerald-500">
                      <h3 className="text-xl font-bold">Clinic ID</h3>
                      <div className="my-4 text-4xl font-black">{billingCycle === 'MONTHLY' ? 'R$ 199' : 'R$ 159'}</div>
                      <button onClick={() => handleCheckoutOpen(PLANS.CLINIC_BASIC[billingCycle])} className="w-full py-4 rounded-xl font-bold border-2 border-emerald-600 text-emerald-700">Assinar Básico</button>
                   </div>
                   <div className="bg-emerald-900 text-white p-8 rounded-3xl border-4 border-emerald-400">
                      <h3 className="text-xl font-bold">Clinic ID Pro</h3>
                      <div className="my-4 text-4xl font-black">{billingCycle === 'MONTHLY' ? 'R$ 299' : 'R$ 249'}</div>
                      <button onClick={() => handleCheckoutOpen(PLANS.CLINIC_PRO[billingCycle])} className="w-full py-4 rounded-xl font-bold bg-emerald-400 text-emerald-900">Assinar Pro</button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current, step, label }: any) {
  return <div className={`flex items-center gap-2 mb-4 ${current === step ? 'opacity-100 font-bold' : 'opacity-50'}`}>{label}</div>;
}
