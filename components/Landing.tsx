import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Menu,
} from "lucide-react";

// ----------------------------------------------------
// UI bits
// ----------------------------------------------------

const cx = (...s: Array<string | false | undefined | null>) => s.filter(Boolean).join(" ");

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={cx("flex flex-col items-start", className)}>
    <span
      className="text-3xl md:text-4xl font-normal tracking-tight text-foreground leading-none"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      Dentis
    </span>
    <div className="h-[4px] w-full mt-1.5 aurora-gradient rounded-full" />
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
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
      <div className={cx("text-[10px] font-bold uppercase tracking-[0.4em] mb-4 text-primary", center && "")}>
        {eyebrow}
      </div>
    )}
    <h2 className={cx("text-4xl md:text-5xl font-light tracking-tight leading-tight text-foreground", center && "mx-auto")}>
      {title}
    </h2>
    {subtitle && (
      <p className={cx("mt-6 text-muted-foreground text-lg md:text-xl font-light leading-relaxed", center && "mx-auto")}>
        {subtitle}
      </p>
    )}
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex justify-between items-center text-left hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 -m-2"
      >
        <span className="text-lg font-medium tracking-tight text-foreground">{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="mt-4 text-muted-foreground font-light leading-relaxed">{answer}</div>}
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
  <div className="bg-card p-8 rounded-[2.5rem] border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-500 group">
    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
      <Icon size={22} strokeWidth={1.5} />
    </div>
    <h4 className="text-xl font-bold mb-3 text-foreground">{title}</h4>
    <p className="text-muted-foreground text-sm font-light leading-relaxed">{description}</p>

    {bullets?.length ? (
      <div className="mt-6 space-y-3">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle2 size={18} className="mt-0.5 text-primary" />
            <span className="font-light leading-relaxed">{b}</span>
          </div>
        ))}
      </div>
    ) : null}
  </div>
);

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="bg-card border border-border rounded-[2.5rem] p-8 relative overflow-hidden group">
    <div className="absolute inset-0 aurora-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative">
      <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-4xl md:text-5xl font-black tracking-tight aurora-gradient-text">{value}</div>
      {hint ? <div className="mt-3 text-sm text-muted-foreground font-light">{hint}</div> : null}
    </div>
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
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
        <div className="p-8 flex items-start justify-between gap-6 border-b border-border">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">Dentis</div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{title}</div>
            <div className="mt-2 text-sm text-muted-foreground font-light">
              Preencha para entrar na lista de espera e receber acesso prioritário.
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition"
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    try {
      await new Promise((r) => setTimeout(r, 700));
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
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Nome</label>
          <input
            required
            className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Perfil</label>
          <select
            required
            className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground"
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
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">WhatsApp</label>
          <input
            required
            className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="(11) 99999-9999"
            inputMode="tel"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">E-mail</label>
          <input
            required
            type="email"
            className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="voce@exemplo.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Cidade/UF</label>
          <input
            className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="São Paulo/SP"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Maior prioridade</label>
          <select className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground">
            <option>Organização/Prontuário</option>
            <option>Casos protéticos e laboratório</option>
            <option>Estoque e compras</option>
            <option>Automação e IA</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground font-light">
          Ao enviar, você concorda com os termos e política de privacidade.
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cx(
            "bg-primary text-primary-foreground px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
            loading ? "opacity-60" : "hover:scale-105"
          )}
        >
          {loading ? "Enviando..." : "Quero acesso"}
        </button>
      </div>

      {ok ? (
        <div className="mt-4 rounded-2xl border border-success-border bg-success-bg px-4 py-3 text-sm text-success font-light">
          Cadastro recebido. Você entrou na lista de espera ✅
        </div>
      ) : null}
    </form>
  );
};

