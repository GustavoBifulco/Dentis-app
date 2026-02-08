import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { SignIn, SignUp, useClerk } from "@clerk/clerk-react";

function cx(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

type Props = {
  open: boolean;
  mode: "signin" | "signup";
  onClose: () => void;
  onModeChange: (m: "signin" | "signup") => void;
};

export default function AuthModal({ open, mode, onClose, onModeChange }: Props) {
  const [mounted, setMounted] = useState(false);
  let clerk: any = null;
  try {
    clerk = useClerk();
  } catch (e) {
    // Safe fallback for verification without ClerkProvider
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const clerkKey =
    (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY ||
    (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY?.length;

  const hasClerk = Boolean((import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY);

  const card = "rounded-[28px] border border-[var(--border)] bg-white shadow-[var(--shadow)]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-md" onClick={onClose} />

      <div className={cx("relative w-full max-w-[980px] overflow-hidden", card)}>
        <div className="flex items-start justify-between gap-6 border-b border-[var(--border)] p-6">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">
              Dentis • Acesso
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-[var(--text)]">
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </div>
            <div className="mt-2 text-sm font-medium text-[var(--muted)]">
              Tudo conectado por CPF único (quando você habilitar o fluxo). Segurança e rastreabilidade.
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-white hover:bg-black/5 transition"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_1fr] gap-0">
          {/* Lado editorial */}
          <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--border)] bg-white">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">
              Por que entrar?
            </div>

            <div className="mt-4 space-y-3">
              {[
                { t: "Contexto", d: "Conversas e arquivos no caso certo." },
                { t: "Rastreabilidade", d: "Histórico conectado entre clínica, lab e compras." },
                { t: "Operação", d: "Estoque e marketplace trabalhando juntos." },
                { t: "IA aplicada", d: "Insights práticos (sem hype)." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="font-black">{x.t}</div>
                  <div className="mt-1 text-sm font-medium text-[var(--muted)]">{x.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => onModeChange("signin")}
                className={cx(
                  "rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.28em] border transition",
                  mode === "signin"
                    ? "border-[var(--border)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--text)] hover:bg-black/5"
                )}
              >
                Entrar
              </button>
              <button
                onClick={() => onModeChange("signup")}
                className={cx(
                  "rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.28em] border transition",
                  mode === "signup"
                    ? "border-[var(--border)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--text)] hover:bg-black/5"
                )}
              >
                Criar conta
              </button>
            </div>

            {!hasClerk ? (
              <div className="mt-5 rounded-2xl border border-[var(--border)] bg-black/5 p-4 text-sm font-medium text-[var(--muted)]">
                <b>Clerk não configurado.</b> Adicione <code>VITE_CLERK_PUBLISHABLE_KEY</code> no seu <code>.env</code> para ativar login real.
                <div className="mt-2 opacity-80">
                  Enquanto isso, o lado direito mostra um fallback (não quebra o app).
                </div>
              </div>
            ) : null}
          </div>

          {/* Lado auth */}
          <div className="p-6 md:p-8 bg-white">
            {hasClerk && mounted ? (
              <div className="flex justify-center">
                {mode === "signin" ? (
                  <SignIn
                    routing="hash"
                    appearance={{
                      elements: {
                        card: "shadow-none border border-[var(--border)] rounded-[24px]",
                        headerTitle: "text-[var(--text)] font-black",
                        headerSubtitle: "text-[var(--muted)]",
                        formButtonPrimary: "bg-[var(--primary)] hover:opacity-95",
                      },
                    }}
                  />
                ) : (
                  <SignUp
                    routing="hash"
                    appearance={{
                      elements: {
                        card: "shadow-none border border-[var(--border)] rounded-[24px]",
                        headerTitle: "text-[var(--text)] font-black",
                        headerSubtitle: "text-[var(--muted)]",
                        formButtonPrimary: "bg-[var(--primary)] hover:opacity-95",
                      },
                    }}
                  />
                )}
              </div>
            ) : (
              <FallbackAuth mode={mode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FallbackAuth({ mode }: { mode: "signin" | "signup" }) {
  const input =
    "mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none text-[var(--text)] placeholder:text-black/35 focus:ring-2 focus:ring-[var(--accent)]/30";
  return (
    <div className="max-w-md mx-auto">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[var(--muted)]">
        {mode === "signin" ? "Login (fallback)" : "Registro (fallback)"}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)]">
            Email
          </label>
          <input className={input} placeholder="voce@exemplo.com" />
        </div>
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)]">
            Senha
          </label>
          <input className={input} placeholder="••••••••" type="password" />
        </div>

        {mode === "signup" ? (
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)]">
              CPF (placeholder)
            </label>
            <input className={input} placeholder="000.000.000-00" />
          </div>
        ) : null}

        <button
          className="w-full rounded-full px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.32em] bg-[var(--primary)] text-white hover:opacity-95 transition"
          onClick={() => alert("Ative o Clerk para login real.")}
        >
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </button>

        <div className="text-xs text-[var(--muted)] font-medium">
          *Este fallback é só visual para não quebrar. O login real vem com Clerk.
        </div>
      </div>
    </div>
  );
}
