
import React, { useState } from 'react';
import { ViewType } from '../../types';
import { IslandCard, SectionHeader, LuxButton } from '../Shared';
import { MessageSquare, Megaphone, Zap, ArrowRight } from 'lucide-react';
import AutomationPage from './Communication/AutomationPage';
import MarketingPage from './Communication/MarketingPage';

const CommunicationDashboard: React.FC = () => {
    const [activeSubView, setActiveSubView] = useState<'HOME' | 'MARKETING' | 'AUTOMATION'>('HOME');

    if (activeSubView === 'MARKETING') {
        return <MarketingPage onBack={() => setActiveSubView('HOME')} />;
    }

    if (activeSubView === 'AUTOMATION') {
        return <AutomationPage onBack={() => setActiveSubView('HOME')} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Central de Comunicação"
                subtitle="Gerencie automações e campanhas de marketing para seus pacientes."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ILHA 1: MARKETING */}
                <IslandCard
                    className="p-8 group hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => setActiveSubView('MARKETING')}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Megaphone size={120} />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Megaphone size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Marketing</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Crie campanhas de retorno, novidades e promoções para sua base de pacientes.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center text-blue-600 font-bold text-sm tracking-wide">
                            Gerenciar Campanhas <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </IslandCard>

                {/* ILHA 2: AUTOMAÇÃO */}
                <IslandCard
                    className="p-8 group hover:border-purple-200 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => setActiveSubView('AUTOMATION')}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={120} className="text-purple-600" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Automação</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Configure lembretes automáticos, confirmações e mensagens de aniversário.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center text-purple-600 font-bold text-sm tracking-wide">
                            Configurar Regras <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </IslandCard>
            </div>
        </div>
    );
};

export default CommunicationDashboard;
