import React, { useState, useEffect, useRef } from 'react';
import { ViewType } from '../../types';
import { ArrowUpRight, ArrowRight, Calendar, CheckCircle2, User, Clock, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { IslandCard, LuxButton } from '../Shared';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useI18n } from '../../lib/i18n';
import { getSalutation } from '../../lib/i18n/format';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Canvas, useFrame } from "@react-three/fiber";
import {
   Float,
   MeshDistortMaterial,
   PerspectiveCamera,
   Environment,
   ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

// --- CORE 3D COMPONENT: IA CORE ---
const IACore = () => {
   const meshRef = useRef<any>(null);
   const [hovered, setHovered] = useState(false);

   useFrame((state) => {
      if (!meshRef.current) return;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;

      const targetDistort = hovered ? 0.6 : 0.4;
      const targetSpeed = hovered ? 4 : 2;

      meshRef.current.distort = THREE.MathUtils.lerp(meshRef.current.distort, targetDistort, 0.1);
      meshRef.current.speed = THREE.MathUtils.lerp(meshRef.current.speed, targetSpeed, 0.1);
   });

   return (
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
         <mesh
            ref={meshRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            scale={1.5}
         >
            <sphereGeometry args={[1, 64, 64]} />
            <MeshDistortMaterial
               color="#06b6d4"
               metalness={0.9}
               roughness={0.1}
               distort={0.4}
               speed={2}
            />
         </mesh>
      </Float>
   );
};

const ClinicalDashboard: React.FC = () => {
   const { getToken } = useAuth();
   const { user } = useUser();
   const { t, formatMoney, locale } = useI18n();

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
      <div className="space-y-10 pb-20">
         {/* GREETING EDITORIAL & AI HERO */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <h2 className="text-5xl md:text-7xl font-editorial font-medium text-slate-900 leading-[1.1]">
                     {t('dashboard.greeting', {
                        title: getSalutation(locale, user?.publicMetadata?.gender as string, null),
                        name: user?.firstName || user?.fullName || ''
                     }).split(',')[0]}, <br />
                     <span className="italic text-cyan-500">
                        {t('dashboard.greeting', {
                           title: getSalutation(locale, user?.publicMetadata?.gender as string, null),
                           name: user?.firstName || user?.fullName || ''
                        }).split(',')[1]}
                     </span>
                  </h2>
               </motion.div>

               <div className="border-l-4 border-cyan-500/20 pl-6 py-2">
                  <p className="text-xl text-slate-500 font-light leading-relaxed max-w-lg">
                     {t('dashboard.daySummary')}
                     <br />
                     <strong className="font-bold text-slate-900">{stats.appointmentsToday} {t('menu.schedule')}</strong> para hoje.
                  </p>
               </div>

               <div className="flex flex-wrap gap-4 pt-4">
                  <LuxButton icon={<Calendar size={18} />}>
                     Abrir Agenda
                  </LuxButton>
                  <LuxButton variant="outline" icon={<User size={18} />}>
                     Novo Paciente
                  </LuxButton>
               </div>
            </div>

            {/* AI IMMERSIVE 3D SECTION */}
            <div className="lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-[450px] rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl group border-4 border-white">
               <div className="absolute inset-0 z-0">
                  <Canvas shadows dpr={[1, 2]}>
                     <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
                     <ambientLight intensity={0.5} />
                     <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={150} color="#06b6d4" />
                     <Environment preset="city" />
                     <IACore />
                     <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                  </Canvas>
               </div>

               <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                  <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-2xl border border-white/20 w-fit">
                     <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
                     <span className="text-white text-xs font-black uppercase tracking-[0.2em]">IA Dentis Ativa</span>
                  </div>
               </div>
            </div>
         </div>

         {/* CONTENT GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Próximo Paciente */}
            <IslandCard className="p-8 flex flex-col justify-between group h-full">
               <div className="flex justify-between items-start mb-6">
                  <div className="bg-slate-100 p-3 rounded-2xl text-slate-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                     <Clock size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Próximo Horário</span>
               </div>

               <div>
                  <p className="text-sm font-bold text-cyan-600 mb-1">14:30 · Consultório 01</p>
                  <h3 className="text-2xl font-black text-slate-900">Ana Beatriz Silva</h3>
                  <p className="text-slate-500 text-sm mt-1">Limpeza e Profilaxia</p>
               </div>

               <button className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 group-hover:gap-4 transition-all w-fit">
                  Ver Prontuário <ArrowRight size={14} />
               </button>
            </IslandCard>

            {/* Faturamento Rápido */}
            <IslandCard className="p-8 flex flex-col justify-between h-full bg-slate-100 text-slate-900 overflow-hidden relative border-2 border-slate-900/5">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Faturamento Mês</h3>
                     <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full font-bold">+12% vs set</span>
                  </div>

                  <div>
                     <span className="text-slate-500 text-sm">Total Acumulado</span>
                     <h2 className="text-4xl font-black mt-1 text-slate-900">R$ 48.290,00</h2>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                     <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                     </div>
                     <span className="text-xs text-slate-400 font-bold">12 Pagamentos Pendentes</span>
                  </div>
               </div>
            </IslandCard>

            {/* Tarefas e Lembretes */}
            <IslandCard className="p-8 flex flex-col h-full ring-2 ring-cyan-500/5">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                     <CheckSquare size={16} className="text-cyan-500" /> Tasks
                  </h3>
                  <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Ver Tudo</button>
               </div>

               <div className="space-y-4">
                  {[
                     { t: 'Pedir Resina A1 (Estoque)', p: 'Alta' },
                     { t: 'Enviar Guia para Lab Dental', p: 'Média' },
                     { t: 'Confirmar Agenda Segunda', p: 'Alta' }
                  ].map((task, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200" />
                        <div className="flex-1">
                           <p className="text-sm font-bold text-slate-800">{task.t}</p>
                           <span className={`text-[9px] font-black uppercase ${task.p === 'Alta' ? 'text-rose-500' : 'text-amber-500'}`}>{task.p}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </IslandCard>
         </div>

         {/* GRAPH SECTION */}
         <IslandCard className="p-10 flex flex-col h-96">
            <div className="flex justify-between items-end mb-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Performance da Clínica</h3>
                  <p className="text-slate-500 text-sm">Evolução de atendimentos e produtividade semestral</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                     <span className="text-xs font-bold text-slate-600">Este Semestre</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-slate-200 rounded-full" />
                     <span className="text-xs font-bold text-slate-400">Anterior</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 min-h-0 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <Tooltip
                        cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
                        contentStyle={{
                           borderRadius: '16px',
                           border: 'none',
                           boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                           fontFamily: 'inherit',
                           fontWeight: 'bold'
                        }}
                     />
                     <Bar dataKey="val" radius={[12, 12, 4, 4]} barSize={48}>
                        {chartData.map((entry, index) => (
                           <Cell
                              key={`cell-${index}`}
                              fill={index === chartData.length - 1 ? '#06b6d4' : '#e2e8f0'}
                              className="transition-all hover:opacity-80"
                           />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </IslandCard>
      </div>
   );
};

export default ClinicalDashboard;