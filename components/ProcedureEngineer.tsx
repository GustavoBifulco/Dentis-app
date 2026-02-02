import React, { useState } from 'react';
import { ArrowLeft, Box, Plus, Trash2, DollarSign, Clock, Save } from 'lucide-react';
import { IslandCard, LuxButton, SectionHeader } from './Shared';
import { MOCK_INVENTORY } from '../lib/mockData';

const ProcedureEngineer: React.FC = () => {
  const [basePrice, setBasePrice] = useState(350);
  const [procedureName, setProcedureName] = useState('Restauração Resina (3 Faces)');
  const [materials, setMaterials] = useState([
    { ...MOCK_INVENTORY[0], usedQty: 0.2 }, // Ex: 0.2 de um tubo
    { ...MOCK_INVENTORY[1], usedQty: 1 },   // 1 par de luvas
  ]);

  // Função fictícia de cálculo de custo unitário (preço / qtd_estimada_por_unidade)
  // No mundo real, cada item teria um "yield" (rendimento).
  const calculateCost = (item: any) => {
    // Simplificação: Custo proporcional simples
    // Se o preço é do "tubo", e usamos 0.2 do tubo.
    return item.price * item.usedQty;
  };

  const totalCost = materials.reduce((acc, item) => acc + calculateCost(item), 0);
  const profit = basePrice - totalCost;
  const margin = (profit / basePrice) * 100;

  const handleAddMaterial = () => {
    // Simula adicionar o primeiro item do inventário que não está na lista
    const newItem = MOCK_INVENTORY.find(i => !materials.some(m => m.id === i.id));
    if (newItem) {
        setMaterials([...materials, { ...newItem, usedQty: 1 }]);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
      <SectionHeader title="Engenharia de Procedimento" subtitle="Defina o preço de venda baseado no custo real dos materiais." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
         
         {/* LEFT SIDE: PRODUCT DEFINITION */}
         <div className="lg:col-span-7 flex flex-col gap-6">
            <IslandCard className="p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-6 z-10">
                    <div>
                        <label className="text-xs font-black text-lux-text-secondary uppercase tracking-widest mb-2 block">Nome do Procedimento</label>
                        <input 
                            type="text" 
                            value={procedureName}
                            onChange={(e) => setProcedureName(e.target.value)}
                            className="text-3xl md:text-4xl font-black text-lux-text bg-transparent outline-none w-full placeholder:text-lux-border"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-xs font-black text-lux-text-secondary uppercase tracking-widest mb-2 block flex items-center gap-2">
                                <DollarSign size={14}/> Preço de Venda
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-lux-text-secondary font-light">R$</span>
                                <input 
                                    type="number" 
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(Number(e.target.value))}
                                    className="text-4xl font-black text-lux-text bg-transparent outline-none w-32 border-b-2 border-lux-border focus:border-lux-accent transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-lux-text-secondary uppercase tracking-widest mb-2 block flex items-center gap-2">
                                <Clock size={14}/> Tempo Estimado
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    defaultValue={45}
                                    className="text-4xl font-black text-lux-text bg-transparent outline-none w-24 border-b-2 border-lux-border focus:border-lux-accent transition-colors"
                                />
                                <span className="text-xl text-lux-text-secondary font-light">min</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profit Gauge */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 mt-8">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Líquido Estimado</p>
                            <p className="text-4xl font-black text-emerald-400">R$ {profit.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-3xl font-black">{margin.toFixed(0)}%</p>
                             <p className="text-[10px] text-slate-400 uppercase">Margem</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden relative">
                        {/* Cost Bar */}
                        <div style={{ width: `${100-margin}%` }} className="h-full bg-rose-500 absolute left-0 top-0"></div>
                        {/* Profit Bar */}
                        <div style={{ width: `${margin}%` }} className="h-full bg-emerald-500 absolute right-0 top-0"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Custo: R$ {totalCost.toFixed(2)}</span>
                        <span>Lucro</span>
                    </div>
                </div>
            </IslandCard>
         </div>

         {/* RIGHT SIDE: RECIPE (MATERIALS) */}
         <div className="lg:col-span-5 flex flex-col">
            <div className="bg-lux-surface border border-lux-border rounded-[2rem] flex-1 flex flex-col overflow-hidden shadow-xl">
                <div className="p-6 border-b border-lux-border bg-lux-subtle flex justify-between items-center">
                    <h3 className="font-bold text-lux-text flex items-center gap-2">
                        <Box size={18} />
                        Receita do Procedimento
                    </h3>
                    <button onClick={handleAddMaterial} className="w-8 h-8 rounded-full bg-lux-text text-white flex items-center justify-center hover:bg-black transition">
                        <Plus size={16} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-lux-subtle/30">
                    <p className="text-xs text-lux-text-secondary font-medium mb-2 uppercase tracking-wide">Materiais Necessários</p>
                    
                    {materials.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-lux-border flex justify-between items-center group">
                            <div>
                                <p className="font-bold text-sm text-lux-text">{item.name}</p>
                                <p className="text-xs text-lux-text-secondary">{item.unit} (Custo ref: R$ {item.price})</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-black text-rose-600 text-sm">- R$ {calculateCost(item).toFixed(2)}</p>
                                    <p className="text-[10px] text-lux-text-secondary font-bold">Qtd: {item.usedQty}</p>
                                </div>
                                <button 
                                    onClick={() => setMaterials(materials.filter((_, i) => i !== index))}
                                    className="text-lux-text-secondary hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="border-2 border-dashed border-lux-border rounded-2xl p-4 flex flex-col items-center justify-center text-lux-text-secondary gap-2 hover:bg-lux-subtle hover:border-lux-accent/50 cursor-pointer transition-colors" onClick={handleAddMaterial}>
                        <Plus size={24} className="opacity-50" />
                        <span className="text-xs font-bold uppercase">Adicionar Material da Ilha</span>
                    </div>
                </div>

                <div className="p-6 border-t border-lux-border bg-white">
                    <LuxButton className="w-full justify-center" icon={<Save size={18}/>}>Salvar Engenharia</LuxButton>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default ProcedureEngineer;