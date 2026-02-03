import React, { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Package,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Layers,
  Activity,
  Database,
} from "lucide-react";
import AuthModal from "./AuthModal";

function cx(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-[28px] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow)]", className)}>
      {children}
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
      <span className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[var(--muted)]">{children}</span>
    </div>
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "rounded-full px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.32em]",
        "bg-[var(--primary)] text-white hover:opacity-95 active:opacity-90 transition",
        props.className
      )}
    />
  );
}

function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "rounded-full px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.32em]",
        "border border-[var(--border)] bg-white/70 text-[var(--text)] hover:bg-white transition backdrop-blur",
        props.className
      )}
    />
  );
}

function Chip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)] backdrop-blur">
      <Icon size={16} className="text-[var(--accent)]" />
      {label}
    </div>
  );
}

function useSceneProgress(ref: React.RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  return scrollYProgress;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)] py-5">
      <button className="w-full text-left flex items-center justify-between gap-6" onClick={() => setOpen((v) => !v)}>
        <div className="text-lg font-black tracking-tight">{q}</div>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[var(--muted)]">{open ? "Fechar" : "Abrir"}</div>
      </button>
      {open ? <div className="mt-3 text-[15px] font-medium leading-relaxed text-[var(--muted)]">{a}</div> : null}
    </div>
  );
}

