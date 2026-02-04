import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Search,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package
} from 'lucide-react';
import { Services } from '../lib/services';
import { Procedure, StockItem, ProcedureBOMItem } from '../types';
import { LoadingState } from './Shared';

export default function ProcedureEngineer() {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();

  // Data State
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [inventory, setInventory] = useState<StockItem[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [searchInventory, setSearchInventory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initial Load
  useEffect(() => {
    async function loadData() {
      if (!isLoaded || !user) return;
      try {
        const token = await getToken();
        if (!token) return;

        const [procs, stock] = await Promise.all([
          Services.procedures.getAll(token),
          Services.inventory.getAll(token)
        ]);

        setProcedures(procs);
        setInventory(stock);
      } catch (err) {
        console.error("Failed to load engine data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isLoaded, user]);

  // Add Item to BOM
  const addToBOM = (stockItem: StockItem) => {
    if (!selectedProcedure) return;

    const newItem: ProcedureBOMItem = {
      id: Math.random().toString(36).substr(2, 9),
      inventoryId: stockItem.id,
      name: stockItem.name,
      quantity: 1,
      unitCost: Number(stockItem.price || 0),
      type: 'material'
    };

    const currentBOM = selectedProcedure.bom || [];
    // Check if exists
    const exists = currentBOM.find(i => i.inventoryId === stockItem.id);
    if (exists) {
      updateBOMItem(exists.id, { quantity: exists.quantity + 1 });
    } else {
      setSelectedProcedure({
        ...selectedProcedure,
        bom: [...currentBOM, newItem]
      });
    }
  };

  // Update BOM Item
  const updateBOMItem = (itemId: string, changes: Partial<ProcedureBOMItem>) => {
    if (!selectedProcedure) return;

    const newBOM = (selectedProcedure.bom || []).map(item => {
      if (item.id === itemId) return { ...item, ...changes };
      return item;
    });

    setSelectedProcedure({ ...selectedProcedure, bom: newBOM });
  };

  // Remove BOM Item
  const removeBOMItem = (itemId: string) => {
    if (!selectedProcedure) return;
    const newBOM = (selectedProcedure.bom || []).filter(i => i.id !== itemId);
    setSelectedProcedure({ ...selectedProcedure, bom: newBOM });
  };

  // Save Changes
  const handleSave = async () => {
    if (!selectedProcedure) return;
    setIsSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      // Calculate total cost for cache
      const totalCost = (selectedProcedure.bom || []).reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);

      await Services.procedures.update(token, selectedProcedure.id, {
        bom: selectedProcedure.bom,
        cost: totalCost
      });

      // Update local list
      setProcedures(prev => prev.map(p => p.id === selectedProcedure.id ? { ...selectedProcedure, cost: totalCost } : p));

      // Show feedback (could be toast)
      alert('Ficha técnica salva com sucesso!');
    } catch (err) {
      console.error("Save failed", err);
      alert('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations
  const totalCost = (selectedProcedure?.bom || []).reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const price = Number(selectedProcedure?.price || 0);
  const margin = price - totalCost;
  const marginPercent = price > 0 ? (margin / price) * 100 : 0;

  const filteredInventory = inventory.filter(i =>
    i.name.toLowerCase().includes(searchInventory.toLowerCase())
  );

  if (loading) return <LoadingState />;

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Coins className="text-emerald-500" size={32} />
            Engenharia de Preços
          </h1>
          <p className="text-slate-500 font-medium mt-1">Defina os materiais consumidos em cada procedimento para cálculo automático de margem.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">

        {/* LEFT COL: Configuration */}
        <div className="col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Procedure Selector */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
            <div className="flex-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Procedimento em Foco</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                value={selectedProcedure?.id || ''}
                onChange={e => {
                  const p = procedures.find(p => p.id === Number(e.target.value));
                  setSelectedProcedure(p || null);
                }}
              >
                <option value="">Selecione um procedimento para editar...</option>
                {procedures.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
            {selectedProcedure && (
              <div className="flex items-center gap-6 px-6 border-l border-slate-200">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Preço Venda</p>
                  <p className="text-xl font-black text-slate-900">R$ {price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Margem Atual</p>
                  <div className={`flex items-center gap-2 ${margin > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className="text-xl font-black">{marginPercent.toFixed(1)}%</span>
                    {margin > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedProcedure ? (
            <>
              {/* BOM List */}
              <div className="flex-1 overflow-y-auto p-2">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] uppercase font-black text-slate-400">
                    <tr>
                      <th className="text-left px-6 py-3">Item / Material</th>
                      <th className="text-left px-6 py-3">Custo Unit.</th>
                      <th className="text-center px-6 py-3">Qtd. Prevista</th>
                      <th className="text-right px-6 py-3">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedProcedure.bom || []).map(item => (
                      <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">R$ {item.unitCost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg">
                            <button
                              onClick={() => updateBOMItem(item.id, { quantity: Math.max(0.1, item.quantity - 0.5) })}
                              className="px-2 py-1 hover:bg-slate-100 text-slate-500"
                            >-</button>
                            <input
                              className="w-12 text-center text-sm font-bold border-none outline-none"
                              value={item.quantity}
                              onChange={e => updateBOMItem(item.id, { quantity: Number(e.target.value) })}
                              type="number"
                              step="0.1"
                            />
                            <button
                              onClick={() => updateBOMItem(item.id, { quantity: item.quantity + 0.5 })}
                              className="px-2 py-1 hover:bg-slate-100 text-emerald-600"
                            >+</button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                          R$ {(item.unitCost * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-2 text-center">
                          <button
                            onClick={() => removeBOMItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(selectedProcedure.bom || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="font-medium">Nenhum material vinculado.</p>
                          <p className="text-xs">Selecione itens do estoque à direita para adicionar.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Summary */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Custo Clínico Total</p>
                  <p className="text-3xl font-black">R$ {totalCost.toFixed(2)}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : <><Save size={20} /> Salvar Ficha Técnica</>}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <Search size={48} className="mb-4 text-slate-200" />
              <h3 className="text-lg font-bold text-slate-600">Selecione um Procedimento</h3>
              <p className="max-w-xs mx-auto">Use o seletor acima para começar a editar a ficha técnica e analisar custos.</p>
            </div>
          )}
        </div>

        {/* RIGHT COL: Inventory Source */}
        <div className="col-span-4 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-3">
              <Package size={20} className="text-indigo-500" />
              Estoque Disponível
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 transition-colors"
                placeholder="Buscar material..."
                value={searchInventory}
                onChange={e => setSearchInventory(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredInventory.map(item => (
              <motion.div
                key={item.id}
                layoutId={`inv-${item.id}`}
                className="group p-3 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between"
                onClick={() => addToBOM(item)}
              >
                <div>
                  <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-700">{item.name}</p>
                  <p className="text-xs text-slate-400 font-mono">Custo: R$ {Number(item.price).toFixed(2)} / {item.unit}</p>
                </div>
                <button className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
