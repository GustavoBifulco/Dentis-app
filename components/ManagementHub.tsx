import React from 'react';
import { ViewType } from '../types';
import { Package, Stethoscope, TrendingUp, AlertTriangle } from 'lucide-react';
import { IslandCard } from './Shared';
import OperationsWidget from './OperationsWidget';
import MarginAnalysis from './MarginAnalysis';

interface ManagementHubProps {
    onNavigate: (view: ViewType) => void;
}

const ManagementHub: React.FC<ManagementHubProps> = ({ onNavigate }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-3xl font-editorial font-medium text-lux-text">Central de Controle</h2>
                    <p className="text-sm text-lux-text-secondary">Gestão Operacional e Financeira</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* WIDGET: Operations Dashboard (P1.3) */}
                <div className="md:col-span-2 lg:col-span-1 h-96">
                    <OperationsWidget />
                </div>

                {/* WIDGET: Margin Analysis (P2.4) */}
                <div className="md:col-span-2 lg:col-span-2 h-96">
                    <MarginAnalysis />
                </div>

                {/* ILHA DE ESTOQUE */}
                <div onClick={() => onNavigate(ViewType.INVENTORY)} className="group cursor-pointer">
                    <IslandCard className="h-64 p-8 flex flex-col justify-between relative overflow-hidden bg-lux-surface border-lux-border hover:border-lux-accent/50 hover:shadow-xl transition-all duration-500">
                        <div className="absolute top-0 right-0 p-32 bg-lux-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-lux-accent/10 transition-colors"></div>

                        <div className="flex justify-between items-start z-10">
                            <div className="w-12 h-12 rounded-2xl bg-lux-charcoal text-white flex items-center justify-center shadow-lg shadow-slate-200">
                                <Package size={24} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="space-y-2 z-10">
                            <h3 className="text-2xl font-black text-lux-text">Estoque</h3>
                            <p className="text-lux-text-secondary text-sm">Controle de materiais.</p>
                        </div>
                    </IslandCard>
                </div>

                {/* ILHA DE PROCEDIMENTOS */}
                <div onClick={() => onNavigate(ViewType.PROCEDURES)} className="group cursor-pointer">
                    <IslandCard className="h-64 p-8 flex flex-col justify-between relative overflow-hidden bg-lux-surface border-lux-border hover:border-lux-accent/50 hover:shadow-xl transition-all duration-500">
                        <div className="absolute bottom-0 left-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-indigo-500/10 transition-colors"></div>

                        <div className="flex justify-between items-start z-10">
                            <div className="w-12 h-12 rounded-2xl bg-lux-charcoal text-white flex items-center justify-center shadow-lg shadow-slate-200">
                                <Stethoscope size={24} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="space-y-2 z-10">
                            <h3 className="text-2xl font-black text-lux-text">Procedimentos</h3>
                            <p className="text-lux-text-secondary text-sm">Catálogo e Preços.</p>
                        </div>
                    </IslandCard>
                </div>

                {/* ILHA DE ENGENHARIA (CTA) */}
                <div onClick={() => onNavigate(ViewType.PROCEDURE_ENGINEER)} className="group cursor-pointer">
                    <IslandCard className="h-64 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden border-dashed border-2 hover:bg-lux-subtle hover:border-solid transition-all duration-300">
                        <div className="w-16 h-16 rounded-full bg-lux-accent/10 flex items-center justify-center text-lux-accent mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="text-xl font-black text-lux-text mb-1">Engenharia</h3>
                        <button className="text-xs font-black uppercase tracking-widest text-lux-accent border-b-2 border-lux-accent pb-1">
                            Simulador Lucro
                        </button>
                    </IslandCard>
                </div>

            </div>
        </div>
    );
};

export default ManagementHub;
