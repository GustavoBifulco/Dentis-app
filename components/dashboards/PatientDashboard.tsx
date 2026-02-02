import React from 'react';
import { ViewType } from '../../types';
import { Calendar, Smile, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientDashboard: React.FC = () => {
    const nextAppointment = {
        date: '24/05',
        time: '14:00',
        procedure: 'Manutenção Ortodôntica',
        doctor: 'Dr. Ricardo Silva'
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* AI INSIGHTS BAR */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-4 shadow-xl shadow-indigo-900/20 text-white flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Smile size={16} className="text-white" />
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
                    Olá, <span className="italic text-lux-accent">Paciente.</span>
                </h2>
                <p className="text-lux-text-secondary text-lg">Seu sorriso está 45% mais alinhado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Próxima Consulta */}
                <div className="apple-card p-6 bg-lux-text text-lux-background hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group">
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

                {/* Card 2: Status Financeiro */}
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
                <div className="apple-card p-6 flex flex-col justify-center items-center text-center gap-4 hover:bg-lux-subtle transition-colors cursor-pointer border-dashed">
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
};

export default PatientDashboard;
