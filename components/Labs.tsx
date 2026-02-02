import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TestTube,
  CheckCircle2,
  Clock,
  Package,
  Bike,
  Calendar,
  Cloud,
  Loader2
} from 'lucide-react';
import { LabOrder } from '../types';
import CreateLabOrder from './CreateLabOrder';

// Configuração das Colunas do Kanban
const COLUMNS = [
  {
    id: 'requested',
    title: 'A Enviar',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    accent: 'bg-orange-500',
    borderColor: 'border-orange-200'
  },
  {
    id: 'production',
    title: 'No Laboratório',
    icon: TestTube,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    accent: 'bg-blue-500',
    borderColor: 'border-blue-200'
  },
  {
    id: 'ready',
    title: 'A Caminho',
    icon: Bike,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    accent: 'bg-purple-500',
    borderColor: 'border-purple-200'
  },
  {
    id: 'delivered',
    title: 'No Consultório',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    accent: 'bg-emerald-500',
    borderColor: 'border-emerald-200'
  },
];

export default function Labs() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courierRequested, setCourierRequested] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const advanceOrder = (id: number) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== id) return order;
      const currentIndex = COLUMNS.findIndex(c => c.id === order.status);
      if (currentIndex !== -1 && currentIndex < COLUMNS.length - 1) {
        return { ...order, status: COLUMNS[currentIndex + 1].id as any };
      }
      return order;
    }));
  };

  const requestCourier = () => {
    if (courierRequested) return;
    setCourierRequested(true);
    setTimeout(() => setCourierRequested(false), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 p-6 lg:p-8">
      {/* Modal de Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateLabOrder
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onOrderCreated={(newOrder) => {
              setOrders(prev => [newOrder as LabOrder, ...prev]);
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logística Lab</h1>
          <p className="text-slate-500 font-medium mt-1">
            Controle visual de todas as suas próteses e trabalhos externos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={requestCourier}
            className={`
               relative overflow-hidden px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all duration-300
               flex items-center gap-3 group
               ${courierRequested
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl'
              }
             `}
          >
            <div className="relative z-10">
              {courierRequested ? <CheckCircle2 size={20} /> : <Bike size={20} />}
            </div>
            <span className="relative z-10 font-bold">
              {courierRequested ? 'Solicitação Enviada!' : 'Chamar Coleta'}
            </span>
            {courierRequested && (
              <motion.div
                layoutId="ripple"
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, ease: "linear" }}
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={22} />
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold">Carregando pedidos...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[1000px] h-full">
            {COLUMNS.map(column => {
              const columnOrders = orders.filter(o => o.status === column.id);
              const count = columnOrders.length;

              return (
                <div key={column.id} className="flex flex-col h-full">
                  <div className={`
                      flex items-center gap-3 p-4 rounded-t-2xl border-b-[3px] bg-white shadow-sm mb-4
                      ${column.borderColor}
                  `}>
                    <div className={`p-2.5 rounded-xl ${column.bg} ${column.color}`}>
                      <column.icon size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{column.title}</h3>
                    <span className={`
                        ml-auto text-xs font-bold px-2.5 py-1 rounded-full
                        ${count > 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}
                    `}>
                      {count}
                    </span>
                  </div>

                  <div className="flex-1 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 p-3 space-y-3 relative overflow-y-auto">
                    <AnimatePresence mode='popLayout'>
                      {columnOrders.map(order => (
                        <motion.div
                          key={order.id}
                          layoutId={`card-${order.id}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)" }}
                          onClick={() => advanceOrder(order.id)}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer group relative overflow-hidden"
                        >
                          <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${column.accent}`} />

                          <div className="pl-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Paciente</span>
                                <span className="text-xs font-bold text-slate-800">{order.patientName}</span>
                              </div>
                              {order.isDigital && (
                                <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg" title="Fluxo Digital">
                                  <Cloud size={14} />
                                </div>
                              )}
                            </div>

                            <h4 className="font-bold text-slate-700 text-sm mb-3 group-hover:text-indigo-600 transition-colors">
                              {order.procedure}
                            </h4>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <Calendar size={12} />
                                <span>{order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Sem prazo'}</span>
                              </div>
                              <span className="text-[10px] font-black text-slate-900">
                                {order.labName || 'Sem laboratório'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {count === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                        <Package size={40} className="mb-2" />
                        <span className="text-sm font-bold">Nenhum pedido</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}