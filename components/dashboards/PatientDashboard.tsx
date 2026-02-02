import React, { useState } from 'react';
import { ViewType } from '../../types';
import { Calendar, Smile, ArrowRight, CheckCircle2, Pill, FileText, AlertCircle, Navigation, DollarSign, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../lib/useAppContext';
import { useAppointments } from '../../lib/hooks/useAppointments';
import { useFinancials } from '../../lib/hooks/useFinancials';
import { usePrescriptions } from '../../lib/hooks/usePrescriptions';

interface PatientDashboardProps {
    onNavigate?: (view: ViewType) => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
    const { session } = useAppContext();
    const patientId = session?.activeContext?.type === 'PATIENT' ? session.activeContext.id : null;

    const { nextAppointment, isLoading: appointmentsLoading } = useAppointments({ patientId });
    const { outstandingBalance, totalPaid, totalContracted, isLoading: financialsLoading } = useFinancials({ patientId });
    const { activePrescriptions, isLoading: prescriptionsLoading } = usePrescriptions({ patientId });

    const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleWazeNavigation = () => {
        // Mock Waze integration - replace with actual clinic address
        const clinicAddress = 'Clínica Sorriso, São Paulo';
        window.open(`https://waze.com/ul?q=${encodeURIComponent(clinicAddress)}`, '_blank');
    };

    const handleEmergencyContact = () => {
        // Mock WhatsApp integration - replace with actual clinic number
        const clinicPhone = '5511999999999';
        window.open(`https://wa.me/${clinicPhone}?text=Olá, preciso de ajuda urgente!`, '_blank');
    };

    const paymentProgress = totalContracted > 0 ? (totalPaid / totalContracted) * 100 : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-editorial font-medium text-lux-text leading-[1.1]">
                    Olá, <span className="italic text-lux-accent">{session?.name.split(' ')[0] || 'Paciente'}.</span>
                </h2>
                <p className="text-lux-text-secondary text-lg">Seu portal de cuidados dentários.</p>
            </div>

            {/* HERO CARD: Próximo Compromisso */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative"
            >
                {appointmentsLoading ? (
                    <div className="apple-card p-8 flex items-center justify-center min-h-[200px]">
                        <Loader2 className="animate-spin text-lux-accent" size={32} />
                    </div>
                ) : nextAppointment ? (
                    <div className="apple-card p-6 bg-lux-text text-lux-background hover:scale-[1.01] transition-transform relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lux-accent rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-lux-accent text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                    Confirmado
                                </span>
                                <Calendar size={20} className="text-lux-background/50" />
                            </div>
                            <p className="text-4xl font-light mb-1">{formatTime(nextAppointment.startTime)}</p>
                            <p className="text-lg font-bold text-lux-accent mb-4">{formatDate(nextAppointment.startTime)}</p>
                            <div className="mb-6">
                                <p className="font-bold text-lg">Consulta Agendada</p>
                                <p className="text-sm opacity-70">Dr. {session?.name || 'Dentista'}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleWazeNavigation}
                                    className="flex-1 bg-lux-background text-lux-text px-4 py-3 rounded-xl font-bold text-sm hover:bg-lux-subtle transition-colors flex items-center justify-center gap-2"
                                >
                                    <Navigation size={16} />
                                    Como Chegar
                                </button>
                                <button className="flex-1 bg-lux-accent text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-lux-accent/90 transition-colors">
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="apple-card p-8 text-center border-2 border-dashed border-lux-border hover:border-lux-accent transition-colors">
                        <div className="w-16 h-16 rounded-full bg-lux-accent/10 flex items-center justify-center text-lux-accent mx-auto mb-4">
                            <Calendar size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bold text-lux-text text-xl mb-2">Nenhuma Consulta Agendada</h3>
                        <p className="text-lux-text-secondary mb-6">Que tal cuidar do seu sorriso hoje?</p>
                        <button className="bg-lux-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-lux-accent/90 transition-colors">
                            Agendar Check-up
                        </button>
                    </div>
                )}
            </motion.div>

            {/* STATUS FINANCEIRO */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {financialsLoading ? (
                    <div className="apple-card p-6 flex items-center justify-center min-h-[150px]">
                        <Loader2 className="animate-spin text-lux-accent" size={24} />
                    </div>
                ) : (
                    <div className="apple-card p-6 hover:border-lux-accent/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lux-text text-lg">Status Financeiro</h3>
                                <p className="text-xs text-lux-text-secondary uppercase tracking-wider">Plano de Tratamento</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${outstandingBalance === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {outstandingBalance === 0 ? <CheckCircle2 size={20} /> : <DollarSign size={20} />}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {outstandingBalance === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-2xl font-bold text-emerald-600">Tudo em dia! 🎉</p>
                                    <p className="text-sm text-lux-text-secondary mt-1">Seus pagamentos estão em dia</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-end">
                                        <span className="text-3xl font-light text-lux-text">
                                            R$ {outstandingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-xs font-bold text-lux-text-secondary mb-1">Saldo Devedor</span>
                                    </div>
                                    <div className="w-full bg-lux-subtle h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${paymentProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-lux-text-secondary">
                                        {paymentProgress.toFixed(0)}% pago (R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {totalContracted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                    </p>
                                </>
                            )}
                            <button
                                onClick={() => onNavigate?.(ViewType.PATIENT_WALLET)}
                                className="w-full mt-4 bg-lux-subtle hover:bg-lux-border text-lux-text px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                Ver Faturas <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* ATALHOS RÁPIDOS (2x2 Grid) */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-bold text-lux-text text-lg mb-4">Acesso Rápido</h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Minhas Receitas */}
                    <button
                        onClick={() => setShowPrescriptionsModal(true)}
                        className="apple-card p-6 hover:bg-lux-subtle transition-colors text-left relative group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Pill size={24} />
                        </div>
                        <h4 className="font-bold text-lux-text mb-1">Minhas Receitas</h4>
                        <p className="text-xs text-lux-text-secondary">
                            {prescriptionsLoading ? 'Carregando...' : `${activePrescriptions.length} ativa${activePrescriptions.length !== 1 ? 's' : ''}`}
                        </p>
                        {activePrescriptions.length > 0 && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                    </button>

                    {/* Meu Tratamento */}
                    <button
                        onClick={() => onNavigate?.(ViewType.TREATMENT_JOURNEY)}
                        className="apple-card p-6 hover:bg-lux-subtle transition-colors text-left group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Smile size={24} />
                        </div>
                        <h4 className="font-bold text-lux-text mb-1">Meu Tratamento</h4>
                        <p className="text-xs text-lux-text-secondary">Jornada do sorriso</p>
                    </button>

                    {/* Exames */}
                    <button className="apple-card p-6 hover:bg-lux-subtle transition-colors text-left group">
                        <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <h4 className="font-bold text-lux-text mb-1">Exames</h4>
                        <p className="text-xs text-lux-text-secondary">Raio-X e documentos</p>
                    </button>

                    {/* Emergência */}
                    <button
                        onClick={handleEmergencyContact}
                        className="apple-card p-6 bg-red-50 border-red-200 hover:bg-red-100 transition-colors text-left group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <AlertCircle size={24} />
                        </div>
                        <h4 className="font-bold text-red-900 mb-1">Emergência</h4>
                        <p className="text-xs text-red-700">Contato direto</p>
                    </button>
                </div>
            </motion.div>

            {/* Prescriptions Modal */}
            {showPrescriptionsModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowPrescriptionsModal(false)}></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-lux-surface rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
                        >
                            <div className="p-6 border-b border-lux-border">
                                <h3 className="text-xl font-bold text-lux-text">Minhas Receitas</h3>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {activePrescriptions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Pill size={48} className="text-lux-text-secondary mx-auto mb-4 opacity-50" />
                                        <p className="text-lux-text-secondary">Nenhuma receita ativa no momento</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activePrescriptions.map(prescription => (
                                            <div key={prescription.id} className="apple-card p-4">
                                                <h4 className="font-bold text-lux-text mb-1">{prescription.medication}</h4>
                                                <p className="text-sm text-lux-text-secondary mb-2">{prescription.dosage}</p>
                                                <p className="text-xs text-lux-text-secondary italic">{prescription.instructions}</p>
                                                <p className="text-xs text-lux-text-secondary mt-2">
                                                    Válida até: {formatDate(prescription.expiryDate)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-lux-border">
                                <button
                                    onClick={() => setShowPrescriptionsModal(false)}
                                    className="w-full bg-lux-accent text-white px-4 py-3 rounded-xl font-bold hover:bg-lux-accent/90 transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PatientDashboard;

