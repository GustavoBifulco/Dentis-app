import React, { useState, useEffect } from 'react';
import { UserRole, ViewType } from '../types';
import { ArrowUpRight, ArrowRight, Calendar, Activity, Smile, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { IslandCard, LuxButton } from './Shared';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useAuth, useUser } from '@clerk/clerk-react';

interface DashboardProps {
   userRole: UserRole;
   onNavigate: (view: ViewType) => void;
}

import { LabDashboard } from './LabDashboard';

const Dashboard: React.FC<DashboardProps> = ({ userRole, onNavigate }) => {
   if (userRole === 'lab_admin' || userRole === 'lab_tech') {
      return <LabDashboard />;
   }

   const { getToken } = useAuth();
   const { user } = useUser();

   const [stats, setStats] = useState({
      userName: '',
      appointmentsToday: 0,
      revenueMonth: 0,
      nextPatient: null as string | null,
      nextTime: null as string | null,
      needsSetup: false
   });

   useEffect(() => {
      const initDashboard = async () => {
         const token = await getToken();
         if (!token) return;

         try {
            // 1. Initial Sync/Repair
            await fetch('/api/onboarding/sync', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({
                  userId: user?.id,
                  role: userRole,
                  email: user?.primaryEmailAddress?.emailAddress,
                  name: user?.fullName
               })
            });

            // 2. Fetch Stats & Check Data Health
            const res = await fetch('/api/dashboard/stats', {
               headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
               const data = await res.json();
               setStats(data);

               // 3. Auto-Repair if Data Missing
               if (data.needsSetup) {
                  console.log("🛠️ Data missing. Auto-repairing...");
                  await fetch('/api/onboarding/force-seed', {
                     method: 'POST',
                     headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-user-id': user?.id || ''
                     }
                  });
                  // Refresh stats after repair
                  const retryRes = await fetch('/api/dashboard/stats', {
                     headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (retryRes.ok) setStats(await retryRes.json());
               }
            }
         } catch (e) {
            console.error("Dashboard Init Error", e);
         }
      };

      if (user) {
         initDashboard();
      }
   }, [getToken, user, userRole]);

   // --- DASHBOARD DO PACIENTE ---
   if (userRole === 'patient') {
      const nextAppointment = {
         date: '24/05',
         time: '14:00',
         procedure: 'Manutenção Ortodôntica',
         doctor: 'Dr. Ricardo Silva'
      };

      return (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* AI INSIGHTS BAR (High-End) */}
            <motion.div
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-4 shadow-xl shadow-indigo-900/20 text-white flex items-center justify-between"
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                     <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                     <p className="font-bold text-sm">Insight Inteligente</p>
                     <p className="text-xs text-indigo-100 font-medium">Seu próximo alinhamento é em 12 dias. Foco na limpeza superior!</p>
                  </div>
               </div>
               <button className="text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                  Ver Dicas
               </button>
            </motion.div>

            <div className="space-y-2 pt-4">
               <h2 className="text-4xl md:text-5xl font-editorial font-medium text-lux-text leading-[1.1]">
                  Olá, <span className="italic text-lux-accent">{stats.userName || 'Paciente'}.</span>
               </h2>
               <p className="text-lux-text-secondary text-lg">Seu sorriso está 45% mais alinhado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

               {/* Card 1: Próxima Consulta (Status Real) */}
               <div
                  onClick={() => onNavigate(ViewType.SCHEDULE)}
                  className="apple-card p-6 bg-lux-text text-lux-background hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lux-accent rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-6">
                        <span className="bg-lux-accent text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                           Confirmado
                        </span>
                        <Calendar size={20} className="text-lux-background/50" />
                     </div>
                     <p className="text-4xl font-light mb-1">{nextAppointment.time}</p>
                     <p className="text-lg font-bold text-lux-accent mb-4">{nextAppointment.date}</p>
                     <div>
                        <p className="font-bold">{nextAppointment.procedure}</p>
                        <p className="text-sm opacity-60">{nextAppointment.doctor}</p>
                     </div>
                  </div>
               </div>

               {/* Card 2: Status Financeiro (Vinculado ao Tratamento) */}
               <div className="apple-card p-6 flex flex-col justify-between hover:border-lux-accent/50 transition-colors">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-bold text-lux-text text-lg">Meu Plano</h3>
                        <p className="text-xs text-lux-text-secondary uppercase tracking-wider">Invisalign Full</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={20} />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <span className="text-3xl font-light text-lux-text">R$ 1.200</span>
                        <span className="text-xs font-bold text-lux-text-secondary mb-1">Restante</span>
                     </div>
                     <div className="w-full bg-lux-subtle h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[70%] rounded-full"></div>
                     </div>
                     <p className="text-xs text-emerald-600 font-bold">Pagamento em dia</p>
                  </div>
               </div>

               {/* Card 3: Acesso Rápido (Jornada) */}
               <div
                  onClick={() => onNavigate(ViewType.TREATMENT_JOURNEY)}
                  className="apple-card p-6 flex flex-col justify-center items-center text-center gap-4 hover:bg-lux-subtle transition-colors cursor-pointer border-dashed"
               >
                  <div className="w-16 h-16 rounded-full bg-lux-accent/10 flex items-center justify-center text-lux-accent">
                     <Smile size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                     <h3 className="font-bold text-lux-text">Jornada do Sorriso</h3>
                     <p className="text-sm text-lux-text-secondary max-w-[200px] mx-auto">
                        Acompanhe a evolução do seu tratamento etapa por etapa.
                     </p>
                  </div>
                  <span className="text-xs font-bold text-lux-accent uppercase tracking-widest flex items-center gap-1">
                     Ver Progresso <ArrowRight size={12} />
                  </span>
               </div>

            </div>
         </div>
      );
   }

   // --- DASHBOARD DO DENTISTA/CLÍNICA (Real Data) ---

   const chartData = [
      { name: 'Jan', val: 80 }, { name: 'Fev', val: 100 }, { name: 'Mar', val: 95 },
      { name: 'Abr', val: 110 }, { name: 'Mai', val: 125 }, { name: 'Jun', val: 148 }
   ];

   return (
      <div className="space-y-10">

         {/* 1. GREETING EDITORIAL */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7 space-y-6">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <h2 className="text-5xl md:text-6xl font-editorial font-medium text-lux-text leading-[1.1]">
                     Bom dia, <br />
                     <span className="italic text-lux-accent">{stats.userName ? `Dr. ${stats.userName}` : 'Doutor'}.</span>
                  </h2>
               </motion.div>

               <div className="border-l-2 border-lux-accent/30 pl-6 py-1">
                  <p className="text-lg text-lux-text-secondary font-light leading-relaxed max-w-lg">
                     Você tem <strong className="font-semibold text-lux-text">{stats.appointmentsToday} consultas</strong> hoje.
                     {stats.nextPatient ? (
                        <> O próximo paciente é <span className="underline decoration-lux-accent decoration-2 underline-offset-4">{stats.nextPatient}</span> às {stats.nextTime}.</>
                     ) : (
                        <> Não há mais pacientes agendados para hoje.</>
                     )}
                  </p>
               </div>

               <div className="flex gap-4 pt-2">
                  <LuxButton onClick={() => onNavigate(ViewType.SCHEDULE)} icon={<Calendar size={18} />}>
                     Ver Agenda
                  </LuxButton>
                  <LuxButton variant="outline" onClick={() => onNavigate(ViewType.PATIENTS)}>
                     Buscar Paciente
                  </LuxButton>
               </div>
            </div>

            {/* 2. BLACK CARD FINANCEIRO */}
            <div className="lg:col-span-5">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative overflow-hidden rounded-2xl bg-[#0F172A] text-white p-8 shadow-2xl group cursor-pointer border border-white/5"
                  onClick={() => onNavigate(ViewType.FINANCE)}
               >
                  {/* Noise/Texture & Gold Glow */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-lux-accent rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>

                  <div className="relative z-10 flex flex-col justify-between h-48">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-bold text-lux-accent uppercase tracking-[0.25em] mb-1">Faturamento Mês</p>
                           <p className="font-editorial italic text-2xl text-white/90">Atual</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
                           <ArrowUpRight size={20} className="text-lux-accent" />
                        </div>
                     </div>

                     <div>
                        <h3 className="text-4xl font-light tracking-tight mb-2">
                           <span className="text-lux-accent text-2xl align-top mr-1">R$</span>
                           {stats.revenueMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                           <span className="text-xs text-emerald-400 font-bold uppercase tracking-wide">Atualizado Agora</span>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* 3. WIDGETS DE CONTEÚDO */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Agenda Rápida */}
            <IslandCard className="p-8 h-80 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-editorial text-xl text-lux-text">Hoje</h3>
                  <span className="text-xs font-bold text-lux-text-secondary uppercase">{stats.appointmentsToday} Agendados</span>
               </div>
               <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                  {stats.appointmentsToday === 0 ? (
                     <div className="text-center text-gray-400 py-10">Sem consultas hoje.</div>
                  ) : (
                     // Placeholder se não retornamos a lista completa no endpoint ainda, ou usar dados se expandirmos API
                     // Por enquanto, mostramos apenas o próximo no header, aqui poderia ser "Em Breve" ou mock se não tivermos a lista.
                     // Para MVP Real: Exibir mensagem simples
                     <div className="text-sm text-lux-text-secondary">Consultas listadas na Agenda Completa.</div>
                  )}
               </div>
            </IslandCard>

            {/* Gráfico Minimalista */}
            <IslandCard className="p-8 md:col-span-2 h-80 flex flex-col">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-editorial text-xl text-lux-text">Performance Semestral</h3>
                  <div className="flex gap-2">
                     <span className="w-3 h-3 rounded-full bg-lux-accent"></span>
                     <span className="text-[10px] uppercase font-bold text-lux-text-secondary">Receita</span>
                  </div>
               </div>
               <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                        <Tooltip
                           cursor={{ fill: 'var(--color-background)', opacity: 0.5 }}
                           contentStyle={{
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '12px',
                              fontFamily: '-apple-system',
                              fontSize: '12px',
                              padding: '12px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                           }}
                        />
                        <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={40}>
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--color-accent)' : 'var(--color-border)'} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </IslandCard>
         </div>
      </div>
   );
};

export default Dashboard;