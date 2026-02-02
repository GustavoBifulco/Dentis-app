import React, { useState } from 'react';
import { IslandCard, LuxButton, SectionHeader } from './Shared';
import { Printer, Send, Zap } from 'lucide-react';

const SmartPrescription: React.FC = () => {
  const [content, setContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Simulação de "Slash Commands"
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (val.endsWith('/')) setShowSuggestions(true);
    else setShowSuggestions(false);
  };

  const insertPrescription = (type: string) => {
    let textToInsert = "";
    if (type === 'dipirona') {
        textToInsert = "DIPIRONA SÓDICA 500MG ---------------- 1 CX\nTomar 1 comprimido via oral de 6 em 6 horas em caso de dor.\n\n";
    }
    if (type === 'amoxicilina') {
        textToInsert = "AMOXICILINA 500MG ------------------ 1 CX\nTomar 1 cápsula via oral de 8 em 8 horas por 7 dias.\n\n";
    }
    if (type === 'bochecho') {
        textToInsert = "CLOREXIDINA 0,12% ------------------ 1 FR\nBochechar 15ml por 1 minuto de 12 em 12 horas.\n\n";
    }
    
    // Remove the slash and append text
    setContent(prev => prev.slice(0, -1) + textToInsert);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-black text-slate-900">Prescrição Digital</h2>
             <p className="text-slate-500">Digite "/" para usar modelos rápidos de IA.</p>
          </div>
          <div className="flex gap-2">
             <button className="p-3 rounded-xl hover:bg-slate-100 text-slate-600"><Printer size={20}/></button>
             <LuxButton icon={<Send size={16}/>}>Assinar & Enviar</LuxButton>
          </div>
       </div>

       <IslandCard className="min-h-[600px] p-12 relative font-serif text-lg leading-relaxed text-slate-800 shadow-2xl bg-white">
          {/* Cabeçalho do Receituário */}
          <div className="flex justify-between border-b border-slate-100 pb-8 mb-8 opacity-50 select-none">
             <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-black rounded-lg">D</div>
                <div>
                    <p className="font-bold text-xs uppercase tracking-widest">Dr. Ricardo Silva</p>
                    <p className="text-[10px]">CRO/SP 123456</p>
                </div>
             </div>
             <div className="text-right">
                <p className="font-bold text-xs uppercase tracking-widest">Paciente</p>
                <p className="text-lg font-bold text-slate-900">Carlos Eduardo</p>
             </div>
          </div>

          <textarea 
            className="w-full h-[400px] resize-none outline-none bg-transparent placeholder:text-slate-300 font-mono text-sm md:text-base leading-relaxed"
            placeholder="Comece a digitar sua prescrição..."
            value={content}
            onChange={handleInput}
            autoFocus
          />

          {/* Menu Flutuante (Slash Command) */}
          {showSuggestions && (
             <div className="absolute top-48 left-12 bg-white rounded-xl shadow-2xl border border-slate-100 w-72 overflow-hidden animate-in fade-in zoom-in-95 z-50">
                <div className="bg-slate-50 px-4 py-2 text-[10px] font-black uppercase text-slate-400">Sugestões de IA</div>
                <button onClick={() => insertPrescription('dipirona')} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium flex items-center gap-2 text-slate-700">
                   <Zap size={14} className="text-blue-500" /> Analgésico (Dipirona)
                </button>
                <button onClick={() => insertPrescription('amoxicilina')} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium flex items-center gap-2 text-slate-700">
                   <Zap size={14} className="text-blue-500" /> Antibiótico (Amoxicilina)
                </button>
                <button onClick={() => insertPrescription('bochecho')} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium flex items-center gap-2 text-slate-700">
                   <Zap size={14} className="text-blue-500" /> Pós-Cirúrgico (Clorexidina)
                </button>
             </div>
          )}

          {/* Assinatura Digital */}
          <div className="absolute bottom-12 right-12 text-center select-none">
             <div className="w-48 h-px bg-slate-300 mb-2"></div>
             <p className="text-xs font-bold text-slate-400 uppercase">Assinatura Digital ICP-Brasil</p>
          </div>
       </IslandCard>
    </div>
  );
};

export default SmartPrescription;