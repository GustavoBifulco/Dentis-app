
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
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-500"><Check size={14}/></div>
                <span>Baixa realizada: Estoque atualizado e Fatura gerada.</span>
            </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-4">
            <h2 className="text-3xl font-editorial italic text-lux-charcoal">Maio 2024</h2>
            <div className="flex gap-1 bg-lux-surface border border-lux-border p-1 rounded-xl">
               <button className="px-4 py-1.5 bg-lux-charcoal text-lux-background rounded-lg text-xs font-bold shadow-sm">Semana</button>
               <button className="px-4 py-1.5 text-lux-platinum hover:text-lux-charcoal text-xs font-bold transition">Dia</button>
            </div>
         </div>
         <div className="flex gap-3">
            <div className="flex bg-lux-surface rounded-xl border border-lux-border">
               <button className="p-3 hover:bg-lux-background border-r border-lux-border rounded-l-xl"><ChevronLeft size={18} className="text-lux-charcoal"/></button>
               <button className="p-3 hover:bg-lux-background rounded-r-xl"><ChevronRight size={18} className="text-lux-charcoal"/></button>
            </div>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-3 bg-lux-surface border border-lux-border rounded-xl text-lux-charcoal hover:bg-lux-subtle transition"
            >
                <Sliders size={18} />
            </button>
            <LuxButton icon={<Plus size={18}/>} onClick={() => setShowAppointmentModal(true)}>Agendar</LuxButton>
         </div>
      </div>

      {/* MAIN SCHEDULE GRID */}
      <IslandCard className="flex-1 overflow-hidden flex flex-col bg-lux-surface relative">
         {/* Days Header */}
         <div className="grid grid-cols-6 border-b border-lux-border z-10 bg-lux-surface relative shadow-sm">
             <div className="p-4 border-r border-lux-border flex items-center justify-center">
                 <Clock size={20} className="text-lux-platinum" />
             </div>
             {weekDays.map((d, i) => (
                 <div key={i} className={`p-4 text-center border-r border-lux-border last:border-0 ${d.active ? 'bg-lux-gold/5' : ''}`}>
                     <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${d.active ? 'text-lux-gold' : 'text-lux-platinum'}`}>{d.day}</p>
                     <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-lg ${d.active ? 'bg-lux-gold text-white shadow-lg shadow-lux-gold/30' : 'text-lux-charcoal'}`}>
                         {d.date}
                     </div>
                 </div>
             ))}
         </div>

         {/* Grid Body */}
         <div className="flex-1 overflow-y-auto relative bg-lux-background/30 custom-scrollbar">
            
            {/* Real-time Line */}
            {timeLineTop > 0 && (
                <div 
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" 
                    style={{ top: `${timeLineTop}px` }}
                >
                    <div className="w-full border-t border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <div className="absolute left-0 bg-blue-500 text-white text-[10px] px-1 rounded-r font-bold">
                        {currentTime.getHours()}:{currentTime.getMinutes().toString().padStart(2,'0')}
                    </div>
                </div>
            )}

            {hours.map((hour, hIndex) => (
                <div key={hour} className="grid grid-cols-6 h-[100px]">
                    <div className="border-r border-b border-lux-border bg-lux-surface p-2 text-center sticky left-0 z-10">
                        <span className="text-xs font-bold text-lux-platinum sticky top-2">{hour}:00</span>
                    </div>
                    {[0, 1, 2, 3, 4].map((dayIndex) => {
                        const isToday = dayIndex === 2;
                        // Example lunch break logic
                        const isLunch = hour === 12;

                        return (
                            <div 
                                key={dayIndex} 
                                onClick={() => !isLunch && setShowAppointmentModal(true)}
                                className={`border-r border-b border-lux-border relative group transition-colors ${isLunch ? 'bg-slate-50 pattern-diagonal-lines cursor-not-allowed' : isToday ? 'bg-lux-surface cursor-pointer' : 'cursor-pointer hover:bg-lux-subtle'}`}
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
                                        className="absolute top-1 left-1 right-1 h-[180px] bg-lux-charcoal text-lux-background rounded-xl p-4 shadow-xl border-l-4 border-lux-gold cursor-pointer hover:scale-[1.02] transition-transform z-10 flex flex-col justify-between group/card"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-lg truncate">Carlos Eduardo</p>
                                                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Particular</span>
                                            </div>
                                            <p className="text-xs text-lux-platinum uppercase tracking-wide mt-1">Prótese Total</p>
                                        </div>
                                        
                                        {/* Action Area */}
                                        <div className="mt-2">
                                            {finishingAppt === 14 ? (
                                                <div className="flex items-center gap-2 text-emerald-400 animate-pulse text-xs font-bold">
                                                    Processando...
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleFinish(14); }}
                                                    className="w-full py-2 bg-lux-gold text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-lux-charcoal transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Iniciar <ChevronRight size={12}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Ghost Hover Effect */}
                                {!isLunch && hour !== 14 && (
                                    <div className="absolute inset-1 rounded-xl border-2 border-dashed border-lux-gold/30 bg-lux-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center justify-center">
                                        <Plus className="text-lux-gold mb-1" />
                                        <span className="text-[10px] font-bold text-lux-gold uppercase tracking-widest">Agendar</span>
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
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    className="bg-lux-surface w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 border-b border-lux-border flex justify-between items-center">
                        <h3 className="text-2xl font-black text-lux-text">Nova Consulta</h3>
                        <button onClick={() => setShowAppointmentModal(false)} className="p-2 hover:bg-lux-subtle rounded-full"><X size={20}/></button>
                    </div>
                    
                    <div className="p-8 space-y-6 overflow-y-auto">
                        {/* Patient Selection */}
                        <div>
                            <label className="text-xs font-bold text-lux-text-secondary uppercase mb-2 block">Paciente</label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <User className="absolute left-4 top-3.5 text-lux-text-secondary" size={20} />
                                    <input type="text" className="w-full pl-12 pr-4 py-3 bg-lux-background border border-lux-border rounded-xl font-medium outline-none focus:border-lux-accent" placeholder="Buscar paciente..." />
                                </div>
                                <button className="p-3 bg-lux-charcoal text-white rounded-xl hover:bg-black transition"><Plus size={20} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-lux-text-secondary uppercase mb-2 block">Data & Hora</label>
                                <input type="datetime-local" className="w-full p-3 bg-lux-background border border-lux-border rounded-xl font-medium outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-lux-text-secondary uppercase mb-2 block">Procedimento</label>
                                <select className="w-full p-3 bg-lux-background border border-lux-border rounded-xl font-medium outline-none appearance-none">
                                    <option>Avaliação</option>
                                    <option>Manutenção</option>
                                    <option>Urgência</option>
                                </select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="text-xs font-bold text-lux-text-secondary uppercase mb-2 block">Etiquetas</label>
                            <div className="flex flex-wrap gap-2">
                                {['Particular', 'Retorno', 'Confirmado', 'Primeira Vez', 'VIP'].map(tag => (
                                    <button key={tag} className="px-3 py-1 bg-lux-subtle border border-lux-border rounded-lg text-xs font-bold text-lux-text-secondary hover:border-lux-accent hover:text-lux-accent transition">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 p-4 bg-lux-subtle rounded-2xl">
                             <button className="flex-1 flex flex-col items-center gap-2 p-2 hover:bg-white rounded-xl transition">
                                <MessageSquare size={20} className="text-lux-accent" />
                                <span className="text-[10px] font-bold uppercase">Enviar Lembrete</span>
                             </button>
                             <button className="flex-1 flex flex-col items-center gap-2 p-2 hover:bg-white rounded-xl transition">
                                <Phone size={20} className="text-lux-accent" />
                                <span className="text-[10px] font-bold uppercase">Ligar</span>
                             </button>
                        </div>
                    </div>

                    <div className="p-6 border-t border-lux-border bg-lux-subtle flex justify-end gap-3">
                        <LuxButton variant="secondary" onClick={() => setShowAppointmentModal(false)}>Cancelar</LuxButton>
                        <LuxButton onClick={() => setShowAppointmentModal(false)}>Confirmar Agendamento</LuxButton>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* SETTINGS SHEET */}
      <AnimatePresence>
        {showSettings && (
            <>
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowSettings(false)} />
                <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-96 bg-lux-surface border-l border-lux-border z-50 p-8 shadow-2xl flex flex-col"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-lux-text">Configuração Agenda</h3>
                        <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-lux-subtle rounded-full"><X size={20} /></button>
                    </div>

                    <div className="space-y-8 flex-1 overflow-y-auto">
                        <div>
                            <label className="text-xs font-bold text-lux-text-secondary uppercase mb-4 block">Intervalo (Minutos)</label>
                            <div className="flex gap-2">
                                {[15, 30, 45, 60].map(min => (
                                    <button 
                                        key={min}
                                        onClick={() => setSlotDuration(min)}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm border ${slotDuration === min ? 'bg-lux-charcoal text-white border-lux-charcoal' : 'bg-white border-lux-border text-lux-text hover:border-lux-text'}`}
                                    >
                                        {min}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-lux-text-secondary uppercase mb-4 block">Regras de Agendamento Online</label>
                            <div className="space-y-2">
                                <button onClick={() => setBookingType('auto')} className={`w-full text-left p-4 rounded-xl border transition ${bookingType === 'auto' ? 'border-lux-accent bg-lux-accent/5' : 'border-lux-border'}`}>
                                    <div className="font-bold text-sm">Automático</div>
                                    <div className="text-xs text-lux-text-secondary">Pacientes agendam livremente.</div>
                                </button>
                                <button onClick={() => setBookingType('approval')} className={`w-full text-left p-4 rounded-xl border transition ${bookingType === 'approval' ? 'border-lux-accent bg-lux-accent/5' : 'border-lux-border'}`}>
                                    <div className="font-bold text-sm">Sob Aprovação</div>
                                    <div className="text-xs text-lux-text-secondary">Você confirma antes de bloquear.</div>
                                </button>
                                <button onClick={() => setBookingType('request')} className={`w-full text-left p-4 rounded-xl border transition ${bookingType === 'request' ? 'border-lux-accent bg-lux-accent/5' : 'border-lux-border'}`}>
                                    <div className="font-bold text-sm">Apenas Pedido</div>
                                    <div className="text-xs text-lux-text-secondary">Pacientes apenas solicitam horários.</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-lux-text-secondary uppercase mb-4 block">Horário de Funcionamento</label>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span>Início</span>
                                        <span>{startHour}:00</span>
                                    </div>
                                    <input 
                                        type="range" min="6" max="12" value={startHour} 
                                        onChange={(e) => setStartHour(Number(e.target.value))}
                                        className="w-full accent-lux-charcoal"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span>Fim</span>
                                        <span>{endHour}:00</span>
                                    </div>
                                    <input 
                                        type="range" min="13" max="23" value={endHour} 
                                        onChange={(e) => setEndHour(Number(e.target.value))}
                                        className="w-full accent-lux-charcoal"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-lux-border">
                        <LuxButton className="w-full justify-center">Salvar Preferências</LuxButton>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Schedule;
