import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client"; // REMOVE THIS LINE IF IT WAS HERE, ACTUALLY NO, I WILL JUST REMOVE THE IMPORT IN THE NEXT CHUNK
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
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
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Instagram,
  Twitter,
  Briefcase,
  X,
  Lock,
  FileText,
  Truck,
  BadgeCheck,
  Building2,
} from "lucide-react";

// ----------------------------------------------------
// UI bits
// ----------------------------------------------------

const cx = (...s: Array<string | false | undefined | null>) => s.filter(Boolean).join(" ");

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={cx("flex flex-col items-start", className)}>
    <span
      className="text-3xl md:text-4xl font-normal tracking-tight text-black leading-none"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      Dentis
    </span>
    <div className="h-[4px] w-full mt-1.5 dentis-gradient rounded-full" />
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full border border-gray-100 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">
    {children}
  </span>
);

const SectionTitle = ({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
}) => (
  <div className={cx("max-w-3xl", center && "mx-auto text-center")}>
    {eyebrow && (
      <div className={cx("text-[10px] font-bold uppercase tracking-[0.4em] mb-4", center ? "text-purple-500" : "text-purple-500")}>
        {eyebrow}
      </div>
    )}
    <h2 className={cx("text-4xl md:text-5xl font-light tracking-tight leading-tight", center && "mx-auto")}>
      {title}
    </h2>
    {subtitle && (
      <p className={cx("mt-6 text-gray-500 text-lg md:text-xl font-light leading-relaxed", center && "mx-auto")}>
        {subtitle}
      </p>
    )}
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left hover:text-purple-600 transition-colors"
      >
        <span className="text-lg font-medium tracking-tight text-gray-900">{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="mt-4 text-gray-500 font-light leading-relaxed animate-in fade-in slide-in-from-top-2">{answer}</div>}
    </div>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  bullets,
}: {
  icon: any;
  title: string;
  description: string;
  bullets?: string[];
}) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-purple-100 hover:shadow-xl transition-all duration-500 group">
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:dentis-gradient group-hover:text-white transition-all">
      <Icon size={22} strokeWidth={1.5} />
    </div>
    <h4 className="text-xl font-bold mb-3 text-gray-900">{title}</h4>
    <p className="text-gray-400 text-sm font-light leading-relaxed">{description}</p>

    {bullets?.length ? (
      <div className="mt-6 space-y-3">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-gray-500">
            <CheckCircle2 size={18} className="mt-0.5 text-purple-500" />
            <span className="font-light leading-relaxed">{b}</span>
          </div>
        ))}
      </div>
    ) : null}
  </div>
);

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8">
    <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400">{label}</div>
    <div className="mt-3 text-4xl md:text-5xl font-black tracking-tight">{value}</div>
    {hint ? <div className="mt-3 text-sm text-gray-400 font-light">{hint}</div> : null}
  </div>
);

function useScrollSpy(ids: string[], offset = 120) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const handler = () => {
      const y = window.scrollY + offset;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= y) current = id;
      }
      setActive(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [ids, offset]);
  return active;
}

const Modal = ({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
        <div className="p-8 flex items-start justify-between gap-6 border-b border-gray-100">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-purple-500">Dentis</div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{title}</div>
            <div className="mt-2 text-sm text-gray-500 font-light">
              Preencha para entrar na lista de espera e receber acesso prioritário.
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

const LeadForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  // OBS: isso é front-only. Aqui eu deixo "mock" e você pluga no seu backend depois.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    try {
      await new Promise((r) => setTimeout(r, 700)); // mock
      setOk(true);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Nome</label>
          <input
            required
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Perfil</label>
          <select
            required
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200 bg-white"
          >
            <option value="">Selecione</option>
            <option>Dentista / Clínica</option>
            <option>Protético / Laboratório</option>
            <option>Paciente</option>
            <option>Fornecedor</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">WhatsApp</label>
          <input
            required
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="(11) 99999-9999"
            inputMode="tel"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">E-mail</label>
          <input
            required
            type="email"
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="voce@exemplo.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Cidade/UF</label>
          <input
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="São Paulo/SP"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Maior prioridade</label>
          <select className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200 bg-white">
            <option>Organização/Prontuário</option>
            <option>Casos protéticos e laboratório</option>
            <option>Estoque e compras</option>
            <option>Automação e IA</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between gap-4">
        <div className="text-xs text-gray-400 font-light">
          Ao enviar, você concorda com os termos e política de privacidade (placeholders).
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cx(
            "bg-black text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
            loading ? "opacity-60" : "hover:scale-105"
          )}
        >
          {loading ? "Enviando..." : "Quero acesso"}
        </button>
      </div>

      {ok ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 font-light">
          Cadastro recebido. Você entrou na lista de espera ✅
        </div>
      ) : null}
    </form>
  );
};

