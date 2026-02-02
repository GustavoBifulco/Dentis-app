import React from 'react';
import { SectionHeader, IslandCard } from './Shared';
import { CheckCircle2, Circle, Clock, MessageSquareQuote } from 'lucide-react';
import { motion } from 'framer-motion';

const TreatmentJourney: React.FC = () => {
  const steps = [
    { title: 'Planejamento Digital', status: 'completed', date: '10 Jan' },
    { title: 'Instalação', status: 'completed', date: '25 Jan' },
    { title: 'Alinhamento & Nivelamento', status: 'current', date: 'Em andamento' },
    { title: 'Refinamento', status: 'upcoming', date: 'Est. Outubro' },
    { title: 'Finalização', status: 'upcoming', date: 'Est. Dezembro' },
  ];

  const progress = 45;

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
                        <span className="text-xs font-bold text-lux-text-secondary">Previsão: Dez 2024</span>
                    </div>
                </div>

                <div className="relative pl-4 space-y-12 before:content-[''] before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-lux-border">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex items-center gap-6 group">
                            <div className={`
                                w-6 h-6 rounded-full border-[3px] z-10 flex-shrink-0 transition-all duration-500
                                ${step.status === 'completed' ? 'bg-lux-accent border-lux-accent' : 
                                  step.status === 'current' ? 'bg-white border-lux-accent ring-4 ring-lux-accent/20' : 
                                  'bg-lux-surface border-lux-border'}
                            `}>
                                {step.status === 'completed' && <CheckCircle2 size={14} className="text-white ml-[1px] mt-[1px]" />}
                            </div>
                            
                            <div className={`flex-1 transition-opacity ${step.status === 'upcoming' ? 'opacity-50' : 'opacity-100'}`}>
                                <h4 className="font-bold text-lux-text text-lg">{step.title}</h4>
                                <p className="text-sm text-lux-text-secondary font-medium">{step.date}</p>
                            </div>

                            {step.status === 'current' && (
                                <div className="absolute -left-[5px] top-8 w-1 h-full bg-gradient-to-b from-lux-accent to-transparent opacity-50"></div>
                            )}
                        </div>
                    ))}
                </div>
            </IslandCard>
        </div>

        {/* Sidebar de Progresso e Notas */}
        <div className="space-y-6">
            <div className="bg-lux-text text-lux-background rounded-2xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Progresso Total</p>
                    <p className="text-5xl font-light mb-4">{progress}%</p>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-lux-accent w-[45%]"></div>
                    </div>
                    <p className="text-xs mt-4 opacity-70">Você está indo muito bem!</p>
                </div>
                {/* Abstract graphic */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-lux-accent rounded-full blur-[80px] opacity-30"></div>
            </div>

            <IslandCard className="p-6 border-l-4 border-l-lux-accent">
                <div className="flex items-start gap-3">
                    <MessageSquareQuote className="text-lux-accent shrink-0" />
                    <div>
                        <h4 className="font-bold text-lux-text text-sm mb-2">Nota do Dr. Ricardo</h4>
                        <p className="text-sm text-lux-text-secondary italic">
                            "A movimentação dos caninos foi excelente este mês. Mantenha o uso dos elásticos conforme conversamos para fechar o espaço superior."
                        </p>
                    </div>
                </div>
            </IslandCard>
        </div>

      </div>
    </div>
  );
};

export default TreatmentJourney;