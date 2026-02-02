import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Globe, 
  ChevronRight, 
  Activity, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Calendar, 
  MessageSquare 
} from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-indigo-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            Dentis App
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Depoimentos</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={onStart}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-indigo-50 to-white -z-10" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <Sparkles size={14} />
              <span>Nova IA Generativa Integrada</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900 mb-6 tracking-tight">
              O futuro da sua <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                clínica chegou.
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
              Deixe a inteligência artificial cuidar da gestão, agendamento e finanças, enquanto você foca no que realmente importa: seus pacientes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200"
              >
                Criar Conta Grátis
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                <Globe size={20} className="text-indigo-600" />
                Ver Demonstração
              </button>
            </div>

            <div className="mt-12 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div>
                <span className="text-slate-900 font-bold block">2.000+ Dentis Apptas</span>
                confiam no Dentis App OS
              </div>
            </div>
          </motion.div>

          {/* Hero Image / Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 p-2 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700">
              <img 
                src="https://cdn.dribbble.com/userupload/12975932/file/original-d020d207759600965d75706596397277.png?resize=1600x1200" 
                alt="Dashboard Preview" 
                className="rounded-2xl w-full h-auto"
              />
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Receita Hoje</div>
                    <div className="text-lg font-bold text-slate-900">R$ 4.250</div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-green-500 rounded-full" />
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Consulta Confirmada</div>
                  <div className="text-sm text-slate-500">Dra. Juliana • 14:00</div>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 ml-2">
                  <Check size={16} strokeWidth={3} />
                </div>
              </motion.div>
            </div>
            
            {/* Background Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/20 filter blur-[120px] -z-10 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Tudo o que você precisa, <br/> em um só lugar.</h2>
            <p className="text-lg text-slate-600">Esqueça as planilhas e sistemas antigos. O Dentis App OS integra toda a jornada do paciente em uma plataforma fluida.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Agenda Inteligente", desc: "Confirmação via WhatsApp automática e lista de espera dinâmica." },
              { icon: Activity, title: "Prontuário Digital", desc: "Histórico completo, anamnese e odontograma interativo em 3D." },
              { icon: MessageSquare, title: "Marketing Automático", desc: "Campanhas de retorno e pós-venda gerenciadas por IA." }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-colors duration-300">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            Dentis App
          </div>
          <div className="text-slate-400 text-sm">
            © 2026 Dentis App OS. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
