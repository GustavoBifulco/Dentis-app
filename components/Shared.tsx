import React from 'react';
import { Loader2, AlertCircle, FileX, ArrowRight } from 'lucide-react';

// --- PRIMITIVOS DE DESIGN ---

export const IslandCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-lux-surface border border-lux-border rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
  >
    {children}
  </div>
);

export const LuxButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ children, variant = 'primary', onClick, className = '', icon, disabled }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-lux-gold text-white hover:bg-yellow-600 shadow-lg shadow-yellow-900/10",
    secondary: "bg-lux-charcoal text-lux-background hover:opacity-90",
    outline: "border border-lux-border text-lux-charcoal hover:border-lux-gold hover:text-lux-gold bg-transparent",
    ghost: "text-lux-platinum hover:text-lux-gold bg-transparent px-2"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {icon}
      <span>{children}</span>
    </button>
  );
};

// --- ESTADOS DE UI ---

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="flex flex-col items-center justify-center py-32 text-lux-platinum">
    <Loader2 className="w-8 h-8 animate-spin mb-4 text-lux-gold" />
    <p className="text-xs font-bold uppercase tracking-[0.2em] animate-pulse">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-rose-500 border border-rose-100/20 rounded-2xl bg-rose-50/10">
    <AlertCircle className="w-8 h-8 mb-4 stroke-[1.5px]" />
    <p className="font-medium mb-6 font-serif italic text-lg">{message}</p>
    {onRetry && (
      <LuxButton variant="outline" onClick={onRetry}>Tentar Novamente</LuxButton>
    )}
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-24 border border-dashed border-lux-border rounded-[2rem] text-center bg-lux-surface/30">
    <div className="w-16 h-16 rounded-full border border-lux-border flex items-center justify-center mb-6 bg-lux-background">
      <FileX className="w-6 h-6 text-lux-platinum stroke-[1.5px]" />
    </div>
    <h3 className="text-2xl font-editorial italic text-lux-charcoal mb-2">{title}</h3>
    <p className="text-lux-charcoal/60 max-w-sm mb-8 font-light text-sm">{description}</p>
    {actionLabel && onAction && (
      <LuxButton onClick={onAction} icon={<ArrowRight size={16} />}>
        {actionLabel}
      </LuxButton>
    )}
  </div>
);

export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-lux-border pb-6">
    <div>
      <h2 className="text-3xl font-editorial font-medium text-lux-charcoal mb-2 tracking-tight">{title}</h2>
      {subtitle && <p className="text-lux-charcoal/60 text-sm font-light max-w-lg leading-relaxed">{subtitle}</p>}
    </div>
    {action && <div className="mb-1">{action}</div>}
  </div>
);