export default function LandingExperience() {
  const reduce = useReducedMotion();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const openSignIn = () => {
    setAuthMode("signin");
    setAuthOpen(true);
  };
  const openSignUp = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const s1Ref = useRef<HTMLElement>(null);
  const s2Ref = useRef<HTMLElement>(null);
  const s3Ref = useRef<HTMLElement>(null);
  const s4Ref = useRef<HTMLElement>(null);

  const p1 = useSceneProgress(s1Ref);
  const p2 = useSceneProgress(s2Ref);
  const p3 = useSceneProgress(s3Ref);
  const p4 = useSceneProgress(s4Ref);

  // Scene 1 (Hero)
  const heroY = useTransform(p1, [0, 1], reduce ? [0, 0] : [18, -10]);
  const heroScale = useTransform(p1, [0, 1], reduce ? [1, 1] : [0.985, 1.02]);
  const heroOpacity = useTransform(p1, [0, 0.25, 1], reduce ? [1, 1, 1] : [0.82, 1, 1]);
  const heroBlur = useTransform(p1, [0, 0.35, 1], reduce ? [0, 0, 0] : [10, 0, 0]);

  const previewY = useTransform(p1, [0, 1], reduce ? [0, 0] : [22, -16]);

  // Scene 2 (Before/After reveal)
  const beforeX = useTransform(p2, [0, 1], reduce ? [0, 0] : [0, -120]);
  const afterX = useTransform(p2, [0, 1], reduce ? [0, 0] : [120, 0]);
  const divider = useTransform(p2, [0, 1], reduce ? ["50%", "50%"] : ["50%", "62%"]);

  // Scene 3 (Stack modules)
  const stack1Y = useTransform(p3, [0, 1], reduce ? [0, 0] : [26, -16]);
  const stack1R = useTransform(p3, [0, 1], reduce ? [0, 0] : [-2.0, 0.7]);
  const stack2Y = useTransform(p3, [0, 1], reduce ? [0, 0] : [14, -8]);
  const stack2R = useTransform(p3, [0, 1], reduce ? [0, 0] : [-1.1, 0.4]);
  const stack3Y = useTransform(p3, [0, 1], reduce ? [0, 0] : [6, -12]);
  const stack3R = useTransform(p3, [0, 1], reduce ? [0, 0] : [-0.5, 0.2]);

  // Scene 4 (Finale)
  const finaleY = useTransform(p4, [0, 1], reduce ? [0, 0] : [18, 0]);
  const finaleScale = useTransform(p4, [0, 1], reduce ? [1, 1] : [0.985, 1]);
  const finaleOpacity = useTransform(p4, [0, 0.3, 1], reduce ? [1, 1, 1] : [0.7, 1, 1]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AuthModal open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} onModeChange={setAuthMode} />

      {/* NAV editorial (Zara/Apple) */}
      <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-[min(1100px,92vw)] items-center justify-between py-4">
          <button className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="h-10 w-10 rounded-2xl bg-[var(--primary)]" />
            <div className="leading-none text-left">
              <div className="text-lg font-black tracking-tight">Dentis</div>
              <div className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)]">ecossistema odontológico</div>
            </div>
          </button>

          <div className="hidden sm:flex items-center gap-4">
            <button className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[var(--muted)] hover:text-[var(--text)] transition" onClick={() => scrollTo("como")}>
              Como funciona
            </button>
            <button className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[var(--muted)] hover:text-[var(--text)] transition" onClick={() => scrollTo("modulos")}>
              Módulos
            </button>
            <button className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[var(--muted)] hover:text-[var(--text)] transition" onClick={() => scrollTo("faq")}>
              FAQ
            </button>
            <GhostButton onClick={openSignIn}>Entrar</GhostButton>
            <PrimaryButton onClick={openSignUp}>Criar conta</PrimaryButton>
          </div>

          <div className="sm:hidden flex items-center gap-2">
            <GhostButton onClick={openSignIn}>Entrar</GhostButton>
            <PrimaryButton onClick={openSignUp}>Criar</PrimaryButton>
          </div>
        </div>
      </div>

      {/* SCENE 1 — HERO CINEMÁTICO */}
      <section ref={s1Ref as any} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div className="mx-auto grid w-[min(1100px,92vw)] grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <motion.div
              style={{
                y: heroY,
                scale: heroScale,
                opacity: heroOpacity,
                filter: useTransform(heroBlur, (v) => `blur(${v}px)`),
              }}
            >
              <Panel className="relative overflow-hidden p-7 md:p-9">
                <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-25 blur-[90px]"
                  style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
                />
                <div className="pointer-events-none absolute -left-36 -bottom-36 h-[520px] w-[520px] rounded-full opacity-20 blur-[110px]"
                  style={{ background: "radial-gradient(circle, rgba(0,0,0,0.14), transparent 60%)" }}
                />

                <Kicker>A odontologia, agora em fluxo</Kicker>

                <h1 className="mt-4 text-[clamp(44px,5.8vw,84px)] font-black leading-[0.92] tracking-[-0.04em]">
                  Tudo em um só lugar.
                  <br />
                  <span className="text-[var(--muted)]">Clínica • Lab • Estoque • Compra • IA</span>
                </h1>

                <p className="mt-4 max-w-2xl text-[18px] font-medium leading-relaxed text-[var(--muted)]">
                  Paciente, dentista, protético e fornecedores conectados por CPF único — com chat contextual, estoque → compra e análises com IA.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <PrimaryButton onClick={openSignUp}>Criar conta</PrimaryButton>
                  <GhostButton onClick={openSignIn}>
                    Entrar <ArrowRight size={16} className="ml-2 inline" />
                  </GhostButton>
                  <div className="ml-auto hidden h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--accent)] to-black/30 lg:block" />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Chip icon={ShieldCheck} label="CPF único" />
                  <Chip icon={MessageSquare} label="Chat contextual" />
                  <Chip icon={Package} label="Estoque" />
                  <Chip icon={ShoppingBag} label="Marketplace" />
                  <Chip icon={Sparkles} label="IA aplicada" />
                </div>
              </Panel>
            </motion.div>

            <motion.div style={{ y: previewY }} className="hidden lg:block">
              <Panel className="p-7">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Preview (conceito)</div>
                <div className="mt-4 space-y-3">
                  {[
                    { t: "Caso protético #452", d: "Checklist + anexos + prazos", tag: "Em produção" },
                    { t: "Estoque inteligente", d: "Consumo → alerta → reposição", tag: "Repor" },
                    { t: "IA útil", d: "prioriza urgência + sugere demanda", tag: "Insights" },
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-black">{x.t}</div>
                        <div className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)]">
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
                          {x.tag}
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-[var(--muted)]">{x.d}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm font-medium text-[var(--muted)]">(Depois você troca isso por prints reais.)</div>
              </Panel>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCENE 2 — BEFORE / AFTER (reveal) */}
      <section id="como" ref={s2Ref as any} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div className="mx-auto w-[min(1100px,92vw)]">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Problema → solução</div>
                <h2 className="mt-3 text-[clamp(28px,3.4vw,46px)] font-black leading-[1.05] tracking-[-0.03em]">
                  Antes: caos e retrabalho.
                  <br />
                  <span className="text-[var(--muted)]">Depois: fluxo e rastreabilidade.</span>
                </h2>
                <p className="mt-3 max-w-xl text-[18px] font-medium leading-relaxed text-[var(--muted)]">
                  O Dentis não é “mais um sistema”. É um ecossistema onde cada ação (caso, mensagem, compra) fica no contexto certo.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    "WhatsApp solto → conversa no contexto do caso",
                    "Planilha → estoque conectado ao consumo",
                    "Pedido manual → recompra rápida no marketplace",
                    "Desorganização → histórico por identidade (CPF)",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white/70 p-4 backdrop-blur">
                      <CheckCircle2 size={18} className="mt-0.5 text-[var(--accent)]" />
                      <div className="text-sm font-semibold text-[var(--muted)] leading-relaxed">{t}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <PrimaryButton onClick={openSignUp}>Criar conta</PrimaryButton>
                  <GhostButton onClick={openSignIn}>Entrar</GhostButton>
                </div>
              </div>

              <Panel className="relative overflow-hidden p-0">
                {/* reveal line */}
                <motion.div
                  style={{ left: divider }}
                  className="pointer-events-none absolute top-0 z-20 h-full w-[2px] bg-[var(--accent)]"
                />
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <motion.div style={{ x: beforeX }} className="p-6 md:p-7 border-b md:border-b-0 md:border-r border-[var(--border)]">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Antes</div>
                    <div className="mt-2 text-xl font-black">Fragmentado</div>
                    <div className="mt-3 space-y-3">
                      {["WhatsApp perdido", "Planilhas", "Sistemas isolados", "Pedido manual"].map((t) => (
                        <div key={t} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                          <div className="font-black">{t}</div>
                          <div className="mt-1 text-sm font-medium text-[var(--muted)]">Sem contexto, sem histórico.</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div style={{ x: afterX }} className="p-6 md:p-7">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Depois</div>
                    <div className="mt-2 text-xl font-black">Conectado</div>
                    <div className="mt-3 space-y-3">
                      {["Caso com chat", "Lab por etapas", "Estoque conectado", "Compra tipo delivery"].map((t) => (
                        <div key={t} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                          <div className="font-black">{t}</div>
                          <div className="mt-1 text-sm font-medium text-[var(--muted)]">Tudo no fluxo.</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 3 — STACK (módulos) */}
      <section id="modulos" ref={s3Ref as any} className="relative h-[240vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div className="mx-auto w-[min(1100px,92vw)]">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Módulos</div>
                <h2 className="mt-3 text-[clamp(28px,3.4vw,46px)] font-black leading-[1.05] tracking-[-0.03em]">
                  Um super app modular —
                  <br />
                  <span className="text-[var(--muted)]">do consultório ao fornecedor.</span>
                </h2>
                <p className="mt-3 max-w-xl text-[18px] font-medium leading-relaxed text-[var(--muted)]">
                  Começa com o essencial e evolui para o ecossistema completo. O importante: tudo fala com tudo.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    { icon: Database, t: "Clínica", d: "Agenda, prontuário e financeiro no contexto do CPF/caso." },
                    { icon: Activity, t: "Laboratório", d: "Casos protéticos com etapas, prazos e status." },
                    { icon: Layers, t: "Estoque + Marketplace", d: "Consumo baixa estoque e sugere reposição." },
                  ].map(({ icon: Icon, t, d }) => (
                    <div key={t} className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 backdrop-blur">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border)] bg-white">
                          <Icon size={18} className="text-[var(--accent)]" />
                        </div>
                        <div>
                          <div className="font-black">{t}</div>
                          <div className="mt-1 text-sm font-medium text-[var(--muted)]">{d}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <PrimaryButton onClick={openSignUp}>Criar conta</PrimaryButton>
                  <GhostButton onClick={openSignIn}>Entrar</GhostButton>
                </div>
              </div>

              <div className="relative mt-6 lg:mt-0">
                <motion.div style={{ y: stack3Y, rotate: stack3R }} className="absolute right-0 top-14 w-[min(520px,92vw)]">
                  <Panel className="p-6">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Marketplace</div>
                    <div className="mt-2 text-xl font-black">Recompra rápida</div>
                    <div className="mt-2 text-sm font-medium text-[var(--muted)]">Favoritos, recorrência e entrega com status.</div>
                  </Panel>
                </motion.div>

                <motion.div style={{ y: stack2Y, rotate: stack2R }} className="absolute left-6 top-6 w-[min(560px,92vw)]">
                  <Panel className="p-6">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Laboratório</div>
                    <div className="mt-2 text-xl font-black">Casos por etapa</div>
                    <div className="mt-2 text-sm font-medium text-[var(--muted)]">Checklist, prazos e conversa dentro do caso.</div>
                  </Panel>
                </motion.div>

                <motion.div style={{ y: stack1Y, rotate: stack1R }} className="relative">
                  <Panel className="p-7">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">Clínica</div>
                    <div className="mt-2 text-2xl font-black">Agenda • Prontuário • Financeiro</div>
                    <div className="mt-2 text-sm font-medium text-[var(--muted)]">Tudo conectado ao CPF e ao caso.</div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {["contexto", "rastreabilidade", "previsibilidade"].map((t) => (
                        <div key={t} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)]">
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </Panel>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 4 — FAQ + CTA */}
      <section id="faq" ref={s4Ref as any} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <motion.div style={{ y: finaleY, scale: finaleScale, opacity: finaleOpacity }} className="w-[min(980px,92vw)]">
            <Panel className="relative overflow-hidden p-8 md:p-10">
              <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-20 blur-[120px]"
                style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
              />

              <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">FAQ</div>
              <h3 className="mt-3 text-[clamp(26px,3vw,42px)] font-black tracking-[-0.03em] leading-[1.05]">
                Perguntas rápidas. Respostas diretas.
              </h3>
              <div className="mt-4">
                <FAQItem q="O que é CPF único?" a="Uma identidade central. Assim seu histórico e vínculos ficam conectados e rastreáveis ao longo do tempo." />
                <FAQItem q="Posso começar pequeno?" a="Sim. O Dentis é modular: começa com clínica e evolui para lab/estoque/marketplace conforme fizer sentido." />
                <FAQItem q="A IA faz o quê?" a="Insights operacionais, previsão de demanda/estoque e organização por contexto — IA prática, sem hype." />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryButton onClick={openSignUp}>Criar conta</PrimaryButton>
                <GhostButton onClick={openSignIn}>Entrar</GhostButton>
                <GhostButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Voltar ao topo</GhostButton>
              </div>
            </Panel>

            <div className="mt-6 text-center text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">
              © {new Date().getFullYear()} Dentis • Privacidade • Termos
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
