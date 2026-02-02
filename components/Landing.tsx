import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  MessageSquare,
  Sparkles,
  Users,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-x-hidden font-sans text-white selection:bg-cyan-400 selection:text-slate-900">

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full filter blur-[150px]" />
      </div>

      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/dentis-logo.png" alt="Dentis" className="h-8" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefícios</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:scale-105"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Main Hero Content */}
          <div className="text-center max-w-5xl mx-auto mb-16">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold mb-12 backdrop-blur-sm"
            >
              <Sparkles size={16} className="text-cyan-400" />
              <span>IA Generativa • Gestão Inteligente • Automação Total</span>
            </motion.div>

            {/* Logo Grande */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-12"
            >
              <img
                src="/assets/dentis-logo.png"
                alt="Dentis"
                className="mx-auto w-full max-w-2xl drop-shadow-[0_0_80px_rgba(168,85,247,0.4)]"
              />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-8 tracking-tight"
            >
              O futuro da sua clínica{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                em suas mãos
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto font-light"
            >
              Deixe a inteligência artificial cuidar da gestão, agendamento e finanças,
              enquanto você foca no que realmente importa: <span className="text-white font-semibold">seus pacientes</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={onStart}
                className="group bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3 transform hover:scale-105"
              >
                Começar Grátis Agora
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </button>
              <button
                onClick={onLogin}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/30 transition-all"
              >
                Ver Demonstração
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-400"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-800 bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5 overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="User" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="text-white font-bold text-lg">2.000+ Dentistas</div>
                <div className="text-sm">já transformaram suas clínicas</div>
              </div>
            </motion.div>
          </div>

          {/* Feature Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {[
              {
                icon: Calendar,
                title: "Agenda Inteligente",
                desc: "Confirmação automática via WhatsApp e lista de espera dinâmica",
                gradient: "from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-400"
              },
              {
                icon: TrendingUp,
                title: "Gestão Financeira",
                desc: "Controle completo de receitas, despesas e fluxo de caixa em tempo real",
                gradient: "from-cyan-500/20 to-blue-500/20",
                iconColor: "text-cyan-400"
              },
              {
                icon: MessageSquare,
                title: "Marketing com IA",
                desc: "Campanhas automatizadas de retorno e engajamento de pacientes",
                gradient: "from-indigo-500/20 to-purple-500/20",
                iconColor: "text-indigo-400"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + (idx * 0.1) }}
                className={`group p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                <div className={`w-14 h-14 bg-slate-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center ${feature.iconColor} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2.000+", label: "Dentistas Ativos" },
              { value: "150k+", label: "Pacientes Gerenciados" },
              { value: "98%", label: "Satisfação" },
              { value: "24/7", label: "Suporte Premium" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Por que escolher <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Dentis?</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Tecnologia de ponta que transforma a gestão da sua clínica
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Shield, title: "Segurança LGPD", desc: "Seus dados e dos pacientes 100% protegidos conforme legislação brasileira" },
              { icon: Clock, title: "Economia de Tempo", desc: "Automatize tarefas repetitivas e ganhe até 15 horas por semana" },
              { icon: Users, title: "Experiência do Paciente", desc: "Portal dedicado para pacientes acompanharem tratamentos e financeiro" },
              { icon: CheckCircle2, title: "Implementação Rápida", desc: "Configure sua clínica em minutos, não em semanas" }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/50">
                    <benefit.icon size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-300">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Pronto para revolucionar sua clínica?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de dentistas que já transformaram suas clínicas com Dentis
            </p>
            <button
              onClick={onStart}
              className="group bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3 mx-auto transform hover:scale-105"
            >
              Começar Gratuitamente
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </button>
            <p className="text-slate-400 text-sm mt-4">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950/50 backdrop-blur-sm border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/assets/dentis-logo.png" alt="Dentis" className="h-8" />
            </div>
            <div className="text-slate-400 text-sm">
              © 2026 Dentis. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
