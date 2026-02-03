import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Services } from '../lib/services';
import { StockItem } from '../types';
import { LoadingState, EmptyState, SectionHeader } from './Shared';
import { Plus, Edit2, Package, AlertCircle, Search, Grid3x3, List, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditInventoryModal from './EditInventoryModal';

type ViewMode = 'grid' | 'list';

const Inventory: React.FC = () => {
   const { user, isLoaded } = useUser();
   const { getToken } = useAuth();
   const [items, setItems] = useState<StockItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [editingItem, setEditingItem] = useState<StockItem | null>(null);
   const [viewMode, setViewMode] = useState<ViewMode>('grid');
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [showLowStockOnly, setShowLowStockOnly] = useState(false);

   useEffect(() => {
      async function load() {
         if (!isLoaded || !user?.id) return;

         try {
            const token = await getToken();
            if (!token) return;
            const data = await Services.inventory.getAll(token);
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

   const handleEditSuccess = () => {
      if (isLoaded && user) {
         getToken().then(token => {
            if (token) {
               Services.inventory.getAll(token).then(data => {
                  if (Array.isArray(data)) setItems(data);
               });
            }
         });
      }
   };

   // Filter and search logic
   const filteredItems = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesLowStock = !showLowStockOnly || item.quantity <= item.minQuantity;

      return matchesSearch && matchesCategory && matchesLowStock;
   });

   // Group by category
   const categories = Array.from(new Set(items.map(i => i.category || 'Sem Categoria')));
   const groupedItems = categories.reduce((acc, cat) => {
      acc[cat] = filteredItems.filter(i => (i.category || 'Sem Categoria') === cat);
      return acc;
   }, {} as Record<string, StockItem[]>);

   const totalLowStock = items.filter(i => i.quantity <= i.minQuantity).length;

   if (loading) return <LoadingState />;

   return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
         {/* Header with Controls */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-slate-900">Controle de Estoque</h1>
               <p className="text-slate-500 font-medium mt-1">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
                  {totalLowStock > 0 && (
                     <span className="ml-2 text-red-600 font-bold">
                        • {totalLowStock} em falta
                     </span>
                  )}
               </p>
            </div>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg">
               <Plus size={18} />
               Novo Item
            </button>
         </div>

         {/* Filters and Search */}
         <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
               {/* Search */}
               <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                     type="text"
                     placeholder="Buscar por nome, categoria ou fornecedor..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                  {searchTerm && (
                     <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                     >
                        <X size={18} />
                     </button>
                  )}
               </div>

               {/* Category Filter */}
               <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
               >
                  <option value="">Todas as Categorias</option>
                  {categories.sort().map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                  ))}
               </select>

               {/* Low Stock Filter */}
               <button
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition ${showLowStockOnly
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                     }`}
               >
                  <Filter size={18} />
                  Estoque Baixo
               </button>

               {/* View Toggle */}
               <div className="flex bg-slate-100 rounded-xl p-1">
                  <button
                     onClick={() => setViewMode('grid')}
                     className={`px-3 py-2 rounded-lg transition ${viewMode === 'grid'
                           ? 'bg-white text-blue-600 shadow-sm'
                           : 'text-slate-500 hover:text-slate-700'
                        }`}
                  >
                     <Grid3x3 size={18} />
                  </button>
                  <button
                     onClick={() => setViewMode('list')}
                     className={`px-3 py-2 rounded-lg transition ${viewMode === 'list'
                           ? 'bg-white text-blue-600 shadow-sm'
                           : 'text-slate-500 hover:text-slate-700'
                        }`}
                  >
                     <List size={18} />
                  </button>
               </div>
            </div>
         </div>

         {/* Content */}
         {filteredItems.length === 0 ? (
            <EmptyState
               title={searchTerm || selectedCategory || showLowStockOnly ? "Nenhum item encontrado" : "Estoque Vazio"}
               description={searchTerm || selectedCategory || showLowStockOnly ? "Tente ajustar os filtros" : "Comece adicionando seus materiais."}
               onAction={() => { }}
               actionLabel="Adicionar"
            />
         ) : (
            <div className="space-y-6">
               {Object.entries(groupedItems).map(([category, categoryItems]) => {
                  if (categoryItems.length === 0) return null;

                  const criticalCount = categoryItems.filter(i => i.quantity <= i.minQuantity).length;

                  return (
                     <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                     >
                        {/* Category Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                                    <Package size={24} strokeWidth={2.5} />
                                 </div>
                                 <div>
                                    <h3 className="text-xl font-black text-slate-900">{category}</h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                       {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'itens'}
                                    </p>
                                 </div>
                              </div>

                              {criticalCount > 0 && (
                                 <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                                    <AlertCircle size={16} className="text-red-600" />
                                    <span className="text-sm font-bold text-red-700">{criticalCount} em falta</span>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Items */}
                        <div className="p-6">
                           {viewMode === 'grid' ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                 {categoryItems.map(item => (
                                    <ItemCard key={item.id} item={item} onEdit={setEditingItem} />
                                 ))}
                              </div>
                           ) : (
                              <div className="space-y-2">
                                 {categoryItems.map(item => (
                                    <ItemRow key={item.id} item={item} onEdit={setEditingItem} />
                                 ))}
                              </div>
                           )}
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         )}

         <EditInventoryModal
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            onSuccess={handleEditSuccess}
            item={editingItem}
         />
      </div>
   );
};

// Card View Component
const ItemCard: React.FC<{ item: StockItem; onEdit: (item: StockItem) => void }> = ({ item, onEdit }) => {
   const isLowStock = item.quantity <= item.minQuantity;

   return (
      <motion.div
         whileHover={{ scale: 1.02 }}
         className={`relative p-5 rounded-xl border-2 transition-all group ${isLowStock
               ? 'bg-red-50 border-red-200 hover:border-red-300'
               : 'bg-slate-50 border-slate-200 hover:border-blue-300'
            }`}
      >
         <div className="absolute top-3 right-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isLowStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
         </div>

         <div className="mb-4">
            <h4 className="font-bold text-slate-900 text-base mb-1 pr-6">{item.name}</h4>
            {item.supplier && <p className="text-xs text-slate-500 font-medium">{item.supplier}</p>}
         </div>

         <div className="flex items-end justify-between mb-3">
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estoque</p>
               <p className={`text-3xl font-black ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                  {item.quantity}
                  <span className="text-sm font-medium text-slate-500 ml-1">{item.unit}</span>
               </p>
            </div>
            {item.price && (
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Preço</p>
                  <p className="text-sm font-bold text-slate-700">R$ {item.price.toFixed(2)}</p>
               </div>
            )}
         </div>

         {isLowStock && (
            <div className="mb-3 px-2 py-1.5 bg-red-100 rounded-lg">
               <p className="text-xs font-bold text-red-700 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Abaixo do mínimo ({item.minQuantity})
               </p>
            </div>
         )}

         <button
            onClick={() => onEdit(item)}
            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
         >
            <Edit2 size={14} />
            Editar
         </button>
      </motion.div>
   );
};

