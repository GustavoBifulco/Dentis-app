
import React, { useState, useCallback } from 'react';
import { useUser, useOrganizationList } from '@clerk/clerk-react';
import { completeOnboarding } from '../lib/api';
import SetupWizard from './SetupWizard';
import { User, Building2, CheckCircle2, Zap, Shield, Star, Briefcase, X } from 'lucide-react';
import { formatCPF, formatPhone, unformat } from '../lib/formatters';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

// --- CONFIGURAÇÃO PÚBLICA DO STRIPE ---
const stripePromise = loadStripe("pk_live_51SvoupKEW8h95m27mgQtM0FKwoMZnRJLJlxbHAIf1mUWQ7blhRqiUlgFmpDqe3M8J2PWgNspv18A4ymi1CZMLDQ200oUks3NDV");

// --- 8 IDs DE PREÇO ---
const PLANS = {
  DENTIST_FREE: { MONTHLY: "price_FREE_M", YEARLY: "price_FREE_Y" },
  DENTIST_PRO: { MONTHLY: "price_PRO_M", YEARLY: "price_PRO_Y" },
  CLINIC_BASIC: { MONTHLY: "price_CB_M", YEARLY: "price_CB_Y" },
  CLINIC_PRO: { MONTHLY: "price_CP_M", YEARLY: "price_CP_Y" }
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const { createOrganization, isLoaded: orgsLoaded } = useOrganizationList();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isOwnerDentist, setIsOwnerDentist] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Estado para o Embedded Checkout
  const [clientSecret, setClientSecret] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '', cpf: '', cro: '', phone: '',
    clinicName: '',
    responsibleDentistName: '', responsibleDentistCpf: '', responsibleDentistCro: ''
  });

  // Pre-fill CPF from user metadata as requested
  React.useEffect(() => {
    if (userLoaded && user?.unsafeMetadata?.cpf) {
      console.log("📌 [ONBOARDING] CPF encontrado no Clerk:", user.unsafeMetadata.cpf);
      const val = user.unsafeMetadata.cpf as string;
      setFormData(prev => ({ ...prev, cpf: formatCPF(val) }));
    }
  }, [user, userLoaded]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectRole = (role: 'dentist' | 'clinic_owner' | 'patient') => {
    updateFormData('role', role);
    setIsOwnerDentist(true);
    setStep(2);
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cpf || !formData.phone) return alert("Preencha CPF e Telefone.");
    if (formData.role === 'clinic_owner' && !formData.clinicName) return alert("Informe o nome da sua clínica.");

    // Se for Paciente, pula a etapa de planos
    if (formData.role === 'patient') {
      finishSetup();
    } else {
      setStep(3);
    }
  };

  // --- LÓGICA DO EMBEDDED CHECKOUT ---
  const handleCheckoutOpen = async (priceId: string) => {
    localStorage.setItem('pending_onboarding_data', JSON.stringify({
      ...formData,
      billingCycle
    }));

    if (priceId.includes("FREE")) {
      finishSetup(); // Plano grátis não precisa de Stripe
      return;
    }

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
    setLoading(true);

    // Only go to SetupWizard (Step 4) if NOT a patient
    const isPatient = formData.role === 'patient';
    if (!isPatient) {
      setStep(4);
    }

    try {
      let orgId = '';

      // Criar Organização no Clerk APENAS se for Dono de Clínica
      if (formData.role === 'clinic_owner' && orgsLoaded && createOrganization) {
        try {
          const org = await createOrganization({ name: formData.clinicName });
          orgId = org.id;
        } catch (orgErr: any) {
          console.error("Erro ao criar organização:", orgErr);
        }
      }

      const finalCro = formData.role === 'clinic_owner' && !isOwnerDentist ? formData.responsibleDentistCro : formData.cro;

      await completeOnboarding({
        userId: user.id,
        name: user.fullName || '',
        role: formData.role,
        cpf: unformat(formData.cpf),
        phone: unformat(formData.phone),
        cro: finalCro,
        clinicName: formData.clinicName,
        orgId: orgId
      });

      // Recarrega os dados do usuário do Clerk para garantir que o frontend veja o onboardingComplete: true
      await user.reload();

      // If patient, we are done!
      if (isPatient) {
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro no setup: " + err.message);
      if (!isPatient) setStep(3);
    } finally {
      setLoading(false);
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

      {/* TELA PRINCIPAL DO ONBOARDING */}
      <div className="max-w-6xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-slate-900 text-white p-8 flex flex-col justify-between relative">
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-2">Dentis.OS</h1>
            <StepIndicator current={step} step={1} label="Perfil" />
            <StepIndicator current={step} step={2} label="Dados" />
            {(formData.role === 'dentist' || formData.role === 'clinic_owner' || !formData.role) && (
              <StepIndicator current={step} step={3} label="Plano" />
            )}
            <StepIndicator current={step} step={4} label="Setup" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="w-full md:w-3/4 p-8 md:p-12 overflow-y-auto bg-slate-50/50">

          {step === 1 && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Qual seu perfil?</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button onClick={() => selectRole('dentist')} className="p-6 rounded-3xl bg-white border hover:border-indigo-600 transition-all text-left shadow-sm hover:shadow-md">
                  <div className="bg-indigo-100 p-3 rounded-full w-fit mb-4"><Briefcase className="w-6 h-6 text-indigo-600" /></div>
                  <h3 className="text-xl font-bold mb-1">Sou Dentista</h3>
                  <p className="text-sm text-slate-500">Para profissionais autônomos.</p>
                </button>
                <button onClick={() => selectRole('clinic_owner')} className="p-6 rounded-3xl bg-white border hover:border-emerald-600 transition-all text-left shadow-sm hover:shadow-md">
                  <div className="bg-emerald-100 p-3 rounded-full w-fit mb-4"><Building2 className="w-6 h-6 text-emerald-600" /></div>
                  <h3 className="text-xl font-bold mb-1">Dono de Clínica</h3>
                  <p className="text-sm text-slate-500">Para gestores e clínicas.</p>
                </button>
                <button onClick={() => selectRole('patient')} className="p-6 rounded-3xl bg-white border hover:border-blue-600 transition-all text-left shadow-sm hover:shadow-md">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mb-4"><User className="w-6 h-6 text-blue-600" /></div>
                  <h3 className="text-xl font-bold mb-1">Sou Paciente</h3>
                  <p className="text-sm text-slate-500">Acesso ao portal do paciente.</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleInfoSubmit} className="max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold mb-6">Suas Credenciais</h2>

              {formData.role === 'clinic_owner' && (
                <input required placeholder="Nome da Clínica" className="w-full p-4 rounded-xl border border-emerald-200" value={formData.clinicName} onChange={e => updateFormData('clinicName', e.target.value)} />
              )}

              {(!user?.unsafeMetadata?.cpf && userLoaded) && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">CPF</label>
                  <input
                    required
                    placeholder="000.000.000-00"
                    className="w-full p-4 rounded-xl border focus:ring-2 focus:ring-slate-900 outline-none transition"
                    value={formData.cpf}
                    onChange={e => updateFormData('cpf', formatCPF(e.target.value))}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Telefone Celular</label>
                <input
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full p-4 rounded-xl border focus:ring-2 focus:ring-slate-900 outline-none transition"
                  value={formData.phone}
                  onChange={e => {
                    const val = formatPhone(e.target.value);
                    if (val.length <= 15) updateFormData('phone', val);
                  }}
                />
              </div>

              {(formData.role === 'dentist' || (formData.role === 'clinic_owner' && isOwnerDentist)) &&
                <input required placeholder="CRO" className="w-full p-4 rounded-xl border" value={formData.cro} onChange={e => updateFormData('cro', e.target.value)} />
              }

              {formData.role === 'clinic_owner' && (
                <label className="flex items-center gap-2 mt-4 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={isOwnerDentist} onChange={e => setIsOwnerDentist(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                  Sou o dentista responsável técnico
                </label>
              )}

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Voltar</button>
                <button disabled={loading} type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    formData.role === 'patient' ? 'Finalizar Cadastro' : 'Continuar'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="h-full">
              <div className="text-center mb-8">
                <button onClick={() => setStep(2)} className="float-left text-sm font-bold text-slate-400 hover:text-slate-600">Voltar</button>
                <div className="clear-both"></div>
                <h2 className="text-3xl font-black mb-2">Escolha seu nível</h2>
                <div className="inline-flex bg-slate-200 p-1 rounded-xl">
                  <button onClick={() => setBillingCycle('MONTHLY')} className={`px-6 py-2 rounded-lg font-bold ${billingCycle === 'MONTHLY' ? 'bg-white shadow' : ''}`}>Mensal</button>
                  <button onClick={() => setBillingCycle('YEARLY')} className={`px-6 py-2 rounded-lg font-bold ${billingCycle === 'YEARLY' ? 'bg-white shadow' : ''}`}>Anual</button>
                </div>
              </div>

              {/* PLANOS DENTISTA */}
              {formData.role === 'dentist' && (
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-8 rounded-3xl border hover:border-slate-400 transition-all shadow-sm hover:shadow-lg">
                    <h3 className="text-xl font-bold">Dentis ID</h3>
                    <div className="my-4 text-4xl font-black">R$ 0</div>
                    <ul className="space-y-2 mb-8 text-sm text-slate-600">
                      <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500" /> Agenda Pessoal</li>
                      <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500" /> Prontuário Básico</li>
                    </ul>
                    <button onClick={() => handleCheckoutOpen(PLANS.DENTIST_FREE[billingCycle])} className="w-full py-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 transaction">Começar Grátis</button>
                  </div>
                  <div className="bg-slate-900 text-white p-8 rounded-3xl border-4 border-indigo-500 shadow-xl scale-105">
                    <div className="flex justify-between items-center mb-2"><h3 className="text-xl font-bold">Dentis ID Pro</h3> <span className="bg-indigo-500 text-xs px-2 py-1 rounded-full">Recomendado</span></div>
                    <div className="my-4 text-4xl font-black">{billingCycle === 'MONTHLY' ? 'R$ 97' : 'R$ 79'}</div>
                    <ul className="space-y-2 mb-8 text-sm text-slate-300">
                      <li className="flex gap-2"><Zap size={16} className="text-yellow-400" /> IA Assistente</li>
                      <li className="flex gap-2"><Zap size={16} className="text-yellow-400" /> Marketing Auto</li>
                    </ul>
                    <button onClick={() => handleCheckoutOpen(PLANS.DENTIST_PRO[billingCycle])} className="w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/30">Assinar Pro</button>
                  </div>
                </div>
              )}

              {/* PLANOS CLÍNICA */}
              {formData.role === 'clinic_owner' && (
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-8 rounded-3xl border hover:border-emerald-500 transition-all shadow-sm hover:shadow-lg">
                    <h3 className="text-xl font-bold">Clinic ID</h3>
                    <div className="my-4 text-4xl font-black">{billingCycle === 'MONTHLY' ? 'R$ 199' : 'R$ 159'}</div>
                    <button onClick={() => handleCheckoutOpen(PLANS.CLINIC_BASIC[billingCycle])} className="w-full py-4 rounded-xl font-bold border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition">Assinar Básico</button>
                  </div>
                  <div className="bg-emerald-900 text-white p-8 rounded-3xl border-4 border-emerald-400 shadow-xl scale-105">
                    <div className="flex justify-between items-center mb-2"><h3 className="text-xl font-bold">Clinic ID Pro</h3> <span className="bg-emerald-400 text-emerald-900 text-xs px-2 py-1 rounded-full">Power</span></div>
                    <div className="my-4 text-4xl font-black">{billingCycle === 'MONTHLY' ? 'R$ 299' : 'R$ 249'}</div>
                    <button onClick={() => handleCheckoutOpen(PLANS.CLINIC_PRO[billingCycle])} className="w-full py-4 rounded-xl font-bold bg-emerald-400 text-emerald-900 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/30">Assinar Pro</button>
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
  return <div className={`flex items-center gap-2 mb-4 ${current === step ? 'opacity-100 font-bold text-emerald-400' : 'opacity-50'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${current >= step ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
      {current > step ? <CheckCircle2 size={16} /> : step}
    </div>
    {label}
  </div>;
}
