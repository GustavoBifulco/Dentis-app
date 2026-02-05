
import React, { useState, useEffect } from 'react';
import { SectionHeader, IslandCard, LuxButton, LoadingState } from '../../Shared';
import { ArrowLeft, Megaphone, Plus, PenTool } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface MarketingPageProps {
    onBack: () => void;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch campaigns
        // Mock for now or real fetch
        setLoading(false);
    }, []);

    return (
        <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <SectionHeader
                title="Marketing & Campanhas"
                subtitle="Envie mensagens em massa para retenção e engajamento."
                action={
                    <div className="flex gap-2">
                        <LuxButton variant="ghost" onClick={onBack} icon={<ArrowLeft size={18} />}>
                            Voltar
                        </LuxButton>
                        <LuxButton icon={<Plus size={18} />}>
                            Nova Campanha
                        </LuxButton>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Actions / Suggestions */}
                <IslandCard className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <div className="flex items-center gap-3 mb-4 text-blue-800 font-bold">
                        <PenTool size={20} /> Sugestão IA
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                        "Muitos pacientes não voltam há 6 meses. Que tal enviar um lembrete de check-up?"
                    </p>
                    <LuxButton variant="secondary" className="w-full text-xs">
                        Criar Campanha de Retorno
                    </LuxButton>
                </IslandCard>

                <IslandCard className="p-6 md:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-4">Campanhas Recentes</h3>
                    {loading ? <LoadingState message="Carregando..." /> : (
                        <div className="space-y-3">
                            {/* Empty State */}
                            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                Nenhuma campanha enviada recentemente.
                            </div>
                        </div>
                    )}
                </IslandCard>
            </div>
        </div>
    );
};

export default MarketingPage;
