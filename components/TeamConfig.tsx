import React, { useState } from 'react';
import { IslandCard, LuxButton, SectionHeader } from './Shared';
import { UserPlus, Shield, Percent } from 'lucide-react';

const TeamConfig: React.FC = () => {
  const [members, setMembers] = useState([
    { id: 1, name: 'Dr. Ricardo Silva', role: 'Dono', split: 100, color: 'bg-slate-900' },
    { id: 2, name: 'Dra. Ana Paula', role: 'Dentista Parceiro', split: 40, color: 'bg-indigo-600' },
  ]);

  const handleSplitChange = (id: number, newVal: number) => {
      setMembers(members.map(m => m.id === id ? {...m, split: newVal} : m));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <SectionHeader title="Gestão de Equipe & Repasses" subtitle="Defina permissões e regras automáticas de comissão." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {members.map(member => (
            <IslandCard key={member.id} className="p-0 overflow-hidden group">
               <div className="p-6 flex items-center gap-4 border-b border-slate-50">
                  <div className={`w-14 h-14 ${member.color} text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg`}>
                     {member.name.charAt(0)}
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black uppercase text-slate-500">{member.role}</span>
                        {member.role === 'Dono' && <Shield size={12} className="text-emerald-500" />}
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-slate-50/50 space-y-6">
                  <div>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        <span className="flex items-center gap-2"><Percent size={14}/> Comissão Base</span>
                        <span className="text-slate-900">{member.split}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="0" max="100" 
                        value={member.split}
                        onChange={(e) => handleSplitChange(member.id, Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                     />
                     <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                        *Calculado sobre o lucro líquido (após dedução de materiais e impostos).
                     </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                     <button className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
                        Editar Permissões
                     </button>
                     <button className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:border-rose-200 transition shadow-sm">
                        Desativar
                     </button>
                  </div>
               </div>
            </IslandCard>
         ))}

         {/* Add New Member Card */}
         <button className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 transition-all min-h-[300px] group">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <UserPlus size={24} />
            </div>
            <span className="font-bold text-sm">Adicionar Membro</span>
         </button>
      </div>
    </div>
  );
};

export default TeamConfig;