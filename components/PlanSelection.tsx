
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

export const PlanSelection: React.FC<{ onSelect: (plan: string) => void }> = ({ onSelect }) => {
  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="max-w-5xl w-full">
       <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Upgrade para Clinic ID</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
             O Dentis ID é gratuito para o dentista. Para gerenciar uma equipe e múltiplos consultórios, você precisa ativar o Clinic ID.
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          
          {/* PLANO STANDARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all relative">
             <h3 className="text-2xl font-black text-slate-900">Clinic ID</h3>
             <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">R$ 149</span>
                <span className="text-slate-400 font-bold">/mês</span>
             </div>
             <p className="text-sm text-slate-500 mt-4 font-medium">Para pequenas clínicas em crescimento.</p>
             
             <div className="mt-8 space-y-4">
                {['Até 3 Dentistas', 'Gestão Financeira e Split', 'Agenda Multi-profissional', 'Estoque Básico'].map(feat => (
                   <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center"><Check size={12}/></div>
                      {feat}
                   </div>
                ))}
             </div>
             
             <button onClick={() => onSelect('CLINIC_STANDARD')} className="w-full mt-8 py-4 rounded-xl border-2 border-slate-900 text-slate-900 font-black hover:bg-slate-50 transition-colors">
                Escolher Standard
             </button>
          </div>

          {/* PLANO PRO (AI) */}
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden transform md:-translate-y-4 border border-slate-800">
             <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">Recomendado</div>
             <div className="flex items-center gap-2 mb-2">
                 <Zap className="text-blue-400 fill-blue-400" size={24} />
                 <h3 className="text-2xl font-black">Clinic ID Pro</h3>
             </div>
             <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">R$ 299</span>
                <span className="text-slate-400 font-bold">/mês</span>
             </div>
             <p className="text-sm text-slate-400 mt-4 font-medium">Automação total e Inteligência Artificial.</p>
             
             <div className="mt-8 space-y-4">
                {['Dentistas Ilimitados', 'IA Nativa (Chat & Insights)', 'Marketing Automático (WhatsApp)', 'Engenharia de Lucro Avançada'].map(feat => (
                   <div key={feat} className="flex items-center gap-3 text-sm font-bold text-white">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"><Check size={12} className="text-white"/></div>
                      {feat}
                   </div>
                ))}
             </div>
             
             <button onClick={() => onSelect('CLINIC_PRO')} className="w-full mt-8 py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-900/50">
                Começar com IA Pro
             </button>
          </div>

       </div>
    </motion.div>
  );
};
