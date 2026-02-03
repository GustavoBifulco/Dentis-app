import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Users,
  ShoppingBag,
  BarChart3,
  MessageSquare,
  Smartphone,
  Package,
  Database,
  Sparkles,
  Search,
  UserCircle,
  Clock,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Globe,
  MousePointer2,
  Menu,
  Briefcase
} from 'lucide-react';

type Props = {
  onStart: () => void;
  onLogin: () => void;
};

// Custom Hook para animação de scroll
const useScrollReveal = () => {
  const [revealed, setRevealed] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setRevealed(true);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return { domRef, revealed };
};

const ScrollReveal = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const { domRef, revealed } = useScrollReveal();
  return (
    <div
      ref={domRef}
      className={`${className} transition-all duration-1000 transform ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      {children}
    </div>
  );
};

// Logo Component com animação de brilho
const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col items-start group cursor-pointer ${className}`}>
    <span className="text-3xl md:text-4xl font-black tracking-tighter text-black leading-none group-hover:text-blue-600 transition-colors">
      Dentis
    </span>
    <div className="h-[4px] w-full mt-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full group-hover:scale-x-110 transition-transform origin-left"></div>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="group border-b border-gray-100 py-8 transition-all hover:bg-gray-50/50 px-4 rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">{question}</span>
        <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-black text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden text-gray-500 font-light leading-relaxed text-lg">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, colorClass }: { icon: any, title: string, description: string, colorClass: string }) => (
  <div className="relative overflow-hidden bg-white p-10 rounded-[3rem] border border-gray-100 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 group hover:-translate-y-4">
    <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${colorClass}`}></div>
    <div className="relative z-10">
      <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
        <Icon size={32} strokeWidth={1.5} className="group-hover:text-blue-600" />
      </div>
      <h4 className="text-2xl font-black mb-4 text-gray-900 leading-tight">{title}</h4>
      <p className="text-gray-400 text-base font-light leading-relaxed group-hover:text-gray-600 transition-colors">{description}</p>
    </div>
  </div>
);

export default function Landing({ onStart, onLogin }: Props) {
  const [activeRole, setActiveRole] = useState('Clinica');

  return (
    <div className="bg-white min-h-screen selection:bg-blue-600 selection:text-white overflow-x-hidden">

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-100/30 blur-[150px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-gray-100/50 py-5 px-6 md:px-12">
        <div className="container mx-auto flex justify-between items-center">
          <Logo className="w-24 md:w-32" />
          <div className="hidden lg:flex items-center space-x-12">
            <a href="#ecossistema" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all">Ecossistema</a>
            <a href="#solucoes" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all">Soluções</a>
            <a href="#como-funciona" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all">O Fluxo</a>
            <a href="#faq" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all">Dúvidas</a>
            <button
              onClick={onLogin}
              className="bg-white border-2 border-gray-200 text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:border-black transition-all"
            >
              Entrar
            </button>
            <button
              onClick={onStart}
              className="bg-black text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Criar Conta
            </button>
          </div>
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-6 py-3 bg-white border border-gray-200 rounded-full text-xs font-bold"
            >
              Entrar
            </button>
            <button
              onClick={onStart}
              className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold"
            >
              Criar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 md:px-12 overflow-hidden">
        <div className="container mx-auto text-center max-w-6xl relative">
          <ScrollReveal>
            <div className="inline-flex items-center space-x-3 bg-white/50 backdrop-blur-md border border-gray-100 px-6 py-2.5 rounded-full mb-10 shadow-sm">
              <Sparkles size={16} className="text-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-600">A Revolução Digital da Odontologia</span>
            </div>
          </ScrollReveal>

          <ScrollReveal className="delay-200">
            <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.85] text-black mb-14 drop-shadow-sm">
              TUDO DA <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent italic font-thin tracking-normal">ODONTO</span> EM UM <br />
              SÓ LUGAR.
            </h1>
          </ScrollReveal>

          <ScrollReveal className="delay-400">
            <p className="text-gray-400 text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-20 px-4">
              O primeiro ecossistema unificado: Paciente, Dentista, Protético e Marketplace conectados por uma identidade única via CPF. Sem burocracia, com inteligência real.
            </p>
          </ScrollReveal>

          <ScrollReveal className="delay-600">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-8 mb-32">
              <button
                onClick={onStart}
                className="w-full sm:w-auto bg-black text-white px-16 py-8 rounded-[2rem] text-sm font-black uppercase tracking-[0.4em] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-2 transition-all"
              >
                Criar Conta Grátis
              </button>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto bg-white border-2 border-gray-100 text-black px-16 py-8 rounded-[2rem] text-sm font-black uppercase tracking-[0.4em] hover:bg-gray-50 hover:border-black transition-all flex items-center justify-center"
              >
                Fazer Login <ArrowRight size={20} className="ml-4" />
              </button>
            </div>
          </ScrollReveal>

          {/* Floating Feature Cards in Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto opacity-60">
            {['CPF Único', 'Dados Integrados', 'Marketplace', 'IA Preditiva'].map((text, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 p-8 border border-gray-100 rounded-[2rem] hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract Tech Element - Hero Bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 opacity-10 pointer-events-none">
          <div className="w-full h-full border-x border-t border-gray-300 rounded-t-[10rem] grid grid-cols-12">
            {[...Array(12)].map((_, i) => <div key={i} className="border-r border-gray-300 h-full last:border-0"></div>)}
          </div>
        </div>
      </section>

      {/* O que é o Dentis - Bento Style */}
      <section id="ecossistema" className="py-40 bg-gray-50/50 px-6 md:px-12">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-32">
            <ScrollReveal>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-12 leading-[0.9]">
                O FIM DA <br /><span className="text-blue-500 italic font-light">FRAGMENTAÇÃO.</span>
              </h2>
              <p className="text-gray-500 text-xl md:text-2xl font-light leading-relaxed">
                Dentis é o "Super App" da Odontologia. Imagine o iFood, o Slack, o Trello e o seu software de gestão conversando entre si em tempo real. Uma plataforma única para substituir WhatsApp, planilhas e o caos administrativo.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <ScrollReveal className="lg:col-span-2">
              <div className="h-full bg-white rounded-[4rem] p-16 border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Database size={120} />
                </div>
                <h3 className="text-4xl font-black mb-8">Ecossistema Conectado</h3>
                <p className="text-gray-400 text-xl font-light max-w-xl leading-relaxed">
                  Diferente de sistemas isolados, no Dentis o prontuário fala com o laboratório, que fala com o estoque, que fala com o fornecedor. Todos os dados fluem naturalmente.
                </p>
                <div className="mt-12 flex space-x-4">
                  <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">Single Source of Truth</div>
                  <div className="px-6 py-3 bg-slate-50 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest">Zero Latency</div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal className="delay-200">
              <div className="h-full bg-black rounded-[4rem] p-16 text-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] transition-all">
                <ShieldCheck size={48} className="text-blue-400 mb-8" />
                <h3 className="text-4xl font-black mb-6">Identidade <br />Única por CPF</h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  Histórico unificado para sempre. O CPF do dentista e do paciente garantem rastreabilidade total de cada procedimento e compra.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Funcionalidades Organizadas - Modern Interactive Toggles */}
      <section id="solucoes" className="py-48 px-6 md:px-12 bg-white relative">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-12">
            <ScrollReveal className="max-w-3xl">
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600 mb-8 block">Funcionalidades de Elite</span>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">Poder Total por <br /><span className="italic font-thin text-gray-300">Perfil de Usuário.</span></h2>
            </ScrollReveal>
            <ScrollReveal className="delay-200">
              <div className="flex bg-gray-100 p-2 rounded-[2.5rem] border border-gray-200">
                {['Clinica', 'Lab', 'Marketplace', 'IA'].map(role => (
                  <button
                    key={role}
                    onClick={() => setActiveRole(role)}
                    className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeRole === role ? 'bg-white shadow-xl text-black scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {activeRole === 'Clinica' && (
              <>
                <FeatureCard icon={Smartphone} title="Agenda Preditiva" description="Gestão de horários inteligente com confirmação automática via IA e integração total com o retorno dos pacientes." colorClass="bg-blue-500" />
                <FeatureCard icon={Database} title="Prontuário Unificado" description="Seus dados clínicos e orçamentos vinculados ao CPF do paciente, acessíveis de qualquer lugar do ecossistema." colorClass="bg-slate-500" />
                <FeatureCard icon={BarChart3} title="Financeiro Operacional" description="Controle de cobranças, DRE e lucratividade por cadeira integrados diretamente à sua rotina diária." colorClass="bg-emerald-500" />
              </>
            )}
            {activeRole === 'Lab' && (
              <>
                <FeatureCard icon={Briefcase} title="Fluxo de Casos" description="Organize pedidos protéticos com checklists rigorosos, prazos automáticos e status em tempo real para o dentista." colorClass="bg-emerald-500" />
                <FeatureCard icon={Clock} title="Rastreabilidade Total" description="Cada etapa da produção é registrada. O dentista recebe notificações no celular a cada avanço do seu laboratório." colorClass="bg-orange-500" />
                <FeatureCard icon={Package} title="Logística Integrada" description="Protocolos de envio e recebimento digitais que eliminam erros de comunicação e perdas de modelos físicos." colorClass="bg-indigo-500" />
              </>
            )}
            {activeRole === 'Marketplace' && (
              <>
                <FeatureCard icon={ShoppingBag} title="Recompra Inteligente" description="Experiência de delivery para produtos odontológicos. Favorite suas marcas e peça tudo com um único clique." colorClass="bg-pink-500" />
                <FeatureCard icon={Zap} title="Logística Própria" description="Rede de fornecedores parceiros conectada para garantir a entrega mais rápida do setor odontológico brasileiro." colorClass="bg-yellow-500" />
                <FeatureCard icon={Layers} title="Estoque Dinâmico" description="Ao realizar um procedimento, o sistema abate o material do estoque e já sugere a compra no marketplace." colorClass="bg-cyan-500" />
              </>
            )}
            {activeRole === 'IA' && (
              <>
                <FeatureCard icon={Sparkles} title="Insights de Conversão" description="Nossa IA analisa seus orçamentos não fechados e sugere abordagens para aumentar sua taxa de conversão." colorClass="bg-violet-500" />
                <FeatureCard icon={Search} title="Triagem Autônoma" description="As mensagens dos pacientes são triadas por urgência clínica, permitindo que você foque no que é prioridade." colorClass="bg-rose-500" />
                <FeatureCard icon={Activity} title="Previsão de Gastos" description="Algoritmos que analisam seu histórico para prever exatamente quanto você precisa comprar no próximo mês." colorClass="bg-teal-500" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Como Funciona - High Interaction Flux */}
      <section id="como-funciona" className="py-48 px-6 md:px-12 bg-black text-white overflow-hidden">
        <div className="container mx-auto">
          <ScrollReveal className="text-center mb-40">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12">O NOVO <br /><span className="italic font-thin text-blue-400">STANDARD.</span></h2>
            <p className="text-gray-500 text-2xl font-light">Em apenas 4 passos, você digitaliza sua operação completa.</p>
          </ScrollReveal>

          <div className="grid lg:grid-cols-4 gap-12 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2"></div>
            {[
              { icon: UserCircle, title: 'Cadastro CPF', desc: 'Identidade única para paciente, dentista e lab.' },
              { icon: Activity, title: 'Atendimento', desc: 'Registro clínico amarrado ao consumo real.' },
              { icon: Globe, title: 'Ecossistema', desc: 'Comunicação com o lab e pedidos no marketplace.' },
              { icon: BarChart3, title: 'Inteligência', desc: 'Insights automáticos sobre sua produtividade.' },
            ].map((item, i) => (
              <ScrollReveal key={i} className={`delay-${i * 100}`}>
                <div className="relative z-10 bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 hover:bg-white/10 transition-all text-center h-full group">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform">
                    <item.icon size={40} className="text-blue-400" />
                  </div>
                  <h4 className="text-2xl font-black mb-6">{item.title}</h4>
                  <p className="text-gray-500 font-light leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios Mensuráveis - Visual Stats */}
      <section className="py-48 px-6 md:px-12 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <ScrollReveal>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-14">ECONOMIA <br /><span className="italic font-thin text-gray-300">REAL.</span></h2>
              <div className="space-y-10">
                {[
                  'Redução de 30% nas faltas com IA de confirmação.',
                  'Compras 40% mais eficientes via Marketplace integrado.',
                  'Zero ruído na comunicação Dentista x Protético.',
                  'Rastreabilidade total de insumos e custos por procedimento.'
                ].map((text, i) => (
                  <div key={i} className="flex items-start space-x-6 group">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-2xl font-light text-gray-700 leading-tight">{text}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal className="delay-300">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[120px] opacity-10 rounded-full"></div>
                <div className="bg-gray-50 rounded-[4rem] p-20 border border-gray-100 text-center relative z-10">
                  <div className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-400 mb-8">Eficiência Operacional</div>
                  <div className="text-[12rem] font-black leading-none mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent tracking-tighter">+35%</div>
                  <p className="text-xl font-light text-gray-400">Aumento médio na margem de lucro das clínicas parceiras.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Section - Clean & Immersive */}
      <section id="faq" className="py-48 px-6 md:px-12 bg-gray-50/50">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal className="text-center mb-32">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter">FAQ <br /><span className="italic font-thin text-gray-400">TRANSPARENTE.</span></h2>
          </ScrollReveal>
          <div className="space-y-4">
            <FAQItem question="O que é o conceito de CPF Único?" answer="O CPF Único garante que sua identidade seja única em todo o sistema. Se você é dentista e também faz um tratamento como paciente, seus históricos estão conectados. Isso gera continuidade, segurança e elimina a necessidade de cadastros repetitivos em labs ou dentais." />
            <FAQItem question="Funciona para clínicas solo ou apenas grandes redes?" answer="O Dentis é modular e escala com você. Consultórios solo ganham eficiência com o Marketplace e a IA de triagem, enquanto grandes clínicas aproveitam o controle total de equipe e financeiro multisede." />
            <FAQItem question="Como o laboratório de prótese se beneficia?" answer="O laboratório recebe pedidos padronizados, com arquivos digitais anexados e comunicação direta no caso. Isso elimina 90% dos erros de moldagem e retrabalhos causados por má comunicação." />
            <FAQItem question="O Marketplace possui estoque próprio?" answer="Não, somos um ecossistema. Conectamos as melhores dentais e fornecedores do país, garantindo variedade, preços competitivos e a logística mais eficiente para sua região." />
            <FAQItem question="O estoque é realmente automático?" answer="Sim. Ao dar baixa no material durante o registro do procedimento no prontuário, o sistema abate do estoque físico virtualizado. Quando atinge o mínimo, o sistema gera uma sugestão de compra no Marketplace." />
            <FAQItem question="A Inteligência Artificial é difícil de configurar?" answer="Nenhuma configuração é necessária. Ela aprende com o seu comportamento diário, volume de agenda e padrões de consumo para começar a sugerir insights após as primeiras 2 semanas de uso." />
            <FAQItem question="Meus dados estão seguros contra vazamentos?" answer="Utilizamos criptografia de nível militar (AES-256) e infraestrutura baseada em nuvem com conformidade total à LGPD. Seus dados são de sua propriedade exclusiva." />
            <FAQItem question="Como funciona a migração de outros sistemas?" answer="Nossa equipe de suporte técnico auxilia na exportação e importação de dados de pacientes de qualquer software legado, garantindo que você não perca seu histórico atual." />
          </div>
        </div>
      </section>

      {/* CTA Final - High Impact */}
      <section className="py-60 px-6 md:px-12 relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e3a8a_0%,_transparent_70%)] opacity-30"></div>
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-6xl md:text-[12rem] font-black tracking-tighter leading-[0.85] mb-20">
              O FUTURO <br /> JÁ É <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent italic font-thin tracking-normal">DENTIS.</span>
            </h2>
            <p className="text-gray-400 text-2xl md:text-3xl font-light mb-24 max-w-4xl mx-auto px-4 leading-relaxed">
              Comece agora e seja um dos primeiros a operar no ecossistema mais avançado da odontologia mundial.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-12">
              <button
                onClick={onStart}
                className="w-full sm:w-auto bg-white text-black px-20 py-10 rounded-[3rem] text-lg font-black uppercase tracking-[0.5em] hover:scale-105 active:scale-95 transition-all shadow-[0_40px_80px_-20px_rgba(255,255,255,0.2)]"
              >
                Criar Conta
              </button>
              <button
                onClick={onLogin}
                className="text-sm font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white transition-colors border-b-2 border-white/10 pb-2"
              >
                Já Tenho Conta
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer - Minimal Luxury */}
      <footer className="py-24 px-6 md:px-12 bg-white border-t border-gray-100">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 mb-20">
            <Logo className="w-40" />
            <div className="flex flex-wrap gap-x-16 gap-y-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
              <a href="#" className="hover:text-black transition-colors">Instagram</a>
              <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-black transition-colors">Privacidade</a>
              <a href="#" className="hover:text-black transition-colors">Termos</a>
              <a href="#" className="hover:text-black transition-colors">Compliance</a>
            </div>
          </div>
          <div className="pt-20 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
            <p>© {new Date().getFullYear()} DENTIS TECHNOLOGIES. THE UNIFIED DENTISTRY ECOSYSTEM.</p>
            <div className="flex space-x-12 mt-8 md:mt-0">
              <span>BRAZIL</span>
              <span>USA</span>
              <span>EUROPE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}