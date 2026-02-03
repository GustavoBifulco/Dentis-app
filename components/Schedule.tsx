
import React, { useEffect, useState } from 'react';
import { LoadingState, IslandCard, LuxButton } from './Shared';
import { ChevronLeft, ChevronRight, Clock, Plus, Check, Settings2, X, Sliders, User, MessageSquare, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Schedule: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [finishingAppt, setFinishingAppt] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    // Settings State
    const [slotDuration, setSlotDuration] = useState(60);
    const [startHour, setStartHour] = useState(8);
    const [endHour, setEndHour] = useState(19);
    const [bookingType, setBookingType] = useState<'auto' | 'approval' | 'request'>('approval');

    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
    const weekDays = [
        { day: 'Seg', date: '20' }, { day: 'Ter', date: '21' }, { day: 'Qua', date: '22', active: true },
        { day: 'Qui', date: '23' }, { day: 'Sex', date: '24' }
    ];

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleFinish = (id: number) => {
        setFinishingAppt(id);
        setTimeout(() => {
            setFinishingAppt(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1500);
    };

    const getCurrentTimeTop = () => {
        const currentH = currentTime.getHours();
        const currentM = currentTime.getMinutes();
        if (currentH < startHour || currentH > endHour) return -1;
        const hoursPast = currentH - startHour;
        const totalMinutes = (hoursPast * 60) + currentM;
        return (totalMinutes / 60) * 100; // Assumes 100px per hour
    };

    const timeLineTop = getCurrentTimeTop();

    if (loading) return <LoadingState message="Sincronizando agenda..." />;

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col relative overflow-hidden">

            {/* SUCCESS TOAST */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold"
                    >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-500"><Check size={14} /></div>
                        <span>Baixa realizada: Estoque atualizado e Fatura gerada.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Maio 2024</h2>
                    <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all">Semana</button>
                        <button className="px-5 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Dia</button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <button className="p-3.5 hover:bg-slate-50 border-r border-slate-100 transition-colors"><ChevronLeft size={20} className="text-slate-600" /></button>
                        <button className="p-3.5 hover:bg-slate-50 transition-colors"><ChevronRight size={20} className="text-slate-600" /></button>
                    </div>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <Sliders size={20} />
                    </button>
                    <LuxButton icon={<Plus size={18} strokeWidth={3} />} onClick={() => setShowAppointmentModal(true)} className="rounded-2xl shadow-xl shadow-blue-600/20 px-8">Agendar</LuxButton>
                </div>
            </div>

            {/* MAIN SCHEDULE GRID */}
            <IslandCard className="flex-1 overflow-hidden flex flex-col bg-white relative border-none shadow-2xl shadow-slate-200/50 rounded-3xl">
                {/* Days Header */}
                <div className="grid grid-cols-6 border-b border-slate-100 z-10 bg-white/80 backdrop-blur-md relative">
                    <div className="p-6 border-r border-slate-100 flex items-center justify-center">
                        <Clock size={20} className="text-slate-400" />
                    </div>
                    {weekDays.map((d, i) => (
                        <div key={i} className={`p-6 text-center border-r border-slate-100 last:border-0 ${d.active ? 'bg-blue-50/30' : ''}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${d.active ? 'text-blue-600' : 'text-slate-400'}`}>{d.day}</p>
                            <div className={`w-11 h-11 mx-auto rounded-2xl flex items-center justify-center font-black text-lg transition-all ${d.active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-4 ring-blue-50' : 'text-slate-900 hover:bg-slate-100'}`}>
                                {d.date}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="flex-1 overflow-y-auto relative bg-slate-50/50 custom-scrollbar">

                    {/* Real-time Line */}
                    {timeLineTop > 0 && (
                        <div
                            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                            style={{ top: `${timeLineTop}px` }}
                        >
                            <div className="w-full border-t-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] opacity-50"></div>
                            <div className="absolute left-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-r-full font-black uppercase tracking-widest shadow-lg">
                                {currentTime.getHours()}:{currentTime.getMinutes().toString().padStart(2, '0')}
                            </div>
                        </div>
                    )}

                    {hours.map((hour, hIndex) => (
                        <div key={hour} className="grid grid-cols-6 h-[100px]">
                            <div className="border-r border-b border-slate-100 bg-white p-4 text-center sticky left-0 z-10 flex flex-col justify-center">
                                <span className="text-xs font-black text-slate-400 tracking-tighter">{hour}:00</span>
                            </div>
                            {[0, 1, 2, 3, 4].map((dayIndex) => {
                                const isToday = dayIndex === 2;
                                // Example lunch break logic
                                const isLunch = hour === 12;

                                return (
                                    <div
                                        key={dayIndex}
                                        onClick={() => !isLunch && setShowAppointmentModal(true)}
                                        className={`border-r border-b border-slate-100 relative group transition-all duration-300 ${isLunch ? 'bg-slate-100/50 pattern-diagonal-lines cursor-not-allowed' : isToday ? 'bg-white cursor-pointer hover:bg-blue-50/30' : 'bg-white cursor-pointer hover:bg-slate-50'}`}
                                    >
                                        {isLunch && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="text-[10px] font-bold uppercase bg-white px-2 py-1 rounded shadow-sm">Almoço</span>
                                            </div>
                                        )}

                                        {/* Example Appointment */}
                                        {isToday && hour === 14 && (
                                            <div
                                                onClick={(e) => { e.stopPropagation(); setShowAppointmentModal(true); }}
                                                className="absolute top-1.5 left-1.5 right-1.5 h-[180px] bg-slate-900 text-white rounded-2xl p-5 shadow-2xl shadow-slate-950/20 border-l-[6px] border-blue-500 cursor-pointer hover:scale-[1.03] active:scale-100 transition-all z-10 flex flex-col justify-between group/card overflow-hidden"
                                            >
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-black text-lg leading-tight tracking-tight">Carlos Eduardo</p>
                                                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em]">Particular</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Prótese Total <span className="mx-1 opacity-30">•</span> 60min</p>
                                                </div>

                                                {/* Action Area */}
                                                <div className="mt-4 relative z-10">
                                                    {finishingAppt === 14 ? (
                                                        <div className="flex items-center gap-3 text-emerald-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
                                                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                                            Finalizando...
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleFinish(14); }}
                                                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                                        >
                                                            Iniciar <ChevronRight size={14} strokeWidth={3} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Decorative bg element */}
                                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                                            </div>
                                        )}

                                        {/* Ghost Hover Effect */}
                                        {!isLunch && hour !== 14 && (
                                            <div className="absolute inset-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex flex-col items-center justify-center transform scale-95 group-hover:scale-100">
                                                <Plus className="text-blue-600 mb-1" size={24} strokeWidth={2.5} />
                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Novo Horário</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </IslandCard>

            {/* APPOINTMENT MODAL */}
            <AnimatePresence>
                {showAppointmentModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
                        >
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Novo Agendamento</h3>
                                    <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">Preencha os detalhes da consulta</p>
                                </div>
                                <button onClick={() => setShowAppointmentModal(false)} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"><X size={24} /></button>
                            </div>

                            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                                {/* Patient Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Paciente</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative group">
                                            <User className="absolute left-5 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input type="text" className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" placeholder="Nome do paciente..." />
                                        </div>
                                        <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"><Plus size={24} strokeWidth={3} /></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Data & Hora</label>
                                        <input type="datetime-local" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Procedimento</label>
                                        <div className="relative">
                                            <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none appearance-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer">
                                                <option>Avaliação Geral</option>
                                                <option>Manutenção Preventiva</option>
                                                <option>Urgência / Dor</option>
                                                <option>Cirurgia</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <ChevronRight size={18} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tipo de Atendimento</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {['Particular', 'Retorno', 'Primeira Vez', 'VIP', 'Convênio'].map(tag => (
                                            <button key={tag} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95">
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions Panel */}
                                <div className="grid grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                                    <button className="flex items-center gap-3 p-4 bg-white border border-blue-100/50 rounded-2xl hover:shadow-md transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <MessageSquare size={20} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">SMS Lembrete</span>
                                    </button>
                                    <button className="flex items-center gap-3 p-4 bg-white border border-blue-100/50 rounded-2xl hover:shadow-md transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <Phone size={20} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
                                <LuxButton variant="outline" className="flex-1 rounded-2xl border-slate-200 text-slate-500 py-4 h-auto text-base" onClick={() => setShowAppointmentModal(false)}>Descartar</LuxButton>
                                <LuxButton className="flex-[2] rounded-2xl shadow-xl shadow-blue-600/20 py-4 h-auto text-base" onClick={() => setShowAppointmentModal(false)}>Confirmar Agendamento</LuxButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SETTINGS SHEET */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setShowSettings(false)} />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[420px] bg-white border-l border-slate-200 z-50 p-10 shadow-3xl flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Agenda</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Preferências do sistema</p>
                                </div>
                                <button onClick={() => setShowSettings(false)} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all border border-transparent hover:border-slate-100 active:scale-90"><X size={24} /></button>
                            </div>

                            <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="space-y-5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Slot de Tempo (Minutos)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[15, 30, 45, 60].map(min => (
                                            <button
                                                key={min}
                                                onClick={() => setSlotDuration(min)}
                                                className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all active:scale-95 ${slotDuration === min ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {min}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Regras de Agendamento</label>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'auto', title: 'Automático', desc: 'Sincronização direta sem intervenção.' },
                                            { id: 'approval', title: 'Sob Aprovação', desc: 'Exige confirmação manual da clínica.' },
                                            { id: 'request', title: 'Apenas Pedidos', desc: 'Pacientes sugerem, você define.' }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setBookingType(type.id as any)}
                                                className={`w-full text-left p-5 rounded-3xl border-2 transition-all active:scale-[0.98] ${bookingType === type.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 bg-slate-50/30 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-slate-200'}`}
                                            >
                                                <div className={`font-black text-xs uppercase tracking-widest ${bookingType === type.id ? 'text-blue-600' : 'text-slate-900'}`}>{type.title}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-1">{type.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Horário de Pico</label>
                                    <div className="space-y-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span>Check-in Diário</span>
                                                <span className="text-blue-600 text-lg">{startHour}:00</span>
                                            </div>
                                            <input
                                                type="range" min="6" max="12" value={startHour}
                                                onChange={(e) => setStartHour(Number(e.target.value))}
                                                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span>Check-out Diário</span>
                                                <span className="text-blue-600 text-lg">{endHour}:00</span>
                                            </div>
                                            <input
                                                type="range" min="13" max="23" value={endHour}
                                                onChange={(e) => setEndHour(Number(e.target.value))}
                                                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <LuxButton className="w-full justify-center py-5 rounded-2xl text-base shadow-xl shadow-blue-600/20">Salvar Alterações</LuxButton>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Schedule;
