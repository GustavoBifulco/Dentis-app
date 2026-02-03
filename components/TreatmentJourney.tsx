import React, { useState } from 'react';
import {
    CheckCircle2,
    Circle,
    Clock,
    MessageSquareQuote,
    Sparkles,
    Trophy,
    Loader2,
    Box,
    Calendar,
    Stethoscope,
    Zap,
    ChevronDown,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../lib/useAppContext';
import { useTreatmentProgress } from '../lib/hooks/useTreatmentProgress';
import { usePatientScans } from '../lib/hooks/usePatientScans';
import ThreeDViewer from './3DViewer';

const TreatmentJourney: React.FC = () => {
    const { session } = useAppContext();
    const patientId = session?.activeContext?.type === 'PATIENT' ? session.activeContext.id : null;

    const [selectedScanUrl, setSelectedScanUrl] = useState<string | null>(null);
    const { phases, currentPhase, overallProgress, isLoading, error } = useTreatmentProgress({ patientId });
    const { scans, loading: scansLoading } = usePatientScans();

    const getPhaseIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('escaneamento') || t.includes('scan')) return <Box size={18} />;
        if (t.includes('aparelho') || t.includes('alinhador')) return <Zap size={18} />;
        if (t.includes('consulta') || t.includes('analise')) return <Stethoscope size={18} />;
        return <Sparkles size={18} />;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
                <Loader2 className="animate-spin text-lux-accent" size={48} />
                <p className="font-bold text-xs uppercase tracking-[0.2em]">Construindo seu Futuro Sorriso...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto pb-20">

            {/* Header com Progresso Global */}
            <div className="bg-lux-text text-lux-background rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lux-accent">Seu Progresso Global</span>
                        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            Sorriso 2.0
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-6xl font-light">{overallProgress}%</span>
                        <span className="text-sm font-bold opacity-60 mb-2">concluído</span>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-lux-accent"
                        />
                    </div>
                    <p className="text-sm font-medium opacity-80 leading-relaxed italic">
                        "{overallProgress < 50 ? 'Você está nos primeiros marcos da sua transformação. Cada dia conta!' : 'Mais da metade do caminho percorrido! Seu novo sorriso está quase aqui.'}"
                    </p>
                </div>
                {/* Visuals */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-lux-accent/30 rounded-full blur-[100px]" />
            </div>

            {/* Timeline Vertical (Style Delivery) */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 relative">
                <h3 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Timeline do Tratamento</h3>

                <div className="relative space-y-12 pb-4">
                    {/* Linha da Timeline */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-slate-100 rounded-full" />

                    {phases.map((phase, index) => {
                        const isCompleted = phase.status === 'completed';
                        const isCurrent = phase.status === 'current';

                        return (
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex items-start gap-6 group"
                            >
                                {/* Ponto da Timeline */}
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-500
                                    ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                                        isCurrent ? 'bg-lux-accent text-white shadow-lg shadow-lux-accent/30 animate-pulse' :
                                            'bg-slate-100 text-slate-400 border-4 border-white'}
                                `}>
                                    {isCompleted ? <CheckCircle2 size={24} /> : getPhaseIcon(phase.title)}
                                </div>

                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-black text-sm uppercase tracking-tight ${isCurrent ? 'text-lux-accent' : 'text-slate-800'}`}>
                                            {phase.title}
                                        </h4>
                                        <span className="text-[10px] font-black text-slate-300 uppercase">
                                            {isCompleted ? 'OK' : isCurrent ? 'AGORA' : 'EM BREVE'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                                        {"Descrição não disponível"}
                                    </p>

                                    {isCurrent && (
                                        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={12} /> Previsão: {new Date().toLocaleDateString()}
                                            </p>

                                            {/* Integração 3D se houver scan */}
                                            {scans.length > 0 && phase.title.toLowerCase().includes('escaneamento') && (
                                                <button
                                                    onClick={() => setSelectedScanUrl(scans[0].url)}
                                                    className="w-full bg-white border border-lux-accent/20 text-lux-accent py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-lux-accent hover:text-white transition-all shadow-sm"
                                                >
                                                    <Box size={14} /> Ver Escaneamento 3D
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Achievement Footer */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-[40px] p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-emerald-100 shadow-lg">
                    <Trophy className="text-emerald-500" size={32} />
                </div>
                <div>
                    <h4 className="font-black text-emerald-900 text-sm mb-1 uppercase tracking-tight">Próxima Conquista</h4>
                    <p className="text-xs text-emerald-700/80 font-bold uppercase tracking-widest">
                        {overallProgress < 100 ? 'Finalizar Alinhadores' : 'Sorriso dos Sonhos'}
                    </p>
                </div>
            </div>

            {/* 3D Visualizer Modal */}
            <AnimatePresence>
                {selectedScanUrl && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedScanUrl(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Seu Sorriso Digital</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escaneamento Intraoral</p>
                                </div>
                                <button
                                    onClick={() => setSelectedScanUrl(null)}
                                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <ThreeDViewer url={selectedScanUrl} className="h-[450px]" />
                            </div>
                            <div className="p-6 bg-slate-50 text-center">
                                <p className="text-xs text-slate-500 font-medium">Este é o modelo digital preciso dos seus dentes, usado para planejar seu tratamento com perfeição.</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default TreatmentJourney;