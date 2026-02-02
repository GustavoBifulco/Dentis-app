import React, { useEffect, useState } from 'react';
import { Services } from '../lib/services'; // 🔌 Camada de Serviço
import { LabOrder } from '../types';
import { LoadingState, EmptyState, SectionHeader } from './Shared';
import { Plus } from 'lucide-react';

const Labs: React.FC = () => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 🔌 Chamada unificada
      const res = await Services.labs.list();
      if (res.ok) setOrders(res.data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Rede de Laboratórios"
        subtitle="Acompanhe próteses e trabalhos externos em tempo real."
        action={
          <button className="bg-white border-2 border-slate-100 text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition">
            <Plus size={18} />
            Novo Pedido
          </button>
        }
      />

      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-indigo-900/10">
        <div>
          <h3 className="text-2xl font-black mb-2 tracking-tight">Fluxo Digital</h3>
          <p className="text-indigo-200 font-medium max-w-md">
            Seus pedidos são enviados diretamente para os laboratórios parceiros. Sem WhatsApp, sem confusão.
          </p>
        </div>
        <div className="mt-6 md:mt-0 px-6 py-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
          <span className="text-2xl font-black">{orders.length}</span>
          <span className="text-xs uppercase font-bold text-indigo-200 ml-2 tracking-widest">Pedidos Ativos</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Nenhum pedido em andamento"
          description="Registre envios de moldagens ou arquivos digitais para laboratórios."
          actionLabel="Criar Pedido"
          onAction={() => { }}
        />
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-slate-900">{order.procedure}</p>
                <p className="text-sm text-slate-500">Paciente: {order.patientName} • Lab: {order.labName}</p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                  {order.status === 'ready' ? 'Pronto' : 'Produção'}
                </span>
                <p className="text-xs text-slate-400 mt-2 font-bold">Entrega: {order.deadline}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Labs;