import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Calculator, Plus, FileText, Check, DollarSign } from 'lucide-react';
import { LuxButton } from './Shared';

interface PlanItem {
    id?: number;
    name: string;
    price: number;
    tooth?: number;
}

interface Plan {
    id: number;
    title: string;
    status: string;
    totalCost: string;
    createdAt: string;
    items?: PlanItem[];
}

interface TreatmentPlansProps {
    patientId: number;
}

const TreatmentPlans: React.FC<TreatmentPlansProps> = ({ patientId }) => {
    const { getToken } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlan, setNewPlan] = useState({ title: '', items: [] as PlanItem[] });
    const [newItem, setNewItem] = useState({ name: '', price: '' });

    useEffect(() => {
        fetchPlans();
    }, [patientId]);

    const fetchPlans = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`/api/records/plans/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setPlans(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleAddItem = () => {
        if (!newItem.name || !newItem.price) return;
        setNewPlan(prev => ({
            ...prev,
            items: [...prev.items, { name: newItem.name, price: Number(newItem.price) }]
        }));
        setNewItem({ name: '', price: '' });
    };

    const handleSavePlan = async () => {
        try {
            const token = await getToken();
            const total = newPlan.items.reduce((acc, i) => acc + i.price, 0);

            await fetch('/api/records/plans', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId,
                    title: newPlan.title,
                    totalCost: total,
                    items: newPlan.items
                })
            });
            setIsCreating(false);
            setNewPlan({ title: '', items: [] });
            fetchPlans();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-slate-50 h-full flex flex-col animate-in fade-in">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calculator size={20} className="text-emerald-600" /> Orçamentos e Planos
                </h3>
                {!isCreating && (
                    <LuxButton onClick={() => setIsCreating(true)} icon={<Plus size={16} />}>Novo Plano</LuxButton>
                )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {isCreating ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto">
                        <h4 className="font-bold text-lg mb-4">Novo Orçamento</h4>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Título do Plano</label>
                            <input
                                className="w-full p-2 border rounded-lg"
                                placeholder="Ex: Tratamento Ortodôntico Completo"
                                value={newPlan.title}
                                onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 mb-2">Procedimentos</label>
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                                {newPlan.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm p-2 bg-white rounded border border-slate-100">
                                        <span>{item.name}</span>
                                        <span className="font-mono">R$ {item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200">
                                    <input
                                        className="flex-1 text-sm p-2 border rounded"
                                        placeholder="Procedimento..."
                                        value={newItem.name}
                                        onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                    <input
                                        className="w-24 text-sm p-2 border rounded"
                                        placeholder="Valor"
                                        type="number"
                                        value={newItem.price}
                                        onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                                    />
                                    <button onClick={handleAddItem} className="bg-slate-200 hover:bg-slate-300 px-3 rounded text-slate-600 font-bold">+</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2 px-2">
                                <span className="text-sm text-slate-500">Total Estimado:</span>
                                <span className="text-lg font-bold text-emerald-600">
                                    R$ {newPlan.items.reduce((acc, i) => acc + i.price, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSavePlan} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700">Salvar Plano</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <FileText size={20} />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${plan.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {plan.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{plan.title}</h4>
                                <p className="text-xs text-slate-400 mb-4">{new Date(plan.createdAt).toLocaleDateString()}</p>

                                <div className="space-y-2 mb-4">
                                    {plan.items?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-slate-600 border-b border-slate-50 pb-1">
                                            <span>{item.name}</span>
                                            <span>R$ {Number(item.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {plan.items && plan.items.length > 3 && (
                                        <p className="text-[10px] text-slate-400 text-center">+ {plan.items.length - 3} itens</p>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                    <span className="text-xs text-slate-500 font-bold">Total</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        R$ {Number(plan.totalCost).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {plans.length === 0 && (
                            <div className="col-span-full text-center py-12 opacity-50">
                                <Calculator size={48} className="mx-auto mb-4 text-slate-300" />
                                <p>Nenhum plano de tratamento criado.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreatmentPlans;
