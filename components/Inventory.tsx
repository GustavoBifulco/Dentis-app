import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react'; // Importando o hook do Clerk
import { Services } from '../lib/services';
import { StockItem } from '../types';
import { LoadingState, EmptyState, SectionHeader } from './Shared';
import { Plus, ChevronDown, Box, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory: React.FC = () => {
  const { user, isLoaded } = useUser(); // Pegando dados do usuário
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Só carrega se o usuário estiver logado e tiver ID
      if (!isLoaded || !user?.id) return;

      try {
        // Passamos o user.id para o serviço e usamos getAll (conforme definido no services.ts)
        const data = await Services.inventory.getAll(user.id);
        // Verifica se é array, pois o backend retorna lista direta
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Erro ao carregar estoque:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (isLoaded && user) {
        load();
    }
  }, [isLoaded, user?.id]);

  // Group items by category (Specialty)
  const categories = Array.from(new Set(items.map(i => i.category)));
  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {} as Record<string, StockItem[]>);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader 
        title="Controle de Materiais" 
        subtitle="Estoque inteligente organizado por especialidades."
        action={
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition shadow-lg shadow-slate-900/20">
            <Plus size={18} />
            Novo Item
          </button>
        }
      />

      {categories.length === 0 ? (
         <EmptyState title="Estoque Vazio" description="Comece adicionando seus materiais." onAction={()=>{}} actionLabel="Adicionar" />
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {categories.map((cat) => {
             const categoryItems = groupedItems[cat];
             const criticalCount = categoryItems.filter(i => i.quantity <= i.minQuantity).length;
             const isExpanded = expandedCategory === cat;

             return (
               <motion.div 
                 layout 
                 key={cat}
                 onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                 className={`
                    relative overflow-hidden cursor-pointer transition-colors duration-300
                    ${isExpanded ? 'bg-white ring-2 ring-lux-accent/20' : 'bg-white hover:bg-lux-subtle'}
                    border border-lux-border rounded-[2.5rem] shadow-sm
                 `}
               >
                 <motion.div layout="position" className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isExpanded ? 'bg-lux-accent text-white' : 'bg-lux-subtle text-lux-text'}`}>
                          <Box size={28} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-lux-text">{cat}</h3>
                          <p className="text-lux-text-secondary text-sm font-medium">{categoryItems.length} Itens cadastrados</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-6">
                       {criticalCount > 0 && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full border border-rose-100">
                             <AlertTriangle size={16} className="text-rose-600" />
                             <span className="text-xs font-black text-rose-600 uppercase tracking-widest">{criticalCount} Críticos</span>
                          </div>
                       )}
                       <motion.div 
                         animate={{ rotate: isExpanded ? 180 : 0 }}
                         className="w-10 h-10 rounded-full bg-lux-subtle flex items-center justify-center text-lux-text"
                       >
                          <ChevronDown size={20} />
                       </motion.div>
                    </div>
                 </motion.div>

                 <AnimatePresence>
                    {isExpanded && (
                       <motion.div 
                         initial={{ opacity: 0 }} 
                         animate={{ opacity: 1 }} 
                         exit={{ opacity: 0 }}
                         className="px-8 pb-8"
                       >
                          <div className="bg-lux-subtle/30 rounded-3xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {categoryItems.map(item => (
                                <div key={item.id} className="bg-white p-6 rounded-2xl border border-lux-border/50 hover:border-lux-accent/50 transition-colors group">
                                   <div className="flex justify-between items-start mb-4">
                                      <span className="font-bold text-lux-text text-lg">{item.name}</span>
                                      {item.quantity <= item.minQuantity ? (
                                         <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                                      ) : (
                                         <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                      )}
                                   </div>
                                   <div className="flex justify-between items-end">
                                      <div>
                                         <p className="text-[10px] font-bold text-lux-text-secondary uppercase tracking-widest mb-1">Em Estoque</p>
                                         <p className="text-2xl font-black text-lux-text">{item.quantity} <span className="text-sm font-medium text-lux-text-secondary">{item.unit}</span></p>
                                      </div>
                                      <button className="text-xs font-bold text-lux-accent opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wide bg-lux-subtle px-3 py-1 rounded-lg">
                                         Ajustar
                                      </button>
                                   </div>
                                </div>
                             ))}
                             
                             <div className="border-2 border-dashed border-lux-border rounded-2xl flex flex-col items-center justify-center p-6 text-lux-text-secondary hover:border-lux-accent/50 hover:bg-lux-subtle transition-colors cursor-pointer min-h-[140px]">
                                <Plus size={32} className="opacity-30 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-widest">Adicionar em {cat}</span>
                             </div>
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

export default Inventory;
