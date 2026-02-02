import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TestTube,
  CheckCircle2,
  Clock,
  Package,
  Bike, // Ícone de Motoboy/Bike
  Calendar,
  AlertCircle
} from 'lucide-react';
import { LabOrder } from '../types'; // Certifique-se que o caminho está correto

// --- MOCK DATA PARA VISUALIZAÇÃO ---
// Em produção, isso virá da API via useEffect
const MOCK_ORDERS: LabOrder[] = [
  { id: 1, clinicId: 1, patientName: 'Ana Silva', procedure: 'Prótese Total Sup', labName: 'Dental Art', status: 'requested', deadline: '2024-03-25', cost: 1200 },
  { id: 2, clinicId: 1, patientName: 'Carlos Souza', procedure: 'Coroa Cerâmica #14', labName: 'Precision Lab', status: 'production', deadline: '2024-03-28', cost: 850 },
  { id: 3, clinicId: 1, patientName: 'Beatriz Lima', procedure: 'Placa Bruxismo', labName: 'Dental Art', status: 'ready', deadline: '2024-03-24', cost: 400 },
  { id: 4, clinicId: 1, patientName: 'Jorge Mendes', procedure: 'Inlay E-max', labName: 'Precision Lab', status: 'delivered', deadline: '2024-03-20', cost: 600 },
];

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
  const [orders, setOrders] = useState<LabOrder[]>(MOCK_ORDERS);
  const [courierRequested, setCourierRequested] = useState(false);

  // Simula o avanço do card para a próxima coluna ao clicar
  const advanceOrder = (id: number) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== id) return order;

      const currentIndex = COLUMNS.findIndex(c => c.id === order.status);
      // Se não for a última coluna, avança
      if (currentIndex !== -1 && currentIndex < COLUMNS.length - 1) {
        return { ...order, status: COLUMNS[currentIndex + 1].id as any };
      }
      return order;
    }));
  };

  // Efeito visual do botão de Motoboy
  const requestCourier = () => {
    if (courierRequested) return; // Evita duplo clique
    setCourierRequested(true);
    // Reseta o estado após 3 segundos
    setTimeout(() => setCourierRequested(false), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 p-6 lg:p-8">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logística Lab</h1>
          <p className="text-slate-500 font-medium mt-1">
            Controle visual de todas as suas próteses e trabalhos externos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão Mágico: Chamar Coleta */}
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
            {/* Ícone Trocável */}
            <div className="relative z-10">
              {courierRequested ? <CheckCircle2 size={20} /> : <Bike size={20} />}
            </div>

            <span className="relative z-10">
              {courierRequested ? 'Solicitação Enviada!' : 'Chamar Coleta'}
            </span>

            {/* Ripple Effect Background */}
            {courierRequested && (
              <motion.div
                layoutId="ripple-effect"
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, ease: "linear" }}
              />
            )}
          </motion.button>

          {/* Botão Novo Pedido */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <Plus size={22} />
          </motion.button>
        </div>
      </div>

      {/* --- KANBAN BOARD --- */}
      <div className="flex-1 overflow-x-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[1000px] h-full">

          {COLUMNS.map(column => {
            const columnOrders = orders.filter(o => o.status === column.id);
            const count = columnOrders.length;

            return (
              <div key={column.id} className="flex flex-col h-full">

                {/* Header da Coluna */}
                <div className={`
                    flex items-center gap-3 p-4 rounded-t-2xl border-b-[3px] bg-white shadow-sm mb-4 relative overflow-hidden
                    ${column.borderColor}
                `}>
                  <div className={`p-2.5 rounded-xl ${column.bg} ${column.color}`}>
                    <column.icon size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{column.title}</h3>

                  {/* Badge de Contagem */}
                  <span className={`
                      ml-auto text-xs font-bold px-2.5 py-1 rounded-full
                      ${count > 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}
                  `}>
                    {count}
                  </span>
                </div>

                {/* Drop Zone (Corpo da Coluna) */}
                <div className="flex-1 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 p-3 space-y-3 relative transition-colors hover:border-slate-300">
                  <AnimatePresence mode='popLayout'>
                    {columnOrders.map(order => (
                      <motion.div
                        key={order.id}
                        layoutId={`card-${order.id}`}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => advanceOrder(order.id)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer group relative overflow-hidden z-10"
                      >
                        {/* Faixa lateral colorida */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${column.accent}`} />

                        <div className="pl-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Paciente</span>
                              <span className="text-xs font-bold text-slate-700">{order.patientName}</span>
                            </div>
                            <span className="text-[9px] font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full text-slate-500 truncate max-w-[80px]">
                              {order.labName}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                            {order.procedure}
                          </h4>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-3 border-t border-slate-50">
                            {/* Lógica simples de prazo: Se status for Delivered, mostra check, senão mostra data */}
                            {column.id === 'delivered' ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <span className="text-emerald-600 font-bold">Entregue</span>
                              </>
                            ) : (
                              <>
                                <Calendar size={12} />
                                <span className={new Date(order.deadline) < new Date() ? "text-red-500 font-bold" : ""}>
                                  {new Date(order.deadline).toLocaleDateString('pt-BR')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Hint de clique (Aparece no hover) */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty State */}
                  {count === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-2">
                        <Package size={20} className="text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">Vazio</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}