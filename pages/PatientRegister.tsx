import React, { useEffect, useState } from 'react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

const PatientRegister: React.FC = () => {
    // Extract token from URL path
    const token = window.location.pathname.split('/register/')[1];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [prefilledData, setPrefilledData] = useState<any>(null);
    const [registering, setRegistering] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!token) {
            setError('Token de convite inválido');
            setLoading(false);
            return;
        }

        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await fetch(`/api/patient-invite/${token}`);
            const data = await response.json();

            if (!response.ok) {
                if (data.expired) {
                    setError('Este convite expirou. Solicite um novo convite ao seu dentista.');
                } else if (data.used) {
                    setError('Este convite já foi utilizado.');
                } else {
                    setError(data.error || 'Convite inválido');
                }
                setLoading(false);
                return;
            }

            setPrefilledData(data.prefilledData);

            // Pre-fill form with data from invitation
            setFormData(prev => ({
                ...prev,
                name: data.prefilledData?.name || '',
                email: data.prefilledData?.email || '',
            }));

            setLoading(false);

        } catch (err: any) {
            setError('Erro ao validar convite. Tente novamente.');
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email inválido';
        }

        if (!formData.password) {
            errors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 8) {
            errors.password = 'Senha deve ter no mínimo 8 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'As senhas não coincidem';
        }

        if (!formData.acceptedTerms) {
            errors.terms = 'Você deve aceitar os termos de uso';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setRegistering(true);
        setError(null);

        try {
            const response = await fetch(`/api/patient-invite/${token}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            // Store session token
            localStorage.setItem('patientSessionToken', data.sessionToken);

            // Redirect to patient portal
            window.location.href = '/patient/dashboard';

        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader size={48} className="text-lux-accent animate-spin mx-auto mb-4" />
                    <p className="text-lux-text-secondary">Validando convite...</p>
                </div>
            </div>
        );
    }

    if (error && !prefilledData) {
        return (
            <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle size={64} className="text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-lux-text mb-2">Convite Inválido</h1>
                    <p className="text-lux-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 rounded-xl font-bold bg-lux-accent text-white hover:bg-opacity-90 transition"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    if (registering) {
        return (
            <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader size={48} className="text-lux-accent animate-spin mx-auto mb-4" />
                    <p className="text-lux-text-secondary">Criando sua conta...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lux-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Welcome Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
                    <CheckCircle size={64} className="text-emerald-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-black text-lux-text mb-2">
                        Bem-vindo, {prefilledData?.name}!
                    </h1>
                    <p className="text-lux-text-secondary">
                        Seu dentista te convidou para acessar o portal do paciente.
                        Complete seu cadastro abaixo para começar.
                    </p>
                </div>

                {/* Pre-filled Info */}
                {prefilledData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                        <p className="text-sm font-bold text-blue-900 mb-3">📋 Seus Dados</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {prefilledData?.name && (
                                <div>
                                    <p className="text-blue-700 font-medium">Nome</p>
                                    <p className="text-blue-900 font-bold">{prefilledData.name}</p>
                                </div>
                            )}
                            {prefilledData?.email && (
                                <div>
                                    <p className="text-blue-700 font-medium">Email</p>
                                    <p className="text-blue-900 font-bold">{prefilledData.email}</p>
                                </div>
                            )}
                            {prefilledData?.phone && (
                                <div>
                                    <p className="text-blue-700 font-medium">Telefone</p>
                                    <p className="text-blue-900 font-bold">{prefilledData.phone}</p>
                                </div>
                            )}
                            {prefilledData?.cpf && (
                                <div>
                                    <p className="text-blue-700 font-medium">CPF</p>
                                    <p className="text-blue-900 font-bold">{prefilledData.cpf}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Registration Form */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-black text-lux-text mb-6">Criar Conta</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-bold text-red-900">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-lux-text mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-lux-border focus:border-lux-accent focus:outline-none transition"
                                placeholder="Seu nome completo"
                            />
                            {formErrors.name && (
                                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-lux-text mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-lux-border focus:border-lux-accent focus:outline-none transition"
                                placeholder="seu@email.com"
                            />
                            {formErrors.email && (
                                <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-lux-text mb-2">
                                Senha *
                            </label>
                            <PasswordInput
                                value={formData.password}
                                onChange={(value) => setFormData({ ...formData, password: value })}
                                placeholder="Crie uma senha forte"
                                showStrength={true}
                            />
                            {formErrors.password && (
                                <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-lux-text mb-2">
                                Confirmar Senha *
                            </label>
                            <PasswordInput
                                value={formData.confirmPassword}
                                onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                                placeholder="Digite a senha novamente"
                                showStrength={false}
                            />
                            {formErrors.confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">{formErrors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.acceptedTerms}
                                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded border-2 border-lux-border text-lux-accent focus:ring-lux-accent"
                            />
                            <label htmlFor="terms" className="text-sm text-lux-text-secondary">
                                Eu aceito os{' '}
                                <a href="/terms" target="_blank" className="text-lux-accent font-bold hover:underline">
                                    Termos de Uso
                                </a>{' '}
                                e a{' '}
                                <a href="/privacy" target="_blank" className="text-lux-accent font-bold hover:underline">
                                    Política de Privacidade
                                </a>
                            </label>
                        </div>
                        {formErrors.terms && (
                            <p className="text-xs text-red-600">{formErrors.terms}</p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={registering}
                            className="w-full px-6 py-4 rounded-xl font-bold bg-lux-accent text-white hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {registering ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-lux-text-secondary mt-6">
                    Ao criar sua conta, você terá acesso ao portal do paciente onde poderá visualizar
                    seus agendamentos, prontuários e muito mais.
                </p>
            </div>
        </div>
    );
};

export default PatientRegister;
