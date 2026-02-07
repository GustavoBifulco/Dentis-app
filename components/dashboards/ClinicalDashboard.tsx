import React, { useState, useEffect } from 'react';
import { ViewType } from '../../types';
import { ArrowUpRight, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { IslandCard, LuxButton } from '../Shared';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';
const { user } = useUser();
const { t, formatMoney, locale } = useI18n();
// Actually getSalutation is not in hook return type in prior step, I should use the helper directly or add it to hook
// Let's use the helper directly or update hook. 
// Update hook is better but let's import helper for now to avoid breaking changes if hook not updated yet
// Wait, I defined getSalutation in types but didn't return it in hook. 
// Let's import it from format.ts 

import { useI18n } from '../../lib/i18n';
import { getSalutation } from '../../lib/i18n/format';
import { useAuth, useUser } from '@clerk/clerk-react';

const ClinicalDashboard: React.FC = () => {
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
            const res = await fetch('/api/dashboard/stats', {
               headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
               const data = await res.json();
               setStats(data);
            }
         } catch (e) {
            console.error("Dashboard Init Error", e);
         }
      };

      if (user) {
         initDashboard();
      }
   }, [getToken, user]);

   const chartData = [
      { name: 'Jan', val: 80 }, { name: 'Fev', val: 100 }, { name: 'Mar', val: 95 },
      { name: 'Abr', val: 110 }, { name: 'Mai', val: 125 }, { name: 'Jun', val: 148 }
   ];

   return (
      <div className="space-y-10">
         {/* GREETING EDITORIAL */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7 space-y-6">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <h2 className="text-5xl md:text-6xl font-editorial font-medium text-lux-text leading-[1.1]">
                     {t('dashboard.greeting', {
                        title: getSalutation(locale, user?.publicMetadata?.gender as string, null),
                        name: user?.firstName || user?.fullName || ''
                     }).split(',')[0]}, <br />
                     <span className="italic text-lux-accent">
                        {t('dashboard.greeting', {
                           title: getSalutation(locale, user?.publicMetadata?.gender as string, null),
                           name: user?.firstName || user?.fullName || ''
                        }).split(',')[1]}
                     </span>
                  </h2>
               </motion.div>

               <div className="border-l-2 border-lux-accent/30 pl-6 py-1">
                  <p className="text-lg text-lux-text-secondary font-light leading-relaxed max-w-lg">
                     {t('dashboard.daySummary')}
                     <br />
                     <strong className="font-semibold text-lux-text">{stats.appointmentsToday} {t('menu.schedule')}</strong>.
                  </p>
               </div>

               <div className="flex gap-4 pt-2">
                  <LuxButton icon={<Calendar size={18} />}>
                     {t('common.view')} {t('menu.schedule')}
                  </LuxButton>
                  <LuxButton variant="outline">
                     {t('common.search')}
                  </LuxButton>
               </div>
            </div>

            {/* BLACK CARD FINANCEIRO */}
            <div className="lg:col-span-5">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative overflow-hidden rounded-2xl bg-card text-card-foreground p-8 shadow-2xl group cursor-pointer border border-border"
               >
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
                           <span className="text-2xl align-top mr-1"></span>
                           {formatMoney(stats.revenueMonth)}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                           <span className="text-xs text-emerald-400 font-bold uppercase tracking-wide">Atualizado Agora</span>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* WIDGETS DE CONTEÚDO */}
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

export default ClinicalDashboard;