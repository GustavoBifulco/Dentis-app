import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingState } from './Shared';

const MarginAnalysis: React.FC = () => {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // Mock data for now, ideally this comes from a specialized endpoint
        // aggregating Procedure Costs vs Prices
        const fetchAnalysis = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                // reusing procedures endpoint to calculate client-side for now
                const res = await api.get('/procedures', token);

                if (Array.isArray(res)) {
                    let totalMargin = 0;
                    let profitableCount = 0;
                    let lossCount = 0;
                    let totalProcedures = 0;

                    // Flatten categories
                    const allProcs = res.flatMap((cat: any) => cat.procedures || []);

                    allProcs.forEach((p: any) => {
                        const price = Number(p.price || 0);
                        const cost = Number(p.cost || 0);
                        const margin = price - cost;

                        if (margin > 0) profitableCount++;
                        else lossCount++;

                        totalMargin += margin;
                        totalProcedures++;
                    });

                    setStats({
                        avgMargin: totalProcedures ? totalMargin / totalProcedures : 0,
                        profitableCount,
                        lossCount,
                        totalProcedures
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [getToken]);

    if (loading) return <LoadingState />;

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                <PieChart className="text-indigo-600" />
                Análise de Margem (Profit Engine)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-600 font-bold text-xs uppercase">Margem Média</span>
                    <div className="flex items-center gap-2 mt-1">
                        <TrendingUp size={24} className="text-emerald-500" />
                        <span className="text-2xl font-black text-emerald-700">R$ {stats?.avgMargin?.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <span className="text-blue-600 font-bold text-xs uppercase">Procedimentos Lucrativos</span>
                    <div className="flex items-center gap-2 mt-1">
                        <DollarSign size={24} className="text-blue-500" />
                        <span className="text-2xl font-black text-blue-700">{stats?.profitableCount}</span>
                    </div>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <span className="text-red-600 font-bold text-xs uppercase">Prejuízo / Risco</span>
                    <div className="flex items-center gap-2 mt-1">
                        <TrendingDown size={24} className="text-red-500" />
                        <span className="text-2xl font-black text-red-700">{stats?.lossCount}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <p className="text-sm text-slate-500">
                    * Dados calculados com base no Custo Clínico (BOM) vs Preço de Venda atual.
                </p>
            </div>
        </div>
    );
};

export default MarginAnalysis;
