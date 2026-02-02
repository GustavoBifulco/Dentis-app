import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react'; // Import necessário
import { Services } from '../lib/services';
import { Patient } from '../types';
import { LoadingState, EmptyState, SectionHeader, ErrorState, IslandCard, LuxButton } from './Shared';
import { Search, Plus, Filter, Eye } from 'lucide-react';

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
      const res = await Services.patients.getAll(user.id);
      
      if (res.ok) {
        setPatients(res.data || []);
      } else {
        setError(res.error || 'Erro ao carregar pacientes');
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

      <IslandCard className="overflow-hidden">
        <div className="p-6 border-b border-lux-border flex flex-col md:flex-row gap-4 justify-between items-center bg-lux-surface">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-3.5 text-lux-text-secondary group-focus-within:text-lux-accent transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-lux-background border border-lux-border rounded-xl focus:border-lux-accent outline-none transition text-lux-text placeholder:text-lux-text-secondary"
            />
          </div>
          <LuxButton variant="outline" icon={<Filter size={16} />}>Filtros</LuxButton>
        </div>

        {patients.length === 0 ? (
          <EmptyState 
            title="Nenhum paciente encontrado" 
            description="Sua base de dados está vazia."
            actionLabel="Cadastrar"
            onAction={() => {}}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-lux-subtle">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-lux-text-secondary uppercase tracking-widest">Paciente</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-lux-text-secondary uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-lux-text-secondary uppercase tracking-widest">Última Visita</th>
                  <th className="px-8 py-5 text-right text-[10px] font-bold text-lux-text-secondary uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lux-border">
                {filtered.map(patient => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-lux-subtle/50 transition group cursor-pointer"
                    onClick={() => onSelectPatient && onSelectPatient(patient)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-lux-subtle flex items-center justify-center font-bold text-lux-text border border-lux-border">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-lux-text">{patient.name}</p>
                          <p className="text-xs text-lux-text-secondary">{patient.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        patient.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-lux-subtle text-lux-text-secondary'
                      }`}>
                        {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-lux-text-secondary font-medium">
                      {patient.lastVisit || '-'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                         <span className="text-lux-accent font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                           Ver Ficha <Eye size={14} />
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
