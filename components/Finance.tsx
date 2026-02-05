
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { FinancialEntry, UserRole } from '../types';
import { LoadingState, EmptyState, SectionHeader, LuxButton, IslandCard } from './Shared';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  X,
  Wallet,
  Tag,
  Calendar as CalendarIcon
} from 'lucide-react';
import { MOCK_FINANCE } from '../lib/mockData';

interface FinanceProps {
  userRole: UserRole;
}

const Finance: React.FC<FinanceProps> = ({ userRole }) => {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>(MOCK_FINANCE);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [billingCharges, setBillingCharges] = useState<any[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Transaction Form State
  const [newTrans, setNewTrans] = useState<Partial<FinancialEntry>>({
    type: 'expense',
    category: 'personal',
    status: 'pending'
  });

  const fetchBilling = async () => {
    setLoadingBilling(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/billing/charges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) throw new Error('Unauthorized');

      const data = await res.json();
      setBillingCharges(data || []);
    } catch (e) {
      console.error("Failed to load billing charges", e);
    } finally {
      setLoadingBilling(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleAddTransaction = () => {
    // Mock saving
    const entry: FinancialEntry = {
      id: Date.now(),
      organizationId: '1',
      type: newTrans.type as 'income' | 'expense',
      amount: Number(newTrans.amount) || 0,
      description: newTrans.description || 'Nova movimentação',
      dueDate: new Date(),
      status: newTrans.status as 'paid' | 'pending' | 'overdue' | 'INVOICED',
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
          subtitle={userRole === UserRole.CLINIC_OWNER ? "Fluxo de caixa completo da empresa, salários e custos fixos." : "Seus ganhos, repasses e despesas profissionais."}
        />
        <LuxButton icon={<Plus size={18} />} onClick={() => setShowModal(true)}>Nova Movimentação</LuxButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IslandCard className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ArrowDownLeft size={20} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entradas (Mês)</p>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </IslandCard>

        <IslandCard className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <ArrowUpRight size={20} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saídas (Mês)</p>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </IslandCard>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md">
                <Wallet size={20} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saldo Disponível</p>
            </div>
            <p className="text-4xl font-black tracking-tight">R$ {(income - expense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all"></div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Extrato Detalhado</h3>
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all h-full flex items-center ${filter === t
                  ? 'bg-white text-blue-600 shadow-xl shadow-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                  }`}
              >
                {t === 'all' ? 'Ver Tudo' : t === 'income' ? 'Ganhos' : 'Gastos'}
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
              <tbody className="divide-y divide-slate-50">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${entry.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-100'
                          : 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-100'
                          }`}>
                          {entry.type === 'income' ? <ArrowDownLeft size={22} strokeWidth={2.5} /> : <ArrowUpRight size={22} strokeWidth={2.5} />}
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block tracking-tight text-base group-hover:text-blue-600 transition-colors">{entry.description}</span>
                          <span className="inline-flex mt-1 px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black uppercase text-slate-400 tracking-widest">{entry.category || 'Geral'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm text-slate-400 font-bold uppercase tracking-widest">{String(entry.dueDate)}</td>
                    <td className={`px-10 py-6 text-lg font-black tracking-tight ${entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${entry.status === 'paid'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                        }`}>
                        {entry.status === 'paid' ? 'Efetivado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stripe Marketplace billing will be implemented here */}


      {/* ADD TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Novo Lançamento</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Gestão de fluxo de caixa</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all border border-transparent hover:border-slate-100"><X size={24} strokeWidth={3} /></button>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100 mb-6">
                <button
                  onClick={() => setNewTrans({ ...newTrans, type: 'income' })}
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'income'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Receita (+)
                </button>
                <button
                  onClick={() => setNewTrans({ ...newTrans, type: 'expense' })}
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTrans.type === 'expense'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                    : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Despesa (-)
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                <div className="relative group">
                  <input
                    type="text"
                    className="w-full pl-5 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black tracking-tight outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                    placeholder="Ex: Aluguel da clínica..."
                    onChange={e => setNewTrans({ ...newTrans, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black tracking-tight outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="0.00"
                    onChange={e => setNewTrans({ ...newTrans, amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Efetiva</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria de Lançamento</label>
                <div className="relative">
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black tracking-tight outline-none focus:border-blue-500 focus:bg-white appearance-none cursor-pointer transition-all"
                    onChange={e => setNewTrans({ ...newTrans, category: e.target.value })}
                  >
                    {userRole === 'clinic_owner' ? (
                      <>
                        <option value="operational">Operacional (Aluguel, Luz, Água)</option>
                        <option value="salary">Folha de Pagamento / Prolabore</option>
                        <option value="materials">Insumos e Materiais</option>
                        <option value="maintenance">Manutenções e Reparos</option>
                      </>
                    ) : (
                      <>
                        <option value="personal">Retirada Pessoal</option>
                        <option value="work">Materiais e Parcerias</option>
                        <option value="education">Especializações e Cursos</option>
                      </>
                    )}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ArrowDownLeft size={18} className="rotate-[-135deg]" />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <LuxButton variant="outline" className="flex-1 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] h-14" onClick={() => setShowModal(false)}>Cancelar</LuxButton>
                <LuxButton className="flex-[2] rounded-2xl shadow-xl shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] h-14" onClick={handleAddTransaction}>Efetivar Lançamento</LuxButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
