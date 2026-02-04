import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
    Zap,
    Plus,
    Trash2,
    Play,
    Settings,
    MessageCircle,
    Mail,
    CheckSquare,
    Clock,
    Activity
} from 'lucide-react';
import { LoadingState } from './Shared';
import { AutomationRule } from '../types';
import { Services } from '../lib/services';

const AutomationBuilder: React.FC = () => {
    const { isLoaded, user } = useUser();
    const { getToken } = useAuth();

    // State
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreator, setShowCreator] = useState(false);

    // New Rule State
    const [newName, setNewName] = useState('');
    const [triggerType, setTriggerType] = useState('appointment_status');
    const [actionType, setActionType] = useState('send_whatsapp');

    useEffect(() => {
        // Mock load for now - will be replaced by API call
        // setTimeout(() => {
        //     setRules([
        //         {
        //             id: 1,
        //             organizationId: 'org-1',
        //             name: 'Call No-Shows',
        //             isActive: true,
        //             triggerType: 'appointment_status',
        //             triggerConfig: { status: 'no-show' },
        //             actionType: 'create_task',
        //             actionConfig: { title: 'Call patient to reschedule' },
        //             createdAt: new Date().toISOString()
        //         }
        //     ]);
        //     setLoading(false);
        // }, 1000);
        setLoading(false); // Since API doesn't exist yet, just clear loading
    }, []);

    const handleCreate = () => {
        const newRule: AutomationRule = {
            id: Math.random(),
            organizationId: 'current',
            name: newName || 'New Automation',
            isActive: true,
            triggerType: triggerType as any,
            triggerConfig: {},
            actionType: actionType as any,
            actionConfig: {},
            createdAt: new Date().toISOString()
        };

        setRules([...rules, newRule]);
        setShowCreator(false);
        setNewName('');
    }

    if (loading) return <LoadingState />;

    return (
        <div className="h-full flex flex-col p-6 animate-in fade-in bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Zap className="text-amber-500" size={32} />
                        Automação (Playbooks)
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Crie regras "se isso, então aquilo" para automatizar sua clínica.</p>
                </div>
                <button
                    onClick={() => setShowCreator(true)}
                    className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition shadow-lg shadow-amber-500/20"
                >
                    <Plus size={20} />
                    Nova Regra
                </button>
            </div>

            {/* Creator Modal */}
            {showCreator && (
                <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4">Criar Nova Automação</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome da Regra</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Ex: Lembrete de Retorno"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Gatilho (Quando...)</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold"
                                value={triggerType}
                                onChange={e => setTriggerType(e.target.value)}
                            >
                                <option value="appointment_status">Status consulta mudou</option>
                                <option value="inventory_low">Estoque baixo</option>
                                <option value="birthday">Aniversário do paciente</option>
                                <option value="payment_overdue">Pagamento atrasado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ação (Faça...)</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold"
                                value={actionType}
                                onChange={e => setActionType(e.target.value)}
                            >
                                <option value="send_whatsapp">Enviar WhatsApp</option>
                                <option value="send_email">Enviar Email</option>
                                <option value="create_task">Criar Tarefa</option>
                                <option value="notify_team">Notificar Equipe</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowCreator(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancelar</button>
                        <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Criar Automação</button>
                    </div>
                </div>
            )}

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(rule => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={rule.id}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-lg hover:bg-indigo-50"><Settings size={16} /></button>
                            <button className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                {rule.triggerType === 'appointment_status' && <Clock size={24} />}
                                {rule.triggerType === 'inventory_low' && <Activity size={24} />}
                                {rule.triggerType === 'birthday' && <Zap size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 leading-tight">{rule.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-xs font-medium text-slate-500">{rule.isActive ? 'Ativo' : 'Pausado'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                                <span className="font-black text-xs text-slate-400 uppercase w-12">Se</span>
                                <span>{rule.triggerType.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-center -my-2 relative z-10">
                                <div className="bg-slate-200 p-1 rounded-full text-slate-500">
                                    <Play size={12} className="rotate-90" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                <span className="font-black text-xs text-indigo-300 uppercase w-12">Então</span>
                                <div className="flex items-center gap-2">
                                    {rule.actionType === 'send_whatsapp' && <MessageCircle size={14} />}
                                    {rule.actionType === 'send_email' && <Mail size={14} />}
                                    {rule.actionType === 'create_task' && <CheckSquare size={14} />}
                                    <span>{rule.actionType.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {rules.length === 0 && !showCreator && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        <Zap size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium text-lg">Nenhuma automação ativa</p>
                        <p>Crie sua primeira regra para economizar tempo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutomationBuilder;
