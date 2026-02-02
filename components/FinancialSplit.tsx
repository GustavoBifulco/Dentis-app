import React from 'react';
import { SectionHeader, IslandCard } from './Shared';
import { ArrowDownLeft, PieChart, Users, DollarSign } from 'lucide-react';

const FinancialSplit: React.FC = () => {
  const transactions = [
    { id: 1, patient: 'Carlos Eduardo', procedure: 'Prótese Total', total: 2500, materialCost: 400, tax: 150, dentist: 975, clinic: 975, status: 'paid' },
    { id: 2, patient: 'Ana Clara', procedure: 'Manutenção', total: 300, materialCost: 20, tax: 18, dentist: 131, clinic: 131, status: 'pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Repasse & Split" subtitle="Visualização transparente do fluxo financeiro por procedimento." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-4 opacity-70">
                 <Users size={20} />
                 <span className="text-xs font-black uppercase tracking-widest">Configuração Atual</span>
             </div>
             <div className="flex justify-between items-center text-center">
                 <div>
                     <p className="text-3xl font-black">50%</p>
                     <p className="text-[10px] uppercase font-bold text-slate-400">Dentista</p>
                 </div>
                 <div className="text-slate-600 font-black">VS</div>
                 <div>
                     <p className="text-3xl font-black">50%</p>
                     <p className="text-[10px] uppercase font-bold text-slate-400">Clínica</p>
                 </div>
             </div>
             <div className="mt-4 pt-4 border-t border-white/10 text-xs text-center text-slate-400">
                 *Após dedução de custos materiais e impostos.
             </div>
         </div>
      </div>

      <div className="space-y-4">
        {transactions.map(t => (
            <IslandCard key={t.id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-lux-subtle flex items-center justify-center font-bold text-lux-text border border-lux-border">
                            {t.patient.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-lux-text">{t.patient}</h4>
                            <p className="text-sm text-lux-text-secondary">{t.procedure}</p>
                        </div>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                        <p className="text-2xl font-black text-lux-text">R$ {t.total.toFixed(2)}</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            t.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                            {t.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                    </div>
                </div>

                {/* VISUAL SPLIT BAR */}
                <div className="relative h-12 rounded-xl overflow-hidden flex font-bold text-[10px] text-white uppercase tracking-widest shadow-inner">
                    <div style={{ width: `${(t.materialCost/t.total)*100}%` }} className="bg-rose-500 flex items-center justify-center border-r border-white/20" title={`Material: R$ ${t.materialCost}`}>
                        Mat
                    </div>
                    <div style={{ width: `${(t.tax/t.total)*100}%` }} className="bg-slate-400 flex items-center justify-center border-r border-white/20" title={`Imposto: R$ ${t.tax}`}>
                        Gov
                    </div>
                    <div style={{ width: `${(t.dentist/t.total)*100}%` }} className="bg-indigo-500 flex items-center justify-center border-r border-white/20" title={`Dentista: R$ ${t.dentist}`}>
                        Dr.
                    </div>
                    <div style={{ width: `${(t.clinic/t.total)*100}%` }} className="bg-emerald-600 flex items-center justify-center" title={`Clínica: R$ ${t.clinic}`}>
                        Clínica
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2 text-center text-xs font-medium text-lux-text-secondary">
                    <p>Material: R$ {t.materialCost}</p>
                    <p>Imposto: R$ {t.tax}</p>
                    <p>Repasse: R$ {t.dentist}</p>
                    <p className="font-bold text-emerald-600">Lucro: R$ {t.clinic}</p>
                </div>

            </IslandCard>
        ))}
      </div>
    </div>
  );
};

export default FinancialSplit;