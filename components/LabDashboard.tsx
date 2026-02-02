import React, { useState } from 'react';
import { QrCode, ClipboardList, AlertTriangle, DollarSign, Archive, Truck } from 'lucide-react';
import { IslandCard } from './Shared';

export const LabDashboard = () => {
    // Mock Data
    const metrics = {
        newOrders: 12,
        delayed: 3,
        revenue: 45200.00
    };

    const orders = [
        { id: '#4920', dentist: 'Dr. Roberto', item: 'Coroa E-Max (24)', status: 'Novo', deadline: 'Hoje' },
        { id: '#4921', dentist: 'Dra. Carla', item: 'Prótese Total Sup', status: 'Produção', deadline: 'Amanhã' },
        { id: '#4918', dentist: 'Clínica Sorriso', item: 'Lente de Contato (6)', status: 'Atrasado', deadline: 'Ontem' },
    ];

    return (
        <div className="space-y-6">

            {/* HERDER & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-lux-text">Lab Control</h1>
                    <p className="text-lux-text-secondary">Visão geral da produção</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                    <QrCode size={20} />
                    Receber Pedido (Scan)
                </button>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Novos Pedidos</p>
                        <p className="text-3xl font-black text-slate-800">{metrics.newOrders}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                        <ClipboardList size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atrasados</p>
                        <p className="text-3xl font-black text-red-500">{metrics.delayed}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-xl text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex items-center justify-between text-white">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento</p>
                        <p className="text-3xl font-black text-green-400">R$ {metrics.revenue.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl text-green-400">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* PRODUCTION LIST (Simple Kanban) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* LIST */}
                <div className="md:col-span-8">
                    <IslandCard className="min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-lux-text">Filar de Produção</h3>
                            <button className="text-sm text-indigo-600 font-bold hover:underline">Ver Todos</button>
                        </div>

                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-lux-subtle hover:bg-white border border-transparent hover:border-lux-border transition-all rounded-xl group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-12 rounded-full ${order.status === 'Atrasado' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                                        <div>
                                            <p className="font-bold text-lux-text">{order.item}</p>
                                            <p className="text-sm text-lux-text-secondary">{order.id} • {order.dentist}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'Novo' ? 'bg-blue-100 text-blue-600' :
                                                order.status === 'Atrasado' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <p className="text-xs text-lux-text-secondary mt-1">Prazo: {order.deadline}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </IslandCard>
                </div>

                {/* LOGISTICS WIDGET */}
                <div className="md:col-span-4">
                    <IslandCard className="h-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Truck size={20} />
                                Logística
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                    <p className="text-xs font-bold opacity-70 uppercase">Próxima Coleta</p>
                                    <p className="text-xl font-bold">14:30</p>
                                    <p className="text-sm opacity-80">Motoboy: Carlos (ABC-1234)</p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                    <p className="text-xs font-bold opacity-70 uppercase">Entregas Hoje</p>
                                    <p className="text-xl font-bold">8 Pacotes</p>
                                </div>
                            </div>
                            <button className="w-full mt-6 bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                                Chamar Motoboy
                            </button>
                        </div>
                        {/* DECORATION */}
                        <Truck size={120} className="absolute -bottom-6 -right-6 text-indigo-800 opacity-50 rotate-[-10deg]" />
                    </IslandCard>
                </div>

            </div>
        </div>
    );
};
