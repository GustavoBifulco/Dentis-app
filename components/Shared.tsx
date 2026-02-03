import React from 'react';
import { Loader2, AlertCircle, FileX, ArrowRight, CheckCircle2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- PRIMITIVOS DE DESIGN ---

export const IslandCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
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
  const baseStyle = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm tracking-tight disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm shadow-slate-200",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 bg-white",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-transparent px-3"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {icon && <span className="opacity-90">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

// --- ESTADOS DE UI ---

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="flex flex-col items-center justify-center py-24 text-slate-500">
    <div className="relative mb-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600/20" />
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 absolute inset-0 [animation-delay:-0.3s] stroke-[3px]" />
    </div>
    <p className="text-sm font-medium animate-pulse text-slate-400">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-red-50/50 border border-red-100 rounded-2xl">
    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
      <AlertCircle className="w-6 h-6 text-red-600" />
    </div>
    <h4 className="text-slate-900 font-semibold mb-1">Ops! Algo deu errado.</h4>
    <p className="text-slate-600 text-sm mb-6 max-w-xs">{message}</p>
    {onRetry && (
      <LuxButton variant="outline" onClick={onRetry} className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300">
        Tentar Novamente
      </LuxButton>
    )}
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 border border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6">
      <FileX className="w-8 h-8 text-slate-300 stroke-[1.5px]" />
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <LuxButton onClick={onAction} icon={<ArrowRight size={18} />} variant="primary">
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
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-500 text-sm font-medium mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-3">{action}</div>}
  </div>
);

// --- FEEDBACK & NOTIFICAÇÕES ---

export const Toast: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}> = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-red-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />
  };

  const statusStyles = {
    success: 'border-emerald-100 bg-white/80 backdrop-blur-md',
    error: 'border-red-100 bg-white/80 backdrop-blur-md',
    info: 'border-blue-100 bg-white/80 backdrop-blur-md'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl ${statusStyles[type]} min-w-[320px] max-w-md`}
    >
      <div className={`p-2 rounded-lg ${type === 'success' ? 'bg-emerald-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
        {icons[type]}
      </div>
      <p className="text-sm font-semibold text-slate-800 flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};