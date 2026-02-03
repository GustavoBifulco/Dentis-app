import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react'; // Importando Hook Clerk
import { Services } from '../lib/services';
import { Procedure } from '../types';
import { LoadingState, EmptyState, SectionHeader } from './Shared';
import { Plus, ChevronDown, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Procedures: React.FC = () => {
  const { user, isLoaded } = useUser(); // Dados do usuário
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!isLoaded || !user?.id) return;

      try {
        // Usa getAll(user.id) compatível com o novo services.ts
        const data = await Services.procedures.getAll(user.id);

        if (Array.isArray(data)) {
          const enhancedProcs = data.map((p: any) => ({
            ...p,
            // Fallback para categoria se vier vazio do banco
            category: p.category || (p.name.includes('Consulta') ? 'Clínica Geral' : 'Odontologia Restauradora')
          }));
          setProcedures(enhancedProcs);
        } else {
          setProcedures([]);
        }
      } catch (error) {
        console.error("Erro ao carregar procedimentos:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      load();
    }
  }, [isLoaded, user?.id]);

  const categories = Array.from(new Set(procedures.map(p => p.category)));
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = procedures.filter(p => p.category === cat);
    return acc;
  }, {} as Record<string, Procedure[]>);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="Catálogo de Procedimentos"
        subtitle="Gerencie preços, códigos TUSS e materiais vinculados."
        action={
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
            <Plus size={18} />
            Novo Procedimento
          </button>
        }
      />

      {procedures.length === 0 ? (
        <EmptyState
          title="Catálogo Vazio"
          description="Cadastre os procedimentos realizados na clínica para usar no orçamento."
          actionLabel="Cadastrar Procedimento"
          onAction={() => { }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {categories.map((cat) => {
            const categoryProcs = grouped[cat];
            const isExpanded = expandedCategory === cat;

            return (
              <motion.div
                layout
                key={cat}
                onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                className={`
                        relative overflow-hidden cursor-pointer transition-colors duration-300
                        ${isExpanded ? 'bg-white ring-2 ring-indigo-500/20' : 'bg-white hover:bg-slate-50'}
                        border border-lux-border rounded-[2.5rem] shadow-sm
                    `}
              >
                <motion.div layout="position" className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Stethoscope size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{cat}</h3>
                      <p className="text-slate-500 text-sm font-medium">{categoryProcs.length} Procedimentos</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-8 pb-8"
                    >
                      <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                        <table className="w-full">
                          <thead className="bg-slate-100/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Código</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Procedimento</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Duração</th>
                              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase">Valor</th>
                              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {categoryProcs.map(proc => (
                              <tr key={proc.id} className="hover:bg-white transition group">
                                <td className="px-6 py-4 text-sm font-mono text-slate-500">{proc.code}</td>
                                <td className="px-6 py-4 font-bold text-slate-900">{proc.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{proc.durationMinutes || proc.duration} min</td>
                                <td className="px-6 py-4 text-right font-black text-slate-800">R$ {Number(proc.price).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                  <button className="text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default Procedures;
