import React, { useState } from 'react';
import { ViewType } from '../../types';
import {
    Calendar,
    Smile,
    ArrowRight,
    CheckCircle2,
    Pill,
    FileText,
    AlertCircle,
    Navigation,
    DollarSign,
    Loader2,
    Star,
    MapPin,
    ChevronRight,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../lib/useAppContext';
import { useAppointments } from '../../lib/hooks/useAppointments';
import { useFinancials } from '../../lib/hooks/useFinancials';
import { usePrescriptions } from '../../lib/hooks/usePrescriptions';
import { useI18n } from '../../lib/i18n';
import AvailableSlotsViewer from '../AvailableSlotsViewer';
import ContextSwitcher from '../ContextSwitcher';

interface PatientDashboardProps {
    onNavigate?: (view: ViewType) => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
    const { session, switchContext } = useAppContext();
    const { t, locale } = useI18n();
    const patientId = session?.activeContext?.type === 'PATIENT' ? session.activeContext.id : null;

    const { nextAppointment, isLoading: appointmentsLoading } = useAppointments({ patientId });
    const { outstandingBalance, totalPaid, totalContracted, isLoading: financialsLoading } = useFinancials({ patientId });
    const { activePrescriptions, isLoading: prescriptionsLoading } = usePrescriptions({ patientId });

    const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('patientDashboard.goodMorning');
        if (hour < 18) return t('patientDashboard.goodAfternoon');
        return t('patientDashboard.goodEvening');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    };

    const handleWazeNavigation = () => {
        const clinicAddress = 'Av. Brigadeiro Faria Lima, 2000, São Paulo';
        window.open(`https://waze.com/ul?q=${encodeURIComponent(clinicAddress)}`, '_blank');
    };

    // Filter available contexts to show family members/dependents if any
    const patientContexts = session?.availableContexts.filter(c => c.type === 'PATIENT') || [];
    const hasDependents = patientContexts.length > 1;

    return (
        <div className="max-w-md mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Context Switcher Adaptado para Família */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white shadow-xl overflow-hidden mb-6">
                <div className="px-5 pt-4 flex items-center gap-2">
                    <Users size={14} className="text-lux-accent" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{t('patientDashboard.familyProfile')}</span>
                </div>
                <ContextSwitcher
                    availableContexts={patientContexts}
                    activeContext={session?.activeContext || null}
                    onSwitch={switchContext}
                />
            </div>

            <div className="px-2">
                <h2 className="text-5xl font-editorial font-medium text-lux-text leading-tight">
                    {getGreeting()} <br />
                    <span className="italic text-lux-accent">{session?.user?.name?.split(' ')[0] || t('patientPortal.fallbackName')}.</span>
                </h2>
            </div>

            {/* --- ACTION CARDS (Lógica Condicional) --- */}
            <div className="space-y-4">

                {/* 1. Próximo Compromisso (Confirmado/Agendado) */}
                <AnimatePresence>
                    {nextAppointment && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-lux-text text-lux-background rounded-[40px] p-8 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lux-accent mb-1">{t('patientDashboard.nextVisit')}</span>
                                        <span className="text-2xl font-bold">{formatDate(String(nextAppointment.startTime))} às {formatTime(String(nextAppointment.startTime))}</span>
                                    </div>
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                        <Calendar className="text-lux-accent" size={24} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" alt="Dr." />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Dr. Ricardo Silveira</p>
                                        <p className="text-[10px] opacity-60 uppercase tracking-widest">{t('patientDashboard.orthodontist')}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleWazeNavigation}
                                        className="flex-1 bg-white text-lux-text py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-lux-accent hover:text-white transition-all"
                                    >
                                        <MapPin size={14} /> {t('patientDashboard.openMap')}
                                    </button>
                                    <button className="flex-1 bg-lux-accent text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-lux-accent/30">
                                        {t('patientDashboard.confirm')}
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-lux-accent/20 rounded-full blur-[80px]" />
                        </motion.div>
                    )}

                    {!nextAppointment && !appointmentsLoading && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-8 text-center group hover:border-lux-accent transition-colors"
                        >
                            <Calendar className="mx-auto text-slate-300 mb-4 group-hover:text-lux-accent transition-colors" size={48} />
                            <h3 className="text-xl font-black text-slate-800 mb-2">{t('patientDashboard.noAppointments')}</h3>
                            <p className="text-sm text-slate-400 mb-6 font-medium">{t('patientDashboard.careForSmile')}</p>
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="w-full bg-lux-accent text-white py-4 rounded-2xl font-black text-xs uppercase hover:scale-105 transition-transform shadow-lg shadow-lux-accent/30"
                            >
                                {t('patientDashboard.bookNow')}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. Cobrança Pendente */}
                <AnimatePresence>
                    {outstandingBalance > 0 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => onNavigate?.(ViewType.PATIENT_WALLET)}
                            className="bg-white border-2 border-lux-accent/20 rounded-[40px] p-6 flex justify-between items-center group cursor-pointer hover:bg-lux-accent hover:border-lux-accent transition-all duration-500"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:bg-white/20 group-hover:border-white/20 transition-all">
                                    <DollarSign className="text-amber-600 group-hover:text-white" size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest group-hover:text-white/60">{t('patientDashboard.pendingPayment')}</p>
                                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-white">R$ {outstandingBalance.toLocaleString('pt-BR')}</h3>
                                </div>
                            </div>
                            <div className="bg-lux-accent text-white group-hover:bg-white group-hover:text-lux-accent px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all">
                                {t('patientDashboard.payNow')}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. Review (Se tratamento finalizado) */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-[40px] p-8 text-center group"
                >
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Star className="text-emerald-500 fill-emerald-500" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-emerald-900 mb-2">{t('patientDashboard.smileShines')}</h3>
                    <p className="text-sm text-emerald-700/80 font-medium mb-6">{t('patientDashboard.shareResult')}</p>
                    <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200">
                        {t('patientDashboard.leaveReview')}
                    </button>
                </motion.div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onNavigate?.(ViewType.TREATMENT_JOURNEY)}
                    className="bg-white p-7 rounded-[32px] border border-slate-100 text-left hover:shadow-xl transition-all group"
                >
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Smile size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{t('patientDashboard.journey')}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('patientDashboard.evolution3d')}</p>
                </button>

                <button
                    onClick={() => setShowPrescriptionsModal(true)}
                    className="bg-white p-7 rounded-[32px] border border-slate-100 text-left hover:shadow-xl transition-all group"
                >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Pill size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{t('patientDashboard.prescriptions')}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('patientDashboard.activePrescriptions')}</p>
                </button>
            </div>

            {/* Emergency CTA */}
            <button className="w-full bg-red-50 border border-red-100 p-6 rounded-[32px] flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                        <AlertCircle size={28} />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-red-900 text-sm">{t('patientDashboard.sosDental')}</h4>
                        <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest">{t('patientDashboard.emergencyContact')}</p>
                    </div>
                </div>
                <ChevronRight className="text-red-300 group-hover:translate-x-1 transition-transform" />
            </button>


            {/* Modal de Agendamento */}
            <AnimatePresence>
                {showBookingModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBookingModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl z-10"
                        >
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">{t('patientDashboard.bookAppointment')}</h3>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
                                >
                                    <ChevronRight className="rotate-90" size={16} />
                                </button>
                            </div>
                            <div className="p-4">
                                <AvailableSlotsViewer
                                    onSelectSlot={(date, time) => {
                                        // TODO: Chamar API de criação de agendamento
                                        alert(`Agendar para ${date} às ${time}?`);
                                        setShowBookingModal(false);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PatientDashboard;