// List View Component
const ItemRow: React.FC<{ item: StockItem; onEdit: (item: StockItem) => void }> = ({ item, onEdit }) => {
   const isLowStock = item.quantity <= item.minQuantity;

   return (
      <div className={`flex items-center justify-between p-4 rounded-xl border transition-all group hover:shadow-md ${isLowStock ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200 hover:border-blue-300'
         }`}>
         <div className="flex items-center gap-4 flex-1">
            <div className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <div className="flex-1">
               <h4 className="font-bold text-slate-900">{item.name}</h4>
               {item.supplier && <p className="text-xs text-slate-500 mt-0.5">{item.supplier}</p>}
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="text-right">
               <p className="text-xs text-slate-400 font-bold uppercase">Estoque</p>
               <p className={`text-lg font-black ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                  {item.quantity} <span className="text-sm font-medium text-slate-500">{item.unit}</span>
               </p>
            </div>

            {item.price && (
               <div className="text-right w-24">
                  <p className="text-xs text-slate-400 font-bold uppercase">Preço</p>
                  <p className="text-sm font-bold text-slate-700">R$ {item.price.toFixed(2)}</p>
               </div>
            )}

            <button
               onClick={() => onEdit(item)}
               className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100"
            >
               <Edit2 size={14} />
               Editar
            </button>
         </div>
      </div>
   );
};

export default Inventory;
