import React, { useEffect, useState, useMemo } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Services } from '../lib/services';
import { Patient } from '../types';
import { LoadingState, EmptyState, SectionHeader, ErrorState, IslandCard, LuxButton } from './Shared';
import { Search, Plus, Filter, ArrowRight, Upload, ArrowUpDown, ArrowUp, ArrowDown, X, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import PatientImport from './PatientImport';
import NewPatientModal from './NewPatientModal';
import PatientInviteButton from './PatientInviteButton';
import { useI18n } from '../lib/i18n';

interface PatientsProps {
  onSelectPatient?: (patient: Patient) => void;
}

type SortField = 'name' | 'createdAt' | 'lastVisit';
type SortOrder = 'asc' | 'desc';

interface Filters {
  status: 'all' | 'active' | 'archived';
  dateRange: 'all' | 'week' | 'month' | 'year';
  hasVisit: 'all' | 'yes' | 'no';
}

const Patients: React.FC<PatientsProps> = ({ onSelectPatient }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { t, formatDate } = useI18n();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    status: 'active',
    dateRange: 'all',
    hasVisit: 'all'
  });

  const loadPatients = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      const data = await Services.patients.getAll(token);

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

  useEffect(() => {
    if (isLoaded && user) {
      loadPatients();
    }
  }, [isLoaded, user?.id]);

  // Enhanced filtering and sorting logic
  const filteredAndSorted = useMemo(() => {
    let result = [...patients];

    // Search filter (name, phone, email)
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p?.name?.toLowerCase().includes(searchLower) ||
        p?.phone?.toLowerCase().includes(searchLower) ||
        p?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(p =>
        filters.status === 'active'
          ? (p?.status === 'active' || !p?.status)
          : p?.status === 'archived'
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      result = result.filter(p => {
        if (!p.createdAt) return false;
        const createdDate = new Date(p.createdAt);
        return createdDate >= cutoffDate;
      });
    }

    // Has visit filter
    if (filters.hasVisit !== 'all') {
      result = result.filter(p =>
        filters.hasVisit === 'yes'
          ? (p?.lastVisit && p.lastVisit !== '-')
          : (!p?.lastVisit || p.lastVisit === '-')
      );
    }

    // Sorting
    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = (a?.name || '').localeCompare(b?.name || '');
          break;
        case 'createdAt':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          compareValue = dateA - dateB;
          break;
        case 'lastVisit':
          const visitA = a?.lastVisit && a.lastVisit !== '-' ? new Date(a.lastVisit).getTime() : 0;
          const visitB = b?.lastVisit && b.lastVisit !== '-' ? new Date(b.lastVisit).getTime() : 0;
          compareValue = visitA - visitB;
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [patients, search, filters, sortBy, sortOrder]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'active') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.hasVisit !== 'all') count++;
    return count;
  }, [filters]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'active',
      dateRange: 'all',
      hasVisit: 'all'
    });
    setSearch('');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortOrder === 'asc' ? <ArrowUp size={14} className="text-blue-600" /> : <ArrowDown size={14} className="text-blue-600" />;
  };

  if (!isLoaded) return <LoadingState message={t('common.loading')} />;
  if (loading) return <LoadingState message={t('common.loading')} />;
  if (error) return <ErrorState message={t('common.error')} onRetry={loadPatients} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader
        title={t('patients.title')}
        subtitle={t('patients.emptyTitle')}
        action={
          <div className="flex gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Upload size={18} />
              {t('patients.importCsv')}
            </button>
            <button
              onClick={() => setShowNewPatient(true)}
              className="px-4 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Plus size={18} />
              {t('patients.newPatient')}
            </button>
          </div>
        }
      />

      <IslandCard className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
        {/* Search and Filters Bar */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/30">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder={t('patients.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative px-4 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm ${showFilters || activeFiltersCount > 0
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <Filter size={18} />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {(activeFiltersCount > 0 || search) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-3 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center gap-2"
                  title="Limpar filtros"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-inner animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value as Filters['status'] })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 font-semibold"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="archived">Arquivados</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cadastrados</label>
                  <select
                    value={filters.dateRange}
                    onChange={e => setFilters({ ...filters, dateRange: e.target.value as Filters['dateRange'] })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 font-semibold"
                  >
                    <option value="all">Todos os períodos</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mês</option>
                    <option value="year">Último ano</option>
                  </select>
                </div>

                {/* Has Visit Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Visitas</label>
                  <select
                    value={filters.hasVisit}
                    onChange={e => setFilters({ ...filters, hasVisit: e.target.value as Filters['hasVisit'] })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 font-semibold"
                  >
                    <option value="all">Todos</option>
                    <option value="yes">Com visitas</option>
                    <option value="no">Sem visitas</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-slate-600 font-semibold">
              {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}
            </p>
          </div>
        </div>

        {/* Table */}
        {filteredAndSorted.length === 0 ? (
          <EmptyState
            title={t('patients.emptyTitle')}
            description={search || activeFiltersCount > 0 ? t('patients.emptyBody') : t('patients.emptyBody')}
            actionLabel={t('patients.newPatient')}
            onAction={() => setShowNewPatient(true)}
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gradient-to-br from-slate-50 to-slate-100/50">
                <tr>
                  <th
                    className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      {t('patients.table.name')}
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('patients.table.status')}</th>
                  <th
                    className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group"
                    onClick={() => handleSort('lastVisit')}
                  >
                    <div className="flex items-center gap-2">
                      {t('patients.table.lastVisit')}
                      <SortIcon field="lastVisit" />
                    </div>
                  </th>
                  <th
                    className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Cadastro
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSorted.map(patient => (
                  <tr
                    key={patient.id}
                    className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                    onClick={() => onSelectPatient && onSelectPatient(patient)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-600/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-600/30 transition-all">
                          {patient?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{patient?.name || 'Sem nome'}</p>
                          <p className="text-xs text-slate-500 font-medium">{patient?.phone || patient?.email || 'Sem contato'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${patient.status === 'active' || !patient.status
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                        {patient.status === 'active' || !patient.status ? (
                          <><CheckCircle2 size={12} /> Ativo</>
                        ) : (
                          <><XCircle size={12} /> Arquivado</>
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-semibold">
                      {patient.lastVisit && patient.lastVisit !== '-' ? (
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {patient.lastVisit}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Sem visitas</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <PatientInviteButton
                          patientId={patient.id}
                          patientName={patient.name}
                          hasAccount={!!patient.userId}
                        />
                        <LuxButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient && onSelectPatient(patient);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 font-black text-[10px] uppercase tracking-widest gap-2 py-2 hover:bg-blue-50"
                          icon={<ArrowRight size={14} strokeWidth={3} />}
                        >
                          Abrir Prontuário
                        </LuxButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </IslandCard>

      <PatientImport
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={loadPatients}
      />

      <NewPatientModal
        isOpen={showNewPatient}
        onClose={() => setShowNewPatient(false)}
        onSuccess={loadPatients}
      />
    </div>
  );
};

export default Patients;
