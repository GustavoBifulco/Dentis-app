import React, { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { User, Building2, Briefcase, ArrowRight, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { formatCPF, formatPhone, unformat } from '../lib/formatters';

interface OnboardingV2Props {
    onComplete: () => void;
}

type Role = 'dentist' | 'clinic_owner' | 'patient';

export default function OnboardingV2({ onComplete }: OnboardingV2Props) {
    const { user } = useUser();
    const { getToken, signOut } = useAuth();

    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        role: '' as Role | '',
        name: user?.fullName || '',
        cpf: '',
        phone: '',
        cro: '',
        clinicName: '',
    });

    const [dbUserId, setDbUserId] = useState<number | null>(null);

    // Pre-fill CPF if exists in Clerk
    React.useEffect(() => {
        if (user?.unsafeMetadata?.cpf) {
            setFormData(prev => ({ ...prev, cpf: formatCPF(user.unsafeMetadata.cpf as string) }));
        }
    }, [user]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const selectRole = (role: Role) => {
        setFormData(prev => ({ ...prev, role }));
    };

    // Step 1: Salvar dados básicos IMEDIATAMENTE
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.role || !formData.cpf || !formData.phone) {
            setError('Preencha todos os campos obrigatórios');
            return;
        }

        if (formData.role === 'clinic_owner' && !formData.clinicName) {
            setError('Informe o nome da clínica');
            return;
        }

        // Validação de CRO removida para permitir cadastro simplificado
        /* 
        if ((formData.role === 'dentist' || formData.role === 'clinic_owner') && !formData.cro) {
            setError('Informe o CRO');
            return;
        }
        */

        setLoading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Falha na autenticação. Faça login novamente.');
            }

            // Chama a nova API que salva TUDO no DB imediatamente
            const res = await fetch('/api/onboarding-v2/quick-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user!.id,
                    role: formData.role,
                    name: formData.name || user!.fullName || 'Usuário',
                    cpf: unformat(formData.cpf),
                    phone: unformat(formData.phone),
                    cro: formData.cro || undefined,
                    clinicName: formData.clinicName || undefined,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro ao salvar dados');
            }

            console.log('✅ Dados salvos no DB:', data);
            setDbUserId(data.userId);

            // Se for paciente, já está completo!
            if (formData.role === 'patient') {
                // Recarrega user do Clerk (já foi marcado como completo no backend)
                await user!.reload();
                await new Promise(resolve => setTimeout(resolve, 500));
                onComplete();
            } else {
                // Profissionais vão escolher plano
                setStep(2);
            }
        } catch (err: any) {
            console.error('[ONBOARDING V2 ERROR]', err);
            let errorMessage = err.message || 'Erro ao salvar dados. Tente novamente.';

            // Tratamento específico para erro genérico de validação
            // if (errorMessage.includes('did not match the expected pattern')) {
            //    errorMessage = 'Verifique o formato dos campos (CPF, Telefone ou CRO).';
            // }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Escolher plano
    const handlePlanSelect = async (planType: 'FREE' | 'PRO') => {
        setLoading(true);
        setError('');

        try {
            const token = await getToken();
            if (!token) throw new Error('Token inválido');

            if (planType === 'FREE') {
                // Marca como completo no Clerk
                const res = await fetch('/api/onboarding-v2/mark-complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: user!.id,
                        dbUserId,
                    }),
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.error);

                // Recarrega e vai pro dashboard
                await user!.reload();
                await new Promise(resolve => setTimeout(resolve, 500));
                onComplete();
            } else {
                // Redireciona para Stripe Checkout
                const res = await fetch('/api/checkout/create-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        priceId: formData.role === 'dentist' ? 'price_PRO_M' : 'price_CP_M',
                        userId: user!.id,
                    }),
                });

                const data = await res.json();

                if (data.url) {
                    // Redirect para Stripe Checkout (não modal)
                    window.location.href = data.url;
                } else {
                    throw new Error('Erro ao criar sessão de pagamento');
                }
            }
        } catch (err: any) {
            console.error('[PLAN SELECT ERROR]', err);
            setError(err.message || 'Erro ao processar plano');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-[300px_1fr]">
                    {/* Sidebar */}
                    <div className="bg-slate-900 text-white p-8">
                        <h1 className="text-2xl font-black mb-8">Dentis</h1>

                        <div className="space-y-4">
                            <StepIndicator current={step} step={1} label="Seus Dados" />
                            {formData.role && formData.role !== 'patient' && (
                                <StepIndicator current={step} step={2} label="Plano" />
                            )}
                        </div>

                        <div className="mt-12 text-sm text-slate-400">
                            <p>✓ Configuração rápida</p>
                            <p>✓ Dados seguros</p>
                            <p>✓ Suporte dedicado</p>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="mt-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors border-t border-slate-800 w-full pt-6"
                        >
                            <LogOut size={16} />
                            Sair e continuar depois
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleStep1Submit} className="space-y-6" noValidate autoComplete="off">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">Bem-vindo!</h2>
                                    <p className="text-slate-600">Vamos configurar sua conta em poucos passos.</p>
                                </div>

                                {/* Role Selection */}
                                {!formData.role && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">
                                            Quem é você?
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => selectRole('dentist')}
                                                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                                            >
                                                <Briefcase className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                                <div className="font-bold text-sm">Dentista</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => selectRole('clinic_owner')}
                                                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center"
                                            >
                                                <Building2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                                                <div className="font-bold text-sm">Dono de Clínica</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => selectRole('patient')}
                                                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-violet-500 hover:bg-violet-50 transition-all text-center"
                                            >
                                                <User className="w-8 h-8 mx-auto mb-2 text-violet-600" />
                                                <div className="font-bold text-sm">Paciente</div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formData.role && (
                                    <>
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            {formData.role === 'dentist' && 'Dentista'}
                                            {formData.role === 'clinic_owner' && 'Dono de Clínica'}
                                            {formData.role === 'patient' && 'Paciente'}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, role: '' }))}
                                                className="ml-auto text-blue-600 hover:underline"
                                            >
                                                Alterar
                                            </button>
                                        </div>

                                        {formData.role === 'clinic_owner' && (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    Nome da Clínica *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.clinicName}
                                                    onChange={e => updateField('clinicName', e.target.value)}
                                                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition"
                                                    placeholder="Clínica Odontológica"
                                                />
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    CPF *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.cpf}
                                                    onChange={e => updateField('cpf', formatCPF(e.target.value))}
                                                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition"
                                                    placeholder="000.000.000-00"
                                                    maxLength={14}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    Telefone *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={e => updateField('phone', formatPhone(e.target.value))}
                                                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition"
                                                    placeholder="(00) 00000-0000"
                                                    maxLength={15}
                                                />
                                            </div>
                                        </div>

                                        {(formData.role === 'dentist' || formData.role === 'clinic_owner') && (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    CRO *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.cro}
                                                    onChange={e => updateField('cro', e.target.value.toUpperCase())}
                                                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition"
                                                    placeholder="CRO-SP 12345"
                                                />
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    {formData.role === 'patient' ? 'Finalizar' : 'Continuar'}
                                                    <ArrowRight size={20} />
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </form>
                        )}

                        {step === 2 && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black mb-2">Escolha seu plano</h2>
                                    <p className="text-slate-600">Comece grátis ou desbloqueie recursos avançados</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* FREE Plan */}
                                    <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all">
                                        <div className="text-sm font-bold text-slate-600 mb-2">GRATUITO</div>
                                        <div className="text-4xl font-black mb-4">R$ 0</div>
                                        <ul className="space-y-2 mb-6 text-sm">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                Agenda básica
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                Prontuário digital
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                Até 50 pacientes
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => handlePlanSelect('FREE')}
                                            disabled={loading}
                                            className="w-full py-3 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Processando...' : 'Começar Grátis'}
                                        </button>
                                    </div>

                                    {/* PRO Plan */}
                                    <div className="p-6 rounded-2xl border-2 border-blue-500 bg-blue-50 relative">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            RECOMENDADO
                                        </div>
                                        <div className="text-sm font-bold text-blue-600 mb-2">PRO</div>
                                        <div className="text-4xl font-black mb-4">R$ 97<span className="text-lg">/mês</span></div>
                                        <ul className="space-y-2 mb-6 text-sm">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                Tudo do FREE +
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                Pacientes ilimitados
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                IA Assistente
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                Relatórios avançados
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => handlePlanSelect('PRO')}
                                            disabled={loading}
                                            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? 'Redirecionando...' : 'Assinar PRO'}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    className="mt-6 text-sm text-slate-600 hover:text-slate-900 font-bold"
                                >
                                    ← Voltar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepIndicator({ current, step, label }: { current: number; step: number; label: string }) {
    const isActive = current === step;
    const isComplete = current > step;

    return (
        <div className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isComplete
                    ? 'bg-green-500 text-white'
                    : isActive
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-700 text-slate-400'
                    }`}
            >
                {isComplete ? <CheckCircle2 size={16} /> : step}
            </div>
            <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{label}</span>
        </div>
    );
}
