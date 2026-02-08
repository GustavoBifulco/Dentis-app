import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuroraAI } from '../../lib/AuroraOps';
import { AlertCircle, Check, Loader2, Sparkles, BrainCircuit } from 'lucide-react';

interface AuroraOrbProps {
    size?: number; // px
    className?: string;
    showStatusText?: boolean;
}

export const AuroraOrb: React.FC<AuroraOrbProps> = ({ size = 32, className = '', showStatusText = false }) => {
    const { state, requestId } = useAuroraAI();

    // Map states to visual properties
    const stateConfig = {
        idle: {
            color: 'hsl(var(--primary))',
            scale: 1,
            pulse: false,
            icon: Sparkles
        },
        thinking: {
            color: 'hsl(var(--violet-hint))',
            scale: 1.1,
            pulse: true,
            icon: BrainCircuit
        },
        working: {
            color: 'hsl(var(--info))',
            scale: 1.1,
            pulse: true,
            icon: Loader2
        },
        done: {
            color: 'hsl(var(--success))',
            scale: 1.2,
            pulse: false,
            icon: Check
        },
        error: {
            color: 'hsl(var(--destructive))',
            scale: 0.9,
            pulse: false,
            icon: AlertCircle
        }
    };

    const config = stateConfig[state] || stateConfig.idle;
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                {/* Glow Effect */}
                <motion.div
                    animate={{
                        scale: config.pulse ? [1, 1.5, 1] : config.scale,
                        opacity: config.pulse ? [0.3, 0.6, 0.3] : 0.2
                    }}
                    transition={{
                        duration: config.pulse ? 2 : 0.5,
                        repeat: config.pulse ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full blur-md"
                    style={{ backgroundColor: config.color }}
                />

                {/* Core Orb */}
                <motion.div
                    initial={false}
                    animate={{
                        backgroundColor: state === 'idle' ? 'transparent' : config.color,
                        borderColor: config.color,
                        scale: config.pulse ? [1, 1.05, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 rounded-full border-2 flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-sm"
                    style={{
                        width: '100%',
                        height: '100%',
                        borderColor: config.color
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Icon
                                size={size * 0.5}
                                className={state === 'working' ? 'animate-spin' : ''}
                                style={{ color: state === 'idle' ? config.color : '#fff' }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {showStatusText && (
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
                        {state === 'idle' ? 'Dentis AI' :
                            state === 'thinking' ? 'Pensando...' :
                                state === 'working' ? 'Processando...' :
                                    state === 'done' ? 'Concluído' : 'Erro'}
                    </span>
                    {state === 'error' && (
                        <span className="text-[10px] text-[hsl(var(--text-muted))]">
                            Clique para ver ID
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
