
import React, { useState, useEffect } from 'react';
import { SectionHeader, IslandCard, LuxButton, LoadingState } from '../../Shared';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface AutomationPageProps {
    onBack: () => void;
}

const AutomationPage: React.FC<AutomationPageProps> = ({ onBack }) => {
    const { getToken } = useAuth();
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRules = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch('/api/communication/automations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRules(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRules();
    }, []);

    const dummyRules = [
        { id: 'new-1', type: 'Confirmação', enabled: true, details: '24h antes da consulta' },
        { id: 'new-2', type: 'Lembrete', enabled: false, details: '2h antes da consulta' },
        { id: 'new-3', type: 'Aniversário', enabled: true, details: 'Às 09:00 no dia' },
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <SectionHeader
                title="Automação WhatsApp"
                subtitle="Regras de envio automático de mensagens."
                action={
                    <div className="flex gap-2">
                        <LuxButton variant="ghost" onClick={onBack} icon={<ArrowLeft size={18} />}>
                            Voltar
                        </LuxButton>
                        <LuxButton icon={<Plus size={18} />}>
                            Nova Regra
                        </LuxButton>
                    </div>
                }
            />

            <IslandCard>
                <div className="p-6">
                    {loading ? (
                        <LoadingState message="Carregando regras..." />
                    ) : (
                        <div className="space-y-4">
                            {rules.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    Nenhuma regra configurada. Use os exemplos abaixo.
                                </div>
                            )}

                            {/* Render Mock/Real items mixed for scaffold preview if empty */}
                            {(rules.length > 0 ? rules : dummyRules).map((rule: any) => (
                                <div key={rule.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{rule.type}</h4>
                                            <p className="text-sm text-slate-500">{rule.details || 'Configuração padrão'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={rule.enabled} readOnly />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </IslandCard>
        </div>
    );
};

export default AutomationPage;
