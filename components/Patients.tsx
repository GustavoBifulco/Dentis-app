import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react'; // Import necessário
import { Services } from '../lib/services';
import { Patient } from '../types';
import { LoadingState, EmptyState, SectionHeader, ErrorState, IslandCard, LuxButton } from './Shared';
import { Search, Plus, Filter, ArrowRight } from 'lucide-react';

interface PatientsProps {
  onSelectPatient?: (patient: Patient) => void;
}

const Patients: React.FC<PatientsProps> = ({ onSelectPatient }) => {
  const { user, isLoaded } = useUser(); // Hook do Clerk
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadPatients = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      // Chama a função correta 'getAll' passando o ID
      const data = await Services.patients.getAll(user.id);

      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        setError('Erro ao carregar pacientes: Formato inválido');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Só carrega quando o usuário estiver logado
  useEffect(() => {
    if (isLoaded && user) {
      loadPatients();
    }
  }, [isLoaded, user?.id]);

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (!isLoaded || loading) return <LoadingState message="Buscando prontuários..." />;
  if (error) return <ErrorState message={error} onRetry={loadPatients} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader
        title="Pacientes"
        subtitle="Gestão completa de prontuários e históricos."
        action={
          <LuxButton icon={<Plus size={18} />}>Novo Paciente</LuxButton>
        }
      />

      <IslandCard className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
          <LuxButton variant="outline" icon={<Filter size={18} />} className="rounded-2xl">Filtros Avançados</LuxButton>
        </div>

        {patients.length === 0 ? (
          <EmptyState
            title="Nenhum paciente encontrado"
            description="Sua base de dados está vazia."
            actionLabel="Cadastrar"
            onAction={() => { }}
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Última Visita</th>
                  <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(patient => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                    onClick={() => onSelectPatient && onSelectPatient(patient)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shadow-sm group-hover:scale-105 transition-transform">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{patient.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${patient.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-semibold italic">
                      {patient.lastVisit || '-'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-2">
                          Prontuário Completo <ArrowRight size={14} strokeWidth={3} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </IslandCard>
    </div>
  );
};

export default Patients;