// ----------------------------------------------------
// Page
// ----------------------------------------------------

const Landing = ({ onStart, onLogin }: { onStart: () => void, onLogin: () => void }) => {
  const navIds = useMemo(() => ["solucao", "como-funciona", "comparativo", "produtos", "seguranca", "faq"], []);
  const activeId = useScrollSpy(navIds, 140);

  const [activeRole, setActiveRole] = useState<"Clinica" | "Lab" | "Marketplace" | "IA">("Clinica");
  const [leadOpen, setLeadOpen] = useState(false);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      {/* Minimal CSS for gradient classes if you don't have them */}
      <style>{`
        .dentis-gradient { background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%); }
        .dentis-gradient-text { 
          background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%); 
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
      `}</style>

      <Modal open={leadOpen} onClose={() => setLeadOpen(false)} title="Entre na lista de espera">
        <LeadForm onSuccess={() => { }} />
      </Modal>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-50 py-4 px-6 md:px-10">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-left">
            <Logo className="w-24 md:w-32" />
          </button>

          <div className="hidden lg:flex items-center space-x-8">
            {[
              ["solucao", "Solução"],
              ["como-funciona", "Como Funciona"],
              ["comparativo", "Comparativo"],
              ["produtos", "Produtos"],
              ["faq", "FAQ"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={cx(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  activeId === id ? "text-black" : "text-gray-400 hover:text-black"
                )}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => setLeadOpen(true)}
              className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
            >
              Lista de Espera
            </button>
          </div>

          <button
            onClick={() => setLeadOpen(true)}
            className="lg:hidden bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 md:pt-48 pb-24 md:pb-32 px-6 md:px-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-24 w-[520px] h-[520px] bg-pink-500/10 blur-[140px] rounded-full" />

        <div className="container mx-auto text-center max-w-6xl">
          <div className="inline-flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full mb-8 border border-gray-100">
            <div className="w-2 h-2 rounded-full dentis-gradient animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
              A Odontologia Conectada em um Só Lugar
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-black mb-8">
            O SUPER APP DA <span className="dentis-gradient-text">ODONTOLOGIA</span>.
          </h1>

          <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-10">
            Dentista, paciente, protético e marketplace — tudo unido por uma identidade única via CPF.
            <br />
            Prontuário, casos protéticos, estoque, compras e comunicação no mesmo fluxo, com análises por IA.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setLeadOpen(true)}
              className="bg-black text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Entrar na Lista de Espera
            </button>
            <button
              onClick={() => scrollTo("produtos")}
              className="bg-white border border-gray-200 text-black px-10 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:bg-gray-50 transition-all flex items-center"
            >
              Ver módulos <ArrowRight size={16} className="ml-3" />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Pill>
              <ShieldCheck size={16} />
              CPF Único
            </Pill>
            <Pill>
              <Database size={16} />
              Dados Integrados
            </Pill>
            <Pill>
              <MessageSquare size={16} />
              Chat Contextual
            </Pill>
            <Pill>
              <ShoppingBag size={16} />
              Marketplace “delivery”
            </Pill>
            <Pill>
              <Sparkles size={16} />
              IA aplicada na rotina
            </Pill>
          </div>

          {/* Trust row (sem inventar logos) */}
          <div className="mt-14 opacity-60">
            <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400">
              Feito para escalar com a sua operação
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {["Consultório", "Clínica", "Laboratório", "Fornecedor"].map((t) => (
                <div key={t} className="bg-gray-50 border border-gray-100 rounded-2xl py-4 text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problema + Solução */}
      <section id="solucao" className="py-24 md:py-32 bg-gray-50/50 px-6 md:px-10">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <SectionTitle
              eyebrow="O problema real"
              title={
                <>
                  Odontologia hoje é <span className="font-black italic">fragmentada</span>.
                </>
              }
              subtitle={
                <>
                  WhatsApp para conversar, planilha para controle, um sistema para agenda, outro para financeiro, e o laboratório
                  em outro mundo. Isso gera ruído, retrabalho e perda de histórico.
                </>
              }
            />

            <div className="bg-white rounded-[3rem] border border-gray-100 p-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400">O Dentis resolve assim</div>
              <div className="mt-6 space-y-4">
                {[
                  ["Um CPF, uma identidade", "Paciente, dentista, protético e fornecedor no mesmo ecossistema."],
                  ["Tudo no contexto do caso", "Mensagens, anexos e status presos à consulta, orçamento ou pedido."],
                  ["Consumo vira estoque e compra", "Procedimento → baixa de material → reposição no marketplace."],
                  ["IA para rotina (não hype)", "Insights, previsões e priorização do que realmente importa."],
                ].map(([t, d]) => (
                  <div key={t} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <BadgeCheck size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-bold tracking-tight">{t}</div>
                      <div className="text-sm text-gray-500 font-light leading-relaxed mt-1">{d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => setLeadOpen(true)} className="bg-black text-white px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                  Quero acesso
                </button>
                <button onClick={() => scrollTo("comparativo")} className="bg-white border border-gray-200 px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
                  Ver comparativo
                </button>
              </div>
            </div>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-4">
            <Stat label="Sem inventar números" value="Provas reais" hint="Use placeholders até ter métricas auditáveis." />
            <Stat label="Rastreabilidade" value="Por caso" hint="Tudo fica registrado e ligado ao fluxo correto." />
            <Stat label="Ecossistema" value="End-to-end" hint="Atendimento → Lab → Estoque → Compra → Entrega." />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-28 md:py-40 px-6 md:px-10 bg-white">
        <div className="container mx-auto">
          <SectionTitle
            eyebrow="Como funciona"
            center
            title={
              <>
                Um fluxo <span className="font-black italic">único</span> do início ao fim.
              </>
            }
            subtitle="Você começa simples e adiciona módulos conforme sua operação cresce."
          />

          <div className="mt-16 grid md:grid-cols-4 gap-10 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-gray-100 -z-10" />
            {[
              { step: "01", title: "Conta CPF Único", desc: "Um login com múltiplos papéis (paciente/dentista/lab/fornecedor)." },
              { step: "02", title: "Caso e registro", desc: "Consulta, orçamento, plano e prontuário organizados no contexto certo." },
              { step: "03", title: "Lab + comunicação", desc: "Pedido protético com checklist, status e conversa dentro do caso." },
              { step: "04", title: "Estoque + marketplace", desc: "Consumo baixa estoque e sugere compra — entrega rastreável." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-6">
                <div className="w-20 h-20 bg-white border border-gray-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <span className="text-sm font-black dentis-gradient-text">{item.step}</span>
                </div>
                <h5 className="font-bold text-lg">{item.title}</h5>
                <p className="text-gray-500 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativo */}
      <section id="comparativo" className="py-28 md:py-36 px-6 md:px-10 bg-gray-50/50">
        <div className="container mx-auto">
          <SectionTitle
            eyebrow="Comparativo"
            title={
              <>
                Dentis vs. <span className="font-black italic">WhatsApp + planilha</span>
              </>
            }
            subtitle="O que muda quando tudo passa a conversar no mesmo sistema."
          />

          <div className="mt-12 overflow-hidden rounded-[3rem] border border-gray-100 bg-white">
            <div className="grid grid-cols-3">
              <div className="p-6 md:p-8 border-b border-gray-100 text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400">
                Critério
              </div>
              <div className="p-6 md:p-8 border-b border-gray-100 text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400">
                Fragmentado
              </div>
              <div className="p-6 md:p-8 border-b border-gray-100 text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400">
                Dentis
              </div>

              {[
                ["Histórico", "Perde contexto", "Vira linha do tempo por CPF"],
                ["Comunicação", "Solta no chat", "Chat preso ao caso/consulta/pedido"],
                ["Lab/Protético", "Status manual", "Checklist + etapas + notificação"],
                ["Estoque", "Contagem esporádica", "Baixa por consumo + alerta"],
                ["Compra", "Pesquisa e retrabalho", "Marketplace rápido com recompra"],
                ["Análises", "Quase nunca", "Insights e previsões por IA"],
              ].map(([crit, a, b]) => (
                <React.Fragment key={crit}>
                  <div className="p-6 md:p-8 border-b border-gray-50 font-bold">{crit}</div>
                  <div className="p-6 md:p-8 border-b border-gray-50 text-gray-500 font-light">{a}</div>
                  <div className="p-6 md:p-8 border-b border-gray-50 text-gray-900 font-light">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-purple-600" />
                      {b}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Pill>
              <Lock size={16} /> LGPD / Privacidade
            </Pill>
            <Pill>
              <FileText size={16} /> Rastreabilidade por caso
            </Pill>
            <Pill>
              <Truck size={16} /> Compras com logística
            </Pill>
          </div>
        </div>
      </section>

      {/* Produtos / módulos */}
      <section id="produtos" className="py-28 md:py-40 px-6 md:px-10 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <SectionTitle
              eyebrow="Módulos"
              title={
                <>
                  Poder para todos os <span className="font-black">perfis</span>.
                </>
              }
              subtitle="Comece com o essencial e evolua para o ecossistema completo."
            />

            <div className="flex bg-white p-1.5 rounded-full border border-gray-100 self-start md:self-auto">
              {(["Clinica", "Lab", "Marketplace", "IA"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={cx(
                    "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeRole === role ? "bg-black text-white" : "text-gray-400 hover:text-black"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeRole === "Clinica" && (
              <>
                <FeatureCard
                  icon={Smartphone}
                  title="Agenda + confirmações"
                  description="Reduza faltas e organize retornos com fluxo simples."
                  bullets={["Confirmação e lembretes", "Retornos programáveis", "Visão do dia/semana"]}
                />
                <FeatureCard
                  icon={Database}
                  title="Prontuário e planos"
                  description="Registro clínico, orçamentos e histórico por CPF."
                  bullets={["Evolução do paciente", "Orçamentos no contexto", "Documentos e anexos"]}
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Financeiro e operação"
                  description="Cobranças, pendências e visão gerencial sem planilha."
                  bullets={["Status por paciente", "Controle de recebíveis", "Indicadores básicos"]}
                />
              </>
            )}

            {activeRole === "Lab" && (
              <>
                <FeatureCard
                  icon={Briefcase}
                  title="Gestão de casos protéticos"
                  description="Pedido, checklist e etapas centralizados."
                  bullets={["Checklist do caso", "Prazos e etapas", "Padronização do envio"]}
                />
                <FeatureCard
                  icon={Activity}
                  title="Status e rastreabilidade"
                  description="Tudo atualizado, sem ruído."
                  bullets={["Notificações por etapa", "Histórico por paciente", "Menos retrabalho"]}
                />
                <FeatureCard
                  icon={Package}
                  title="Entrega e logística"
                  description="Controle de envio/retirada, com clareza."
                  bullets={["Rastreamento", "Confirmação de entrega", "Organização por prioridade"]}
                />
              </>
            )}

            {activeRole === "Marketplace" && (
              <>
                <FeatureCard
                  icon={ShoppingBag}
                  title="Marketplace estilo delivery"
                  description="Recompra rápida e experiência simples."
                  bullets={["Favoritos", "Repetir pedidos", "Catálogo por categorias"]}
                />
                <FeatureCard
                  icon={Layers}
                  title="Estoque conectado"
                  description="Consumo vira reposição."
                  bullets={["Mínimo e alertas", "Validade", "Integração com compra"]}
                />
                <FeatureCard
                  icon={Zap}
                  title="Logística inteligente"
                  description="Pedidos, prazos e rastreio no mesmo lugar."
                  bullets={["Status de pedido", "Entrega e confirmação", "Organização por recorrência"]}
                />
              </>
            )}

            {activeRole === "IA" && (
              <>
                <FeatureCard
                  icon={Sparkles}
                  title="Insights operacionais"
                  description="O que está travando sua operação — sem achismo."
                  bullets={["Faltas e ociosidade", "Tendências de consumo", "Alertas de gargalo"]}
                />
                <FeatureCard
                  icon={Search}
                  title="Prioridade automática"
                  description="Triagem de mensagens e demandas por contexto."
                  bullets={["Organiza urgências", "Contexto por caso", "Menos perda de informação"]}
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="IA com responsabilidade"
                  description="IA para apoiar processo, não para inventar clínica."
                  bullets={["Sugestões operacionais", "Previsões de demanda/estoque", "Sem promessas irreais"]}
                />
              </>
            )}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
                <Building2 size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="font-bold tracking-tight">Quer ver o Dentis na sua rotina?</div>
                <div className="text-sm text-gray-500 font-light">Entre na lista e receba acesso prioritário + demo guiada.</div>
              </div>
            </div>
            <button
              onClick={() => setLeadOpen(true)}
              className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
            >
              Pedir acesso
            </button>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section id="seguranca" className="py-28 md:py-36 px-6 md:px-10 bg-gray-50/50">
        <div className="container mx-auto grid lg:grid-cols-2 gap-14 items-start">
          <SectionTitle
            eyebrow="Segurança e confiança"
            title={
              <>
                Dados sensíveis pedem <span className="font-black italic">cuidado real</span>.
              </>
            }
            subtitle="Sem prometer o que você ainda não implementou: aqui você explica princípios e práticas."
          />

          <div className="bg-white rounded-[3rem] border border-gray-100 p-10">
            <div className="space-y-5">
              {[
                { icon: Lock, t: "Privacidade por padrão", d: "Acesso por permissões e registro de ações (auditoria)." },
                { icon: ShieldCheck, t: "LGPD", d: "Clareza de consentimento e transparência de uso." },
                { icon: FileText, t: "Rastreabilidade", d: "Histórico por CPF e por caso, com contexto preservado." },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <x.icon size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold">{x.t}</div>
                    <div className="text-sm text-gray-500 font-light mt-1 leading-relaxed">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-100 p-5 text-sm text-gray-500 font-light">
              Dica: quando você tiver a implementação (ex.: criptografia, 2FA, backups), troque esse bloco por bullets específicos e verificáveis.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 md:py-40 px-6 md:px-10 bg-white">
        <div className="container mx-auto max-w-4xl">
          <SectionTitle
            center
            eyebrow="FAQ"
            title={
              <>
                Dúvidas <span className="font-black">frequentes</span>
              </>
            }
          />

          <div className="mt-10 space-y-2">
            <FAQItem
              question="O que é CPF único?"
              answer="É o conceito central: a identidade digital do usuário é vinculada ao CPF. Assim, o histórico e os vínculos (paciente, dentista, laboratório e compras) ficam conectados com rastreabilidade."
            />
            <FAQItem
              question="Funciona para consultório pequeno?"
              answer="Sim. O Dentis é modular: dá para começar com agenda/prontuário e ir adicionando laboratório, estoque e marketplace conforme a demanda."
            />
            <FAQItem
              question="Como integra laboratório/protético?"
              answer="O dentista cria o caso protético com checklist e anexos; o laboratório recebe, atualiza etapas, prazos e status. A conversa fica registrada no contexto do caso."
            />
            <FAQItem
              question="O marketplace entrega em todo Brasil?"
              answer="Depende da sua operação/logística. Na landing, use uma mensagem honesta: 'Estamos expandindo cobertura' ou 'consulte disponibilidade'."
            />
            <FAQItem
              question="Como funciona o estoque inteligente?"
              answer="O estoque registra entradas/saídas e alertas. Quando integrado ao consumo dos procedimentos, ele sugere reposição e conecta com o marketplace."
            />
            <FAQItem
              question="A IA faz o quê exatamente?"
              answer="IA aplicada para insights operacionais e previsões (ex.: demanda/estoque), organização de mensagens por contexto e alertas de gargalo. Evite promessas clínicas irreais."
            />
            <FAQItem
              question="Posso usar só uma parte do sistema?"
              answer="Sim. Você pode usar apenas o que faz sentido hoje e evoluir depois."
            />
            <FAQItem
              question="Privacidade e LGPD"
              answer="Explique princípios e, quando tiver, detalhes verificáveis (permissões, auditoria, criptografia, backups, 2FA)."
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-28 md:py-40 px-6 md:px-10 bg-black text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-[0.95]">
            Pronto pra <span className="italic font-light opacity-60">desfragmentar</span> sua operação?
          </h2>
          <p className="text-gray-300 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
            Entre na lista de espera e receba acesso prioritário + demo guiada do fluxo completo (clínica, lab, estoque e marketplace).
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setLeadOpen(true)}
              className="bg-white text-black px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all"
            >
              Entrar na lista
            </button>
            <button
              onClick={() => scrollTo("comparativo")}
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 hover:text-white transition-all"
            >
              Ver comparativo
            </button>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { icon: Users, t: "Ecossistema", d: "Paciente • Dentista • Protético • Fornecedor" },
              { icon: MessageSquare, t: "Contexto", d: "Conversa presa ao caso, sem ruído" },
              { icon: ShoppingBag, t: "Marketplace", d: "Recompra rápida e estoque conectado" },
            ].map((x) => (
              <div key={x.t} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-left">
                <x.icon className="text-purple-300" size={22} />
                <div className="mt-4 font-bold">{x.t}</div>
                <div className="mt-2 text-sm text-gray-300 font-light">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-10 bg-white border-t border-gray-100">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <Logo className="w-32" />
          <div className="flex space-x-10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-black">Privacidade</a>
            <a href="#" className="hover:text-black">Termos</a>
            <a href="#" className="hover:text-black">Segurança</a>
          </div>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black cursor-pointer transition-colors">
              <Instagram size={18} />
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black cursor-pointer transition-colors">
              <Twitter size={18} />
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-10 pt-10 border-t border-gray-50 text-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300">
            © {new Date().getFullYear()} Dentis. Toda a odontologia conectada.
          </span>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50 px-6">
        <button
          onClick={() => setLeadOpen(true)}
          className="w-full bg-black text-white py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.35em] shadow-2xl"
        >
          Entrar na lista de espera
        </button>
      </div>
    </div>
  );
};
export default Landing;