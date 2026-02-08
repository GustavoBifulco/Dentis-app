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
  Search,
  Lock,
  FileText,
  Truck,
  Building2,
  ArrowDown
} from "lucide-react";
import AuthModal from "./AuthModal";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  PerspectiveCamera,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

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
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
      <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
      <span className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-white/70">{children}</span>
    </div>
  );
}

// --- CORE 3D COMPONENT: SENTIENT FLUID ---
const DentisFluidCore = ({ scrollProgress }: { scrollProgress: any }) => {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    const p = scrollProgress.get(); // Current scroll progress (0 to 1)

    // Organic base rotation
    meshRef.current.rotation.y += 0.005 + p * 0.02;
    meshRef.current.rotation.z += 0.002;

    // Reacting to scroll and hover
    const baseDistort = 0.4 + p * 0.6;
    const baseSpeed = 2 + p * 3;

    const targetDistort = hovered ? baseDistort + 0.3 : baseDistort;
    const targetSpeed = hovered ? baseSpeed + 2 : baseSpeed;

    meshRef.current.distort = THREE.MathUtils.lerp(meshRef.current.distort, targetDistort, 0.1);
    meshRef.current.speed = THREE.MathUtils.lerp(meshRef.current.speed, targetSpeed, 0.1);

    // Morph scale slightly on scroll
    const s = 1.2 + p * 0.3;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, s, 0.1));
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={1.2}
      >
        <sphereGeometry args={[1, 128, 128]} />
        <MeshDistortMaterial
          color="#ffffff"
          metalness={1}
          roughness={0.05}
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

