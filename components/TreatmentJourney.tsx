import React from 'react';
import { SectionHeader, IslandCard } from './Shared';
import { CheckCircle2, Circle, Clock, MessageSquareQuote, Sparkles, Trophy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../lib/useAppContext';
import { useTreatmentProgress } from '../lib/hooks/useTreatmentProgress';

const TreatmentJourney: React.FC = () => {
    const { session } = useAppContext();
    const patientId = session?.activeContext?.type === 'PATIENT' ? session.activeContext.id : null;

    const { phases, currentPhase, overallProgress, isLoading, error } = useTreatmentProgress({ patientId });

    // Motivational messages based on progress
    const getMotivationalMessage = (progress: number) => {
        if (progress === 0) return "Sua jornada está começando! 🚀";
        if (progress < 25) return "Primeiros passos dados com sucesso! 👏";
        if (progress < 50) return "Você está indo muito bem! 💪";
        if (progress < 75) return "Mais da metade concluída! Continue assim! ⭐";
        if (progress < 100) return "Quase lá! Seu sorriso perfeito está próximo! 🎯";
        return "Parabéns! Tratamento concluído! 🎉";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-lux-accent" size={48} />
            </div>
        );
    }

    if (error || phases.length === 0) {
        return (
            <div className="space-y-8">
                <SectionHeader
                    title="Jornada do Sorriso"
                    subtitle="Acompanhe cada etapa da sua transformação."
                />
                <div className="apple-card p-12 text-center">
                    <Sparkles size={48} className="text-lux-text-secondary mx-auto mb-4 opacity-50" />
                    <h3 className="font-bold text-lux-text text-xl mb-2">Nenhum Tratamento Ativo</h3>
                    <p className="text-lux-text-secondary">
                        Seu plano de tratamento aparecerá aqui assim que for criado pelo seu dentista.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <SectionHeader
                title="Jornada do Sorriso"
                subtitle="Acompanhe cada etapa da sua transformação ortodôntica."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline Visual */}
                <div className="lg:col-span-2">
                    <IslandCard className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-lux-text">Linha do Tempo</h3>
                            <div className="flex items-center gap-2 bg-lux-subtle px-3 py-1 rounded-full">
                                <Clock size={14} className="text-lux-accent" />
                                <span className="text-xs font-bold text-lux-text-secondary">
                                    {currentPhase?.estimatedDate ? `Previsão: ${formatDate(currentPhase.estimatedDate)}` : 'Em andamento'}
                                </span>
                            </div>
                        </div>

                        <div className="relative pl-4 space-y-12 before:content-[''] before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-lux-border">
                            {phases.map((phase, index) => (
                                <motion.div
                                    key={phase.id}
                                    className="relative flex items-start gap-6 group"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={`
                                w-6 h-6 rounded-full border-[3px] z-10 flex-shrink-0 transition-all duration-500
                                ${phase.status === 'completed' ? 'bg-lux-accent border-lux-accent' :
                                            phase.status === 'current' ? 'bg-white border-lux-accent ring-4 ring-lux-accent/20 animate-pulse' :
                                                'bg-lux-surface border-lux-border'}
                            `}>
                                        {phase.status === 'completed' && <CheckCircle2 size={14} className="text-white ml-[1px] mt-[1px]" />}
                                    </div>

                                    <div className={`flex-1 transition-opacity ${phase.status === 'upcoming' ? 'opacity-50' : 'opacity-100'}`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-lux-text text-lg mb-1">{phase.title}</h4>
                                                <p className="text-sm text-lux-text-secondary mb-2">{phase.description}</p>
                                                <p className="text-xs text-lux-text-secondary font-medium">
                                                    {phase.status === 'completed' && phase.completedDate && `Concluído em ${formatDate(phase.completedDate)}`}
                                                    {phase.status === 'current' && 'Em andamento'}
                                                    {phase.status === 'upcoming' && phase.estimatedDate && `Previsão: ${formatDate(phase.estimatedDate)}`}
                                                </p>
                                            </div>
                                            {phase.status === 'completed' && (
                                                <Trophy size={20} className="text-lux-accent" />
                                            )}
                                        </div>

                                        {/* Individual phase progress bar for current phase */}
                                        {phase.status === 'current' && phase.progress !== undefined && (
                                            <div className="mt-3">
                                                <div className="w-full bg-lux-subtle h-2 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-lux-accent rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${phase.progress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    ></motion.div>
                                                </div>
                                                <p className="text-xs text-lux-text-secondary mt-1">{phase.progress}% concluído</p>
                                            </div>
                                        )}
                                    </div>

                                    {phase.status === 'current' && (
                                        <div className="absolute -left-[5px] top-8 w-1 h-full bg-gradient-to-b from-lux-accent to-transparent opacity-50"></div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Dream Goal Card */}
                            <motion.div
                                className="relative flex items-start gap-6"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: phases.length * 0.1 }}
                            >
                                <div className="w-6 h-6 rounded-full border-[3px] border-dashed border-lux-accent z-10 flex-shrink-0 bg-lux-surface"></div>
                                <div className="flex-1">
                                    <div className="apple-card p-4 bg-gradient-to-br from-lux-accent/10 to-lux-accent/5 border-lux-accent/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={20} className="text-lux-accent" />
                                            <h4 className="font-bold text-lux-text">Seu Sonho</h4>
                                        </div>
                                        <p className="text-sm text-lux-text-secondary">
                                            Sorriso perfeito e saudável! Continue seguindo as orientações do seu dentista.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </IslandCard>
                </div>

                {/* Sidebar de Progresso e Notas */}
                <div className="space-y-6">
                    {/* Overall Progress Card */}
                    <motion.div
                        className="bg-lux-text text-lux-background rounded-2xl p-8 relative overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="relative z-10">
                            <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Progresso Total</p>
                            <motion.p
                                className="text-5xl font-light mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                {overallProgress}%
                            </motion.p>
                            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    className="h-full bg-lux-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallProgress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                                ></motion.div>
                            </div>
                            <p className="text-sm opacity-80 font-medium">{getMotivationalMessage(overallProgress)}</p>
                        </div>
                        {/* Abstract graphic */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-lux-accent rounded-full blur-[80px] opacity-30"></div>
                    </motion.div>

                    {/* Milestone Achievements */}
                    {overallProgress >= 25 && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="apple-card p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200"
                        >
                            <div className="flex items-start gap-3">
                                <Trophy className="text-amber-600 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-amber-900 text-sm mb-2">Conquistas Desbloqueadas</h4>
                                    <div className="space-y-2">
                                        {overallProgress >= 25 && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <p className="text-xs text-amber-800">25% - Primeiro Marco! 🎯</p>
                                            </div>
                                        )}
                                        {overallProgress >= 50 && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <p className="text-xs text-amber-800">50% - Metade do Caminho! 🌟</p>
                                            </div>
                                        )}
                                        {overallProgress >= 75 && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <p className="text-xs text-amber-800">75% - Quase Lá! 🚀</p>
                                            </div>
                                        )}
                                        {overallProgress === 100 && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <p className="text-xs text-amber-800">100% - Missão Cumprida! 🎉</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Doctor's Note */}
                    {currentPhase && (
                        <IslandCard className="p-6 border-l-4 border-l-lux-accent">
                            <div className="flex items-start gap-3">
                                <MessageSquareQuote className="text-lux-accent shrink-0" />
                                <div>
                                    <h4 className="font-bold text-lux-text text-sm mb-2">Nota do Dentista</h4>
                                    <p className="text-sm text-lux-text-secondary italic">
                                        "Continue seguindo as orientações para {currentPhase.title.toLowerCase()}.
                                        Você está no caminho certo para alcançar o sorriso dos seus sonhos!"
                                    </p>
                                </div>
                            </div>
                        </IslandCard>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TreatmentJourney;