// Mobile Menu Component
const MobileMenu = ({ onClose, scrollTo }: { onClose: () => void; scrollTo: (id: string) => void }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const navLinks: Array<[string, string]> = [
    ["solucao", "Solução"],
    ["como-funciona", "Como Funciona"],
    ["comparativo", "Comparativo"],
    ["produtos", "Produtos"],
    ["faq", "FAQ"],
  ];

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <div className="absolute inset-0 bg-foreground/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-card border-l border-border ml-auto w-[280px] h-full p-6 flex flex-col shadow-2xl">
        <button onClick={onClose} className="self-end text-foreground hover:text-primary transition-colors" aria-label="Fechar menu">
          <X size={24} />
        </button>
        <nav className="mt-8 flex flex-col gap-6">
          {navLinks.map(([id, label]) => (
            <button
              key={id}
              onClick={() => { scrollTo(id); onClose(); }}
              className="text-left text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              {label}
            </button>
          ))}
          <button className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
            Lista de Espera
          </button>
        </nav>
      </div>
    </div>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div className="bg-background min-h-screen selection:bg-primary selection:text-primary-foreground">
      <Modal open={leadOpen} onClose={() => setLeadOpen(false)} title="Entre na lista de espera">
        <LeadForm onSuccess={() => { }} />
      </Modal>

      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} scrollTo={scrollTo} />}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border py-4 px-6 md:px-10">
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
                  activeId === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => setLeadOpen(true)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
            >
              Lista de Espera
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-foreground"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="scroll-mt-24 relative pt-40 md:pt-48 pb-24 md:pb-32 px-6 md:px-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-primary/10 dark:bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-24 w-[520px] h-[520px] blur-[140px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, hsl(var(--violet-hint) / 0.1) 0%, transparent 70%)' }} />

        <div className="container mx-auto text-center max-w-6xl relative">
          <div className="inline-flex items-center space-x-2 bg-card px-4 py-2 rounded-full mb-8 border border-border">
            <div className="w-2 h-2 rounded-full aurora-gradient animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              A Odontologia Conectada em um Só Lugar
            </span>
          </div>

          <h1 className="font-black tracking-tighter leading-[0.92] text-foreground mb-8"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}>
            O SUPER APP DA <span className="aurora-gradient-text">ODONTOLOGIA</span>.
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-10">
            Dentista, paciente, protético e marketplace — tudo unido por uma identidade única via CPF.
            <br />
            Prontuário, casos protéticos, estoque, compras e comunicação no mesmo fluxo, com análises por IA.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setLeadOpen(true)}
              className="bg-primary text-primary-foreground px-10 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Entrar na Lista de Espera
            </button>
            <button
              onClick={() => scrollTo("produtos")}
              className="bg-card border border-border text-foreground px-10 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:bg-muted transition-all flex items-center"
            >
              Ver módulos <ArrowRight size={16} className="ml-3" />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Pill>
              <ShieldCheck size={16} className="text-primary" />
              CPF Único
            </Pill>
            <Pill>
              <Database size={16} className="text-primary" />
              Dados Integrados
            </Pill>
            <Pill>
              <MessageSquare size={16} className="text-primary" />
              Chat Contextual
            </Pill>
            <Pill>
              <ShoppingBag size={16} className="text-primary" />
              Marketplace "delivery"
            </Pill>
            <Pill>
              <Sparkles size={16} className="text-primary" />
              IA aplicada na rotina
            </Pill>
          </div>

          {/* Trust row */}
          <div className="mt-14 opacity-60">
            <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
              Feito para escalar com a sua operação
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {["Consultório", "Clínica", "Laboratório", "Fornecedor"].map((t) => (
                <div key={t} className="bg-muted border border-border rounded-2xl py-4 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problema + Solução */}
      <section id="solucao" className="scroll-mt-24 py-24 md:py-32 bg-muted/50 px-6 md:px-10">
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

            <div className="bg-card rounded-[3rem] border border-border p-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">O Dentis resolve assim</div>
              <div className="mt-6 space-y-4">
                {[
                  ["Um CPF, uma identidade", "Paciente, dentista, protético e fornecedor no mesmo ecossistema."],
                  ["Tudo no contexto do caso", "Mensagens, anexos e status presos à consulta, orçamento ou pedido."],
                  ["Consumo vira estoque e compra", "Procedimento → baixa de material → reposição no marketplace."],
                  ["IA para rotina (não hype)", "Insights, previsões e priorização do que realmente importa."],
                ].map(([t, d]) => (
                  <div key={t} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center">
                      <BadgeCheck size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-bold tracking-tight text-foreground">{t}</div>
                      <div className="text-sm text-muted-foreground font-light leading-relaxed mt-1">{d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => setLeadOpen(true)} className="bg-primary text-primary-foreground px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                  Quero acesso
                </button>
                <button onClick={() => scrollTo("comparativo")} className="bg-background border border-border px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">
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
      <section id="como-funciona" className="scroll-mt-24 py-28 md:py-40 px-6 md:px-10 bg-background">
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
            <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-border -z-10" />
            {[
              { step: "01", title: "Conta CPF Único", desc: "Um login com múltiplos papéis (paciente/dentista/lab/fornecedor)." },
              { step: "02", title: "Caso e registro", desc: "Consulta, orçamento, plano e prontuário organizados no contexto certo." },
              { step: "03", title: "Lab + comunicação", desc: "Pedido protético com checklist, status e conversa dentro do caso." },
              { step: "04", title: "Estoque + marketplace", desc: "Consumo baixa estoque e sugere compra — entrega rastreável." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-6">
                <div className="w-20 h-20 bg-card border border-border rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <span className="text-sm font-black aurora-gradient-text">{item.step}</span>
                </div>
                <h5 className="font-bold text-lg text-foreground">{item.title}</h5>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativo */}
      <section id="comparativo" className="scroll-mt-24 py-28 md:py-36 px-6 md:px-10 bg-muted/50">
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

          <div className="mt-12 overflow-hidden rounded-[3rem] border border-border bg-card">
            <div className="grid grid-cols-3">
              <div className="p-6 md:p-8 border-b border-border text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
                Critério
              </div>
              <div className="p-6 md:p-8 border-b border-border text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
                Fragmentado
              </div>
              <div className="p-6 md:p-8 border-b border-border text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
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
                  <div className="p-6 md:p-8 border-b border-border/50 font-bold text-foreground">{crit}</div>
                  <div className="p-6 md:p-8 border-b border-border/50 text-muted-foreground font-light">{a}</div>
                  <div className="p-6 md:p-8 border-b border-border/50 text-foreground font-light">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-primary" />
                      {b}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Pill>
              <Lock size={16} className="text-primary" /> LGPD / Privacidade
            </Pill>
            <Pill>
              <FileText size={16} className="text-primary" /> Rastreabilidade por caso
            </Pill>
            <Pill>
              <Truck size={16} className="text-primary" /> Compras com logística
            </Pill>
          </div>
        </div>
      </section>

      {/* Produtos / módulos */}
      <section id="produtos" className="scroll-mt-24 py-28 md:py-40 px-6 md:px-10 bg-background">
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

            <div className="flex bg-card p-1.5 rounded-full border border-border self-start md:self-auto">
              {(["Clinica", "Lab", "Marketplace", "IA"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={cx(
                    "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeRole === role
                      ? "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2"
                      : "text-muted-foreground hover:text-foreground"
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

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted border border-border rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
                <Building2 size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-bold tracking-tight text-foreground">Quer ver o Dentis na sua rotina?</div>
                <div className="text-sm text-muted-foreground font-light">Entre na lista e receba acesso prioritário + demo guiada.</div>
              </div>
            </div>
            <button
              onClick={() => setLeadOpen(true)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
            >
              Pedir acesso
            </button>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section id="seguranca" className="scroll-mt-24 py-28 md:py-36 px-6 md:px-10 bg-muted/50">
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

          <div className="bg-card rounded-[3rem] border border-border p-10">
            <div className="space-y-5">
              {[
                { icon: Lock, t: "Privacidade por padrão", d: "Acesso por permissões e registro de ações (auditoria)." },
                { icon: ShieldCheck, t: "LGPD", d: "Clareza de consentimento e transparência de uso." },
                { icon: FileText, t: "Rastreabilidade", d: "Histórico por CPF e por caso, com contexto preservado." },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center">
                    <x.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{x.t}</div>
                    <div className="text-sm text-muted-foreground font-light mt-1 leading-relaxed">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-muted border border-border p-5 text-sm text-muted-foreground font-light">
              Dica: quando você tiver a implementação (ex.: criptografia, 2FA, backups), troque esse bloco por bullets específicos e verificáveis.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 py-28 md:py-40 px-6 md:px-10 bg-background">
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
      <section className="py-28 md:py-40 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground dark:bg-primary/10" />
        <div className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0%, transparent 50%)' }} />

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-[0.95] text-background dark:text-foreground">
            Pronto pra <span className="italic font-light opacity-60">desfragmentar</span> sua operação?
          </h2>
          <p className="text-background/80 dark:text-foreground/80 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
            Entre na lista de espera e receba acesso prioritário + demo guiada do fluxo completo (clínica, lab, estoque e marketplace).
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setLeadOpen(true)}
              className="bg-background text-foreground dark:bg-primary dark:text-primary-foreground px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl"
            >
              Entrar na lista
            </button>
            <button
              onClick={() => scrollTo("comparativo")}
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-background/70 dark:text-foreground/70 hover:text-background dark:hover:text-foreground transition-all"
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
              <div key={x.t} className="bg-background/5 dark:bg-card/50 border border-background/10 dark:border-border rounded-[2.5rem] p-8 text-left backdrop-blur-sm">
                <x.icon className="text-background dark:text-primary" size={22} />
                <div className="mt-4 font-bold text-background dark:text-foreground">{x.t}</div>
                <div className="mt-2 text-sm text-background/70 dark:text-muted-foreground font-light">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-10 bg-card border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <Logo className="w-32" />
          <div className="flex space-x-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <a href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="/termos" className="hover:text-foreground transition-colors">Termos</a>
            <a href="/seguranca" className="hover:text-foreground transition-colors">Segurança</a>
          </div>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition-colors">
              <Instagram size={18} />
            </div>
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition-colors">
              <Twitter size={18} />
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-10 pt-10 border-t border-border/50 text-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
            © {new Date().getFullYear()} Dentis. Toda a odontologia conectada.
          </span>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50 px-6">
        <button
          onClick={() => setLeadOpen(true)}
          className="w-full bg-primary text-primary-foreground py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.35em] shadow-2xl hover:scale-105 transition-all"
        >
          Entrar na lista de espera
        </button>
      </div>
    </div>
  );
};
export default Landing;