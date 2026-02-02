
import React, { useEffect, useState } from 'react';
import { FinancialEntry, UserRole } from '../types';
import { LoadingState, EmptyState, SectionHeader, LuxButton, IslandCard } from './Shared';
import { ArrowUpRight, ArrowDownLeft, Plus, X, Calendar as CalendarIcon, Tag, Wallet } from 'lucide-react';
import { MOCK_FINANCE } from '../lib/mockData';

interface FinanceProps {
  userRole: UserRole;
}

const Finance: React.FC<FinanceProps> = ({ userRole }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>(MOCK_FINANCE);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showModal, setShowModal] = useState(false);

  // Transaction Form State
  const [newTrans, setNewTrans] = useState<Partial<FinancialEntry>>({
      type: 'expense',
      category: 'personal',
      status: 'pending'
  });

  const handleAddTransaction = () => {
     // Mock saving
     const entry: FinancialEntry = {
        id: Math.random().toString(),
        clinicId: '1',
        type: newTrans.type as 'income' | 'expense',
        amount: Number(newTrans.amount) || 0,
        description: newTrans.description || 'Nova movimentação',
        dueDate: new Date().toLocaleDateString(),
        status: newTrans.status as 'paid' | 'pending' | 'overdue',
        category: newTrans.category
     };
     setEntries([entry, ...entries]);
     setShowModal(false);
  };

  const filtered = entries.filter(e => filter === 'all' || e.type === filter);
  const income = entries.filter(e => e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const expense = entries.filter(e => e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      
      <div className="flex justify-between items-end">
          <SectionHeader 
            title="Gestão Financeira" 
            subtitle={userRole === 'clinic_owner' ? "Fluxo de caixa completo da clínica, salários e custos fixos." : "Seus ganhos, repasses e despesas profissionais."}
          />
          <LuxButton icon={<Plus size={18} />} onClick={() => setShowModal(true)}>Nova Movimentação</LuxButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IslandCard className="p-8 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black text-lux-text-secondary uppercase tracking-widest mb-2">Entradas (Mês)</p>
          <p className="text-3xl font-black text-emerald-600">R$ {income.toFixed(2)}</p>
        </IslandCard>
        <IslandCard className="p-8 border-l-4 border-l-rose-500">
          <p className="text-[10px] font-black text-lux-text-secondary uppercase tracking-widest mb-2">Saídas (Mês)</p>
          <p className="text-3xl font-black text-rose-600">R$ {expense.toFixed(2)}</p>
        </IslandCard>
        <div className="bg-lux-charcoal p-8 rounded-[2rem] shadow-xl text-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saldo Líquido</p>
          <p className="text-3xl font-black">R$ {(income - expense).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-lux-surface rounded-[2.5rem] shadow-sm border border-lux-border overflow-hidden">
        <div className="p-8 border-b border-lux-border flex flex-col md:flex-row justify-between items-center gap-6">
          <h3 className="text-xl font-black text-lux-text">Extrato</h3>
          <div className="flex bg-lux-subtle p-1 rounded-xl">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  filter === t ? 'bg-white text-lux-text shadow-sm' : 'text-lux-text-secondary hover:text-lux-text'
                }`}
              >
                {t === 'all' ? 'Todas' : t === 'income' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState 
            title="Sem lançamentos"
            description="Nenhuma movimentação financeira encontrada para este período."
            actionLabel="Novo Lançamento"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-lux-border">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-lux-subtle/50 transition">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          entry.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {entry.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                            <span className="font-bold text-lux-text block">{entry.description}</span>
                            <span className="text-[10px] uppercase font-bold text-lux-text-secondary tracking-wide">{entry.category || 'Geral'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-lux-text-secondary font-medium">{entry.dueDate}</td>
                    <td className={`px-8 py-6 font-black ${entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        entry.status === 'paid' ? 'bg-lux-subtle text-lux-text-secondary' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {entry.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-lux-surface w-full max-w-lg rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-lux-text">Nova Movimentação</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-lux-subtle rounded-full"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-lux-subtle rounded-xl mb-4">
                        <button 
                            onClick={() => setNewTrans({...newTrans, type: 'income'})}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTrans.type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-lux-text-secondary'}`}
                        >
                            Entrada
                        </button>
                        <button 
                            onClick={() => setNewTrans({...newTrans, type: 'expense'})}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTrans.type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-lux-text-secondary'}`}
                        >
                            Saída
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-lux-text-secondary uppercase mb-1 block">Descrição</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-lux-background border border-lux-border rounded-xl font-medium outline-none focus:border-lux-accent"
                            placeholder="Ex: Aluguel, Prolabore..."
                            onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                             <label className="text-xs font-bold text-lux-text-secondary uppercase mb-1 block">Valor (R$)</label>
                             <input 
                                type="number" 
                                className="w-full p-3 bg-lux-background border border-lux-border rounded-xl font-medium outline-none focus:border-lux-accent"
                                placeholder="0.00"
                                onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})}
                            />
                        </div>
                        <div className="flex-1">
                             <label className="text-xs font-bold text-lux-text-secondary uppercase mb-1 block">Vencimento</label>
                             <input 
                                type="date" 
                                className="w-full p-3 bg-lux-background border border-lux-border rounded-xl font-medium outline-none focus:border-lux-accent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-lux-text-secondary uppercase mb-1 block">Categoria</label>
                        <select 
                            className="w-full p-3 bg-lux-background border border-lux-border rounded-xl font-medium outline-none focus:border-lux-accent appearance-none"
                            onChange={e => setNewTrans({...newTrans, category: e.target.value})}
                        >
                            {userRole === 'clinic_owner' ? (
                                <>
                                    <option value="operational">Operacional (Aluguel, Luz, Água)</option>
                                    <option value="salary">Folha de Pagamento</option>
                                    <option value="materials">Materiais</option>
                                    <option value="maintenance">Manutenção</option>
                                </>
                            ) : (
                                <>
                                    <option value="personal">Pessoal</option>
                                    <option value="work">Trabalho (Materiais, Lab)</option>
                                    <option value="education">Cursos/Educação</option>
                                </>
                            )}
                        </select>
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                        <LuxButton variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</LuxButton>
                        <LuxButton className="flex-1" onClick={handleAddTransaction}>Salvar</LuxButton>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Finance;
