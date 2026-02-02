
import React from 'react';
import { ViewType } from '../types';
import { Package, Stethoscope, TrendingUp, AlertTriangle } from 'lucide-react';
import { IslandCard } from './Shared';

interface ManagementHubProps {
  onNavigate: (view: ViewType) => void;
}

const ManagementHub: React.FC<ManagementHubProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-3xl font-editorial font-medium text-lux-text">Central de Controle</h2>
        <p className="text-sm text-lux-text-secondary">Gestão Operacional</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* ILHA DE ESTOQUE */}
        <div onClick={() => onNavigate(ViewType.INVENTORY)} className="group cursor-pointer">
            <IslandCard className="h-80 p-8 flex flex-col justify-between relative overflow-hidden bg-lux-surface border-lux-border hover:border-lux-accent/50 hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-32 bg-lux-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-lux-accent/10 transition-colors"></div>
                
                <div className="flex justify-between items-start z-10">
                    <div className="w-14 h-14 rounded-2xl bg-lux-charcoal text-white flex items-center justify-center shadow-lg shadow-slate-200">
                        <Package size={28} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100">
                        <AlertTriangle size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">3 Críticos</span>
                    </div>
                </div>

                <div className="space-y-4 z-10">
                    <div>
                        <h3 className="text-3xl font-black text-lux-text mb-1">Estoque</h3>
                        <p className="text-lux-text-secondary text-sm">Controle de materiais, validade e reposição.</p>
                    </div>

                    {/* Mini Donut Chart Simulation */}
                    <div className="flex items-center gap-4 pt-2">
                        <div className="relative w-24 h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div className="absolute left-0 top-0 h-full w-[70%] bg-emerald-500"></div>
                            <div className="absolute left-[70%] top-0 h-full w-[20%] bg-amber-400"></div>
                            <div className="absolute left-[90%] top-0 h-full w-[10%] bg-rose-500"></div>
                        </div>
                        <span className="text-xs font-bold text-lux-text-secondary">92% Saudável</span>
                    </div>
                </div>
            </IslandCard>
        </div>

        {/* ILHA DE PROCEDIMENTOS */}
        <div onClick={() => onNavigate(ViewType.PROCEDURES)} className="group cursor-pointer">
            <IslandCard className="h-80 p-8 flex flex-col justify-between relative overflow-hidden bg-lux-surface border-lux-border hover:border-lux-accent/50 hover:shadow-xl transition-all duration-500">
                <div className="absolute bottom-0 left-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-indigo-500/10 transition-colors"></div>
                
                <div className="flex justify-between items-start z-10">
                    <div className="w-14 h-14 rounded-2xl bg-lux-charcoal text-white flex items-center justify-center shadow-lg shadow-slate-200">
                        <Stethoscope size={28} strokeWidth={1.5} />
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest">+15% Margem</span>
                    </div>
                </div>

                <div className="space-y-4 z-10">
                    <div>
                        <h3 className="text-3xl font-black text-lux-text mb-1">Procedimentos</h3>
                        <p className="text-lux-text-secondary text-sm">Catálogo de serviços, preços e engenharia de custos.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="bg-lux-subtle p-3 rounded-xl border border-lux-border">
                            <p className="text-[10px] uppercase text-lux-text-secondary font-bold">Mais Realizado</p>
                            <p className="font-bold text-sm text-lux-text truncate">Profilaxia</p>
                        </div>
                        <div className="bg-lux-subtle p-3 rounded-xl border border-lux-border">
                             <p className="text-[10px] uppercase text-lux-text-secondary font-bold">Maior Lucro</p>
                            <p className="font-bold text-sm text-lux-text truncate">Implante Unit.</p>
                        </div>
                    </div>
                </div>
            </IslandCard>
        </div>

        {/* ILHA DE ENGENHARIA (CTA) */}
        <div onClick={() => onNavigate(ViewType.PROCEDURE_ENGINEER)} className="group cursor-pointer md:col-span-2 lg:col-span-1">
             <IslandCard className="h-80 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden border-dashed border-2 hover:bg-lux-subtle hover:border-solid transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-lux-accent/10 flex items-center justify-center text-lux-accent mb-6 group-hover:scale-110 transition-transform">
                    <TrendingUp size={40} />
                </div>
                <h3 className="text-2xl font-black text-lux-text mb-2">Engenharia de Lucro</h3>
                <p className="text-lux-text-secondary text-sm max-w-[200px] mx-auto mb-6">
                    Configure a receita dos seus procedimentos para calcular o lucro real.
                </p>
                <button className="text-xs font-black uppercase tracking-widest text-lux-accent border-b-2 border-lux-accent pb-1 hover:text-lux-text hover:border-lux-text transition-all">
                    Acessar Simulador
                </button>
             </IslandCard>
        </div>

      </div>
    </div>
  );
};

export default ManagementHub;
