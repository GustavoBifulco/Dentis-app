import React, { useState } from 'react';
import { useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";
import { ArrowLeft, Mail, Lock, User, Loader2, FileBadge, CheckCircle } from 'lucide-react';
import Logo from './Logo';

interface AuthProps {
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onSwitchMode, onBack }) => {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false); // Para mostrar a tela de código
  const [code, setCode] = useState(""); // Código de verificação do email

  // Dados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        // O App.tsx vai detectar a mudança e redirecionar automaticamente
      } else {
        console.log("Login incompleto:", result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Erro ao entrar. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE CADASTRO ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Criar o cadastro no Clerk
      // O Clerk padrão pede First Name e Last Name separados, vamos dividir o nome
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        // O CPF pode ser salvo nos metadados inseguros (públicos para o front)
        unsafeMetadata: { cpf }
      });

      // 2. Enviar email de verificação
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // 3. Mudar para tela de verificação
      setVerifying(true);
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE VERIFICAÇÃO DE EMAIL (CÓDIGO) ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
      } else {
        console.log("Verificação incompleta:", completeSignUp);
      }
    } catch (err: any) {
      console.error(err);
      setError("Código inválido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Escolhe qual função chamar
  const handleSubmit = mode === 'login' ? handleLogin : handleRegister;

  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      {/* Lado Esquerdo - Visual (Mantido igual ao seu design) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-[100px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="mb-8">
             <Logo size="lg" className="text-white" />
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            Gerencie sua clínica <br/> com precisão cirúrgica.
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            Junte-se a mais de 10.000 profissionais que modernizaram seus atendimentos com o Dentis OS.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold">
                U{i}
              </div>
            ))}
          </div>
          <div className="text-sm font-bold">
            <span className="text-emerald-400">★★★★★</span> <br/>
            Aprovado por especialistas
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center overflow-y-auto relative">
        <button onClick={onBack} className="absolute top-8 left-8 lg:left-auto text-slate-400 hover:text-slate-900 transition flex items-center gap-2 font-bold text-sm">
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden mb-8">
             <Logo size="lg" />
          </div>

          {/* TELA DE VERIFICAÇÃO DE EMAIL (APARECE SÓ NO CADASTRO) */}
          {verifying ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto text-indigo-600">
                    <Mail size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">Verifique seu email</h2>
                <p className="text-slate-500 mb-8 text-center">
                    Enviamos um código de verificação para <strong>{email}</strong>.
                </p>
                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 uppercase">Código de Verificação</label>
                        <input 
                            type="text" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full text-center tracking-widest text-2xl pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold" 
                            placeholder="000000" 
                            maxLength={6}
                            required 
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        Confirmar e Entrar
                    </button>
                </form>
            </div>
          ) : (
            /* TELA NORMAL DE LOGIN/CADASTRO */
            <div className="animate-in fade-in slide-in-from-left-8 duration-500">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h2>
                <p className="text-slate-500 mb-8">
                    {mode === 'login' ? 'Entre com suas credenciais para acessar.' : 'Preencha seus dados básicos para começar.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                    <>
                        <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 uppercase">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" 
                                placeholder="Seu nome" 
                                required 
                            />
                        </div>
                        </div>
                        
                        <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-900 uppercase">CPF</label>
                        <div className="relative">
                            <FileBadge className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" 
                                placeholder="000.000.000-00" 
                                required 
                            />
                        </div>
                        </div>
                    </>
                    )}

                    <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 uppercase">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" 
                            placeholder="seu@email.com" 
                            required 
                        />
                    </div>
                    </div>

                    <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 uppercase">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" 
                            placeholder="••••••••" 
                            required 
                        />
                    </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6 flex items-center justify-center gap-2"
                    >
                    {loading && <Loader2 className="animate-spin" size={20} />}
                    {mode === 'login' ? 'Entrar no Sistema' : 'Continuar Cadastro'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-slate-500">
                    {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
                    <button 
                    onClick={() => {
                        setError(null);
                        onSwitchMode(mode === 'login' ? 'register' : 'login');
                    }}
                    className="text-indigo-600 font-bold hover:underline"
                    >
                    {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