const Scene = ({ scrollProgress }: { scrollProgress: any }) => (
  <div className="fixed inset-0 z-0 bg-slate-950">
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />

      <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={150} color="#00D1FF" />
      <spotLight position={[-5, -5, -5]} angle={0.15} penumbra={1} intensity={100} color="#7000FF" />
      <ambientLight intensity={0.2} />

      <Environment preset="warehouse" />
      <DentisFluidCore scrollProgress={scrollProgress} />
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />

      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} mipmapBlur />
        <Noise opacity={0.05} />
      </EffectComposer>
    </Canvas>
  </div>
);

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

  const { scrollYProgress } = useScroll(); // Overall page progress

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-400 selection:text-slate-950">
      <AuthModal open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} onModeChange={setAuthMode} />

      {/* Cinematic 3D Engine */}
      <Scene scrollProgress={scrollYProgress} />

      {/* NAV editorial (Zara/Apple) */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex w-[min(1200px,92vw)] items-center justify-between py-6">
          <button className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 border-2 border-cyan-400 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            </div>
            <div className="leading-none text-left">
              <div className="text-xl font-black tracking-widest uppercase italic">Dentis <span className="text-cyan-400">OS</span></div>
              <div className="mt-1 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Sentient Operational Intelligence</div>
            </div>
          </button>

          <div className="hidden sm:flex items-center gap-4">
            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-cyan-400 transition" onClick={() => scrollTo("como")}>
              Protocolos
            </button>
            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-cyan-400 transition" onClick={() => scrollTo("modulos")}>
              Módulos
            </button>
            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-cyan-400 transition" onClick={() => scrollTo("faq")}>
              Segurança
            </button>
            <div className="h-6 w-[1px] bg-white/10 mx-2" />
            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-cyan-400 transition" onClick={openSignIn}>Entrar</button>
            <button className="px-8 py-3 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 hover:text-white transition-all shadow-xl active:scale-95" onClick={openSignUp}>
              Initialize
            </button>
          </div>

          <div className="sm:hidden flex items-center gap-2">
            <button className="px-5 py-2.5 bg-white text-slate-950 font-black text-[9px] uppercase tracking-widest" onClick={openSignUp}>Initialize</button>
          </div>
        </div>
      </div>

      {/* SCENE 1 — HERO CINEMÁTICO */}
      <section ref={s1Ref as any} className="relative h-[250vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div className="mx-auto grid w-[min(1200px,92vw)] grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <motion.div
              style={{
                y: heroY,
                scale: heroScale,
                opacity: heroOpacity,
                filter: useTransform(heroBlur, (v) => `blur(${v}px)`),
              }}
              className="z-10"
            >
              <div className="relative space-y-10">
                <Kicker>Sentient Operational Intelligence</Kicker>

                <h1 className="text-[clamp(44px,8vw,120px)] font-serif font-medium leading-[0.9] tracking-[-0.05em] text-white">
                  IA <span className="italic text-cyan-400">Líquida.</span>
                </h1>

                <p className="max-w-xl text-[20px] font-light leading-relaxed text-slate-400">
                  Gestão odontológica reimaginada como um organismo vivo.
                  Predição, automação e expansão clínica em tempo real.
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <button
                    onClick={openSignUp}
                    className="px-12 py-6 bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-[0.5em] hover:bg-white transition-all shadow-[0_0_60px_rgba(34,211,238,0.3)]"
                  >
                    Initialize System
                  </button>
                  <button
                    onClick={openSignIn}
                    className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-cyan-400 transition-all"
                  >
                    Acessar Terminal <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Chip icon={ShieldCheck} label="CPF único" />
                  <Chip icon={MessageSquare} label="Chat contextual" />
                  <Chip icon={Sparkles} label="IA aplicada" />
                </div>
              </div>
            </motion.div>

            <motion.div style={{ y: previewY }} className="hidden lg:block relative z-10">
              <div className="rounded-[4rem] border border-white/5 bg-white/5 backdrop-blur-3xl p-10 space-y-8 overflow-hidden group">
                <div className="absolute inset-0 bg-slate-900/50 group-hover:bg-cyan-400/5 transition-colors duration-700" />
                <div className="relative text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Fluxo Vital (Live)</div>
                <div className="relative space-y-4">
                  {[
                    { t: "Caso protético #452", d: "Checklist + anexos + prazos", tag: "Em produção" },
                    { t: "Estoque inteligente", d: "Consumo → alerta → reposição", tag: "Repor" },
                    { t: "IA preditiva", d: "Prioriza urgência + sugere demanda", tag: "Insights" },
                  ].map((x) => (
                    <div key={x.t} className="rounded-3xl border border-white/10 bg-black/40 p-5 group-hover:border-cyan-400/30 transition-all">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-bold text-white text-sm tracking-tight">{x.t}</div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                          {x.tag}
                        </div>
                      </div>
                      <div className="mt-2 text-xs font-light text-slate-500">{x.d}</div>
                    </div>
                  ))}
                </div>
                <div className="relative pt-4 border-t border-white/5 flex justify-center">
                  <div className="w-[1px] h-10 bg-gradient-to-b from-cyan-400 to-transparent animate-bounce" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCENE 2 — BEFORE / AFTER (reveal) */}
      <section id="como" ref={s2Ref as any} className="relative h-[250vh] z-20">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div className="mx-auto w-[min(1200px,92vw)]">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div className="space-y-10">
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">Automação Orgânica</div>
                <h2 className="text-[clamp(32px,4vw,64px)] font-serif font-medium leading-[1.05] tracking-[-0.04em] text-white">
                  O Prontuário que <span className="italic">respira.</span>
                </h2>
                <p className="max-w-xl text-[20px] font-light leading-relaxed text-slate-400">
                  Sua voz se torna registro clínico imediato. Nossa IA processa consultas em tempo real, gerando orçamentos e guias sem intervenção humana.
                </p>

                <div className="grid gap-4">
                  {[
                    "WhatsApp solto → conversa no contexto do caso",
                    "Planilha → estoque conectado ao consumo",
                    "Pedido manual → recompra rápida no marketplace",
                    "Desorganização → histórico por identidade (CPF)",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-4 p-5 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-3xl hover:border-cyan-400/30 transition-all cursor-default">
                      <CheckCircle2 size={20} className="mt-0.5 text-cyan-400" />
                      <div className="text-sm font-medium text-slate-400 leading-relaxed">{t}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button onClick={openSignUp} className="group flex items-center gap-6 text-xs font-black uppercase tracking-[0.4em] text-white">
                    <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-cyan-400 group-hover:border-cyan-400 group-hover:text-slate-950 transition-all duration-500">
                      →
                    </div>
                    Initialize System
                  </button>
                </div>
              </div>

              <div className="relative rounded-[4rem] border border-white/5 bg-white/5 backdrop-blur-3xl overflow-hidden aspect-square lg:aspect-auto lg:h-[600px] group">
                <div className="absolute inset-0 bg-slate-900/50" />
                {/* reveal line */}
                <motion.div
                  style={{ left: divider }}
                  className="pointer-events-none absolute top-0 z-20 h-full w-[1px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                />
                <div className="h-full grid grid-cols-2 relative h-full">
                  <div className="p-8 md:p-10 border-r border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-4">Fragmentado</div>
                      <div className="text-2xl font-serif text-slate-300">Antes</div>
                      <div className="mt-8 space-y-4 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                        {["WhatsApp perdido", "Planilhas", "Sistemas isolados"].map((t) => (
                          <div key={t} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                            <div className="font-bold text-xs text-white uppercase tracking-widest">{t}</div>
                            <div className="mt-1 text-[10px] font-light text-slate-500">Sem contexto.</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-10 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-4">Conectado</div>
                      <div className="text-2xl font-serif text-white italic">Depois</div>
                      <div className="mt-8 space-y-4">
                        {["Caso com chat", "Lab por etapas", "Estoque conectado"].map((t) => (
                          <div key={t} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                            <div className="font-bold text-xs text-white uppercase tracking-widest">{t}</div>
                            <div className="mt-1 text-[10px] font-light text-cyan-400/60">Tudo no fluxo.</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 3 — STACK (módulos) */}
      <section id="modulos" ref={s3Ref as any} className="relative h-[280vh] z-30">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div className="mx-auto w-[min(1200px,92vw)]">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div className="space-y-10">
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">Hiper-Rentabilidade</div>
                <h2 className="text-[clamp(32px,4vw,64px)] font-serif font-medium leading-[1.05] tracking-[-0.04em] text-white">
                  Dashboard de <br /><span className="italic">Fluxo Vital.</span>
                </h2>
                <p className="max-w-xl text-[20px] font-light leading-relaxed text-slate-400">
                  Dashboards reativos que mostram a saúde financeira da sua rede com precisão absoluta. Previna cancelamentos e otimize o giro clínico.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Database, t: "Clínica", d: "Agenda, prontuário e financeiro no contexto do CPF/caso." },
                    { icon: Activity, t: "Laboratório", d: "Casos protéticos com etapas, prazos e status." },
                    { icon: Layers, t: "Estoque + Marketplace", d: "Consumo baixa estoque e sugere reposição." },
                  ].map(({ icon: Icon, t, d }) => (
                    <div key={t} className="group relative rounded-[2rem] border border-white/5 bg-white/5 p-6 backdrop-blur-3xl hover:border-cyan-400/30 transition-all cursor-default overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-cyan-400/0 group-hover:to-cyan-400/5 transition-all duration-700" />
                      <div className="relative flex items-center gap-6">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-black/40 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-500">
                          <Icon size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="font-bold text-white uppercase tracking-widest text-xs mb-1">{t}</div>
                          <div className="text-sm font-light text-slate-500 leading-relaxed">{d}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-20 lg:mt-0 h-[500px] lg:h-[700px]">
                <motion.div style={{ y: stack3Y, rotate: stack3R }} className="absolute right-0 top-32 w-[min(520px,92vw)] z-30">
                  <div className="rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl p-10 space-y-4 shadow-2xl">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Marketplace</div>
                    <div className="text-3xl font-serif text-white italic">Recompra rápida</div>
                    <div className="text-sm font-light text-slate-500 leading-relaxed">Favoritos, recorrência e entrega com status estilo delivery.</div>
                  </div>
                </motion.div>

                <motion.div style={{ y: stack2Y, rotate: stack2R }} className="absolute left-10 top-16 w-[min(560px,92vw)] z-20">
                  <div className="rounded-[3rem] border border-white/10 bg-slate-900/80 backdrop-blur-3xl p-10 space-y-4 shadow-xl">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Laboratório</div>
                    <div className="text-3xl font-serif text-white">Casos por etapa</div>
                    <div className="text-sm font-light text-slate-500 leading-relaxed">Checklist, prazos e conversa dentro do caso. Padronização absoluta.</div>
                  </div>
                </motion.div>

                <motion.div style={{ y: stack1Y, rotate: stack1R }} className="relative z-10">
                  <div className="rounded-[4rem] border border-white/20 bg-black/60 backdrop-blur-3xl p-12 space-y-6 shadow-lg border-b-cyan-400/30">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Ecossistema Central</div>
                    <div className="text-4xl font-serif text-white">Agenda • Prontuário</div>
                    <div className="text-lg font-light text-slate-500 leading-relaxed">O início de tudo. Onde o paciente se torna parte do fluxo.</div>

                    <div className="flex flex-wrap gap-3 pt-4">
                      {["contexto", "rastreabilidade", "previsibilidade"].map((t) => (
                        <div key={t} className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                          <span className="mr-3 inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 4 — FINALE / FAQ */}
      <section id="faq" ref={s4Ref as any} className="relative h-[220vh] z-40">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <motion.div style={{ y: finaleY, scale: finaleScale, opacity: finaleOpacity }} className="w-[min(1100px,92vw)]">
            <div className="rounded-[4rem] border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-500/5" />
              <div className="relative p-12 md:p-16 grid lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 mb-6">Suporte & Segurança</div>
                    <h3 className="text-[clamp(32px,4vw,56px)] font-serif font-medium leading-[1.05] tracking-[-0.04em] text-white">
                      Junte-se ao <br /><span className="italic text-cyan-400">Organismo.</span>
                    </h3>
                    <p className="mt-6 text-xl font-light leading-relaxed text-slate-400">
                      Pare de gerenciar softwares. Comece a orquestrar uma inteligência.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={openSignUp}
                      className="w-full px-12 py-8 bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-[0.5em] hover:bg-white transition-all shadow-xl"
                    >
                      Initialize System
                    </button>
                    <div className="flex gap-4">
                      <button onClick={openSignIn} className="flex-1 py-6 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">Acessar Terminal</button>
                      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="p-6 border border-white/10 text-white hover:bg-white/5 transition-all"><ArrowDown className="rotate-180" size={20} /></button>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-wrap gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                    <div className="flex items-center gap-3"><ShieldCheck size={14} className="text-cyan-400" /> Projetado para Conformidade</div>
                    <div className="flex items-center gap-3"><Lock size={14} className="text-cyan-400" /> Dados Protegidos</div>
                    <div className="flex items-center gap-3"><Building2 size={14} className="text-cyan-400" /> Cloud Native</div>
                  </div>
                </div>

                <div className="space-y-8 border-l border-white/5 pl-20 hidden lg:block">
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">FAQ Protocol</div>
                  <div className="space-y-2">
                    <FAQItem q="O que é CPF único?" a="Uma identidade central. Assim seu histórico e vínculos ficam conectados e rastreáveis ao longo do tempo em todos os papéis do sistema." />
                    <FAQItem q="Posso começar pequeno?" a="Sim. O Dentis é modular: começa com clínica e evolui para lab/estoque/marketplace conforme fizer sentido para sua operação." />
                    <FAQItem q="IA substitui o profissional?" a="Não. Nossas IAs são operacionais: organizam dados, preveem demanda e automatizam registros para liberar você para o que importa." />
                    <FAQItem q="A implementação é lenta?" a="Não. Em 60 segundos sua conta está ativa e o terminal disponível para as primeiras configurações e cadastros." />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">
              <div>© {new Date().getFullYear()} DENTIS OS • Sentient Edition</div>
              <div className="flex gap-8">
                <a href="#" className="hover:text-cyan-400 transition-colors">Awwwards 2026</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
