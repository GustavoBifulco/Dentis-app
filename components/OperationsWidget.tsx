import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

const OperationsWidget: React.FC = () => {
    const { getToken } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOps = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const res = await api.get('/dashboard/operations', token);
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOps();
    }, [getToken]);

    if (loading) return <div className="animate-pulse h-64 bg-slate-50 rounded-3xl" />;

    const hasIssues = (data?.lowStock?.length > 0) || (data?.delayedLabs?.length > 0);

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-indigo-600" size={20} />
                    Operações Hoje
                </h3>
                {!hasIssues && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Tudo Ok
                    </span>
                )}
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                {/* Low Stock Section */}
                {data?.lowStock?.length > 0 && (
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                        <h4 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
                            <Package size={16} /> Estoque Baixo ({data.lowStock.length})
                        </h4>
                        <div className="space-y-2">
                            {data.lowStock.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between bg-white/60 p-2 rounded-lg text-sm">
                                    <span className="font-medium text-slate-700 truncate">{item.name}</span>
                                    <span className="font-bold text-red-600">{item.quantity} <span className="text-slate-400 text-xs font-normal">{item.unit}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Delayed Labs Section */}
                {data?.delayedLabs?.length > 0 && (
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                        <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} /> Laboratório Atrasado ({data.delayedLabs.length})
                        </h4>
                        <div className="space-y-2">
                            {data.delayedLabs.map((lab: any) => (
                                <div key={lab.id} className="flex items-center justify-between bg-white/60 p-2 rounded-lg text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{lab.patientName || 'Paciente'}</span>
                                        <span className="text-xs text-slate-500">{lab.laboratoryName}</span>
                                    </div>
                                    <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-md">Atra.</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!hasIssues && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                        <CheckCircle2 size={48} className="mb-2 opacity-20" />
                        <p className="font-medium text-sm">Nenhuma pendência operacional.</p>
                    </div>
                )}
            </div>

            <button className="mt-4 w-full py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors">
                Ver Relatório Completo <ArrowRight size={12} />
            </button>
        </div>
    );
};

export default OperationsWidget;
