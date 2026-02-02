import React, { useState, useEffect } from 'react';
import { Sparkles, Database, Check, ArrowRight, Layers, Box } from 'lucide-react';
import { LuxButton } from './Shared';

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [syncStep, setSyncStep] = useState(0);

  useEffect(() => {
    // Simula steps de animação
    const timers = [
      setTimeout(() => setSyncStep(1), 1000),
      setTimeout(() => setSyncStep(2), 2500),
      setTimeout(() => setSyncStep(3), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-lux-background z-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Dentis Intelligence
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-lux-text tracking-tight mb-4">
              Configurando sua <br/> base técnica.
           </h1>
           <p className="text-lux-text-secondary text-lg max-w-xl mx-auto">
              Não comece do zero. Estamos importando padrões de mercado para acelerar sua gestão.
           </p>
        </div>

        {/* The Giant Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-lux-border overflow-hidden relative min-h-[400px] flex flex-col md:flex-row">
            
            {/* Background Animation */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* Column 1: Procedimentos */}
            <div className={`flex-1 p-10 border-r border-lux-border/50 transition-all duration-700 ${syncStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                   <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold text-lux-text mb-2">Procedimentos</h3>
                <p className="text-sm text-lux-text-secondary mb-6">Importando tabela de referência e códigos TUSS.</p>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-lux-subtle rounded-xl border border-lux-border/50">
                        <span className="text-sm font-medium">Profilaxia</span>
                        <span className="text-xs font-bold text-lux-text-secondary bg-white px-2 py-1 rounded">R$ 250</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-lux-subtle rounded-xl border border-lux-border/50">
                        <span className="text-sm font-medium">Restauração</span>
                        <span className="text-xs font-bold text-lux-text-secondary bg-white px-2 py-1 rounded">R$ 380</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-lux-subtle rounded-xl border border-lux-border/50">
                        <span className="text-sm font-medium">Exodontia</span>
                        <span className="text-xs font-bold text-lux-text-secondary bg-white px-2 py-1 rounded">R$ 450</span>
                    </div>
                </div>
            </div>

            {/* Column 2: Materiais */}
            <div className={`flex-1 p-10 border-r border-lux-border/50 transition-all duration-700 delay-200 ${syncStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                   <Box size={24} />
                </div>
                <h3 className="text-xl font-bold text-lux-text mb-2">Estoque Inicial</h3>
                <p className="text-sm text-lux-text-secondary mb-6">Catalogando 150+ itens essenciais.</p>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-lux-subtle rounded-xl border border-lux-border/50">
                        <span className="text-sm font-medium">Resina Z350</span>
                        <Check size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-lux-subtle rounded-xl border border-lux-border/50">
                        <span className="text-sm font-medium">Kit Adesivo</span>
                        <Check size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-lux-subtle rounded-xl border border-lux-border/50">
                        <span className="text-sm font-medium">Anestésicos</span>
                        <Check size={14} className="text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Column 3: Match/Final */}
            <div className={`flex-1 p-10 bg-slate-900 text-white flex flex-col justify-between transition-all duration-700 delay-500 ${syncStep >= 3 ? 'opacity-100 scale-100' : 'opacity-90 scale-95'}`}>
                <div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md">
                       <Database size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Engenharia Pronta</h3>
                    <p className="text-slate-400 text-sm">
                        Calculamos automaticamente o custo base dos seus procedimentos.
                    </p>
                </div>

                <div className="mt-8">
                    {syncStep >= 3 ? (
                        <button 
                            onClick={onComplete}
                            className="w-full bg-white text-slate-900 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors animate-in zoom-in"
                        >
                            Herdar e Prosseguir <ArrowRight size={18} />
                        </button>
                    ) : (
                        <div className="w-full h-14 bg-white/10 rounded-xl animate-pulse"></div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SetupWizard;