import React from 'react';
import {
    AlertCircle,
    TrendingUp,
    Sparkles,
    Calendar,
    FileText,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { IslandCard } from '../Shared';

interface SmartCardsProps {
    patient: {
        id: number;
        name: string;
    };
    alerts: Array<{
        id: number;
        type: string;
        severity: string;
        description: string;
    }>;
    nextSteps: Array<{
        id: string;
        title: string;
        type: string;
        dueDate?: string;
    }>;
    summary: {
        lastVisit?: string;
        nextAppointment?: string;
        pendingDocuments?: number;
        activeTreatments?: number;
    };
}

const SmartCards: React.FC<SmartCardsProps> = ({ patient, alerts, nextSteps, summary }) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'hsl(var(--error))';
            case 'high':
                return 'hsl(var(--warning))';
            case 'medium':
                return 'hsl(var(--info))';
            default:
                return 'hsl(var(--text-muted))';
        }
    };

    const getSeverityBg = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'hsl(var(--error-bg))';
            case 'high':
                return 'hsl(var(--warning-bg))';
            case 'medium':
                return 'hsl(var(--info-bg))';
            default:
                return 'hsl(var(--muted))';
        }
    };

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <IslandCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} style={{ color: 'hsl(var(--primary))' }} />
                    <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--text-main))' }}>
                        Resumo
                    </h3>
                </div>

                <div className="space-y-3">
                    {summary.lastVisit && (
                        <div className="flex items-center justify-between text-sm">
                            <span style={{ color: 'hsl(var(--text-muted))' }}>Última visita</span>
                            <span className="font-medium" style={{ color: 'hsl(var(--text-main))' }}>
                                {new Date(summary.lastVisit).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    )}
                    {summary.nextAppointment && (
                        <div className="flex items-center justify-between text-sm">
                            <span style={{ color: 'hsl(var(--text-muted))' }}>Próxima consulta</span>
                            <span className="font-medium" style={{ color: 'hsl(var(--primary))' }}>
                                {new Date(summary.nextAppointment).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    )}
                    {summary.activeTreatments !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                            <span style={{ color: 'hsl(var(--text-muted))' }}>Tratamentos ativos</span>
                            <span className="font-bold" style={{ color: 'hsl(var(--text-main))' }}>
                                {summary.activeTreatments}
                            </span>
                        </div>
                    )}
                </div>

                {/* Clinical Alerts */}
                {alerts.length > 0 && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--text-muted))' }}>
                            Alertas Clínicos
                        </h4>
                        <div className="space-y-2">
                            {alerts.slice(0, 3).map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-2 p-2 rounded-lg"
                                    style={{ backgroundColor: getSeverityBg(alert.severity) }}
                                >
                                    <AlertCircle size={14} style={{ color: getSeverityColor(alert.severity), marginTop: '2px' }} />
                                    <p className="text-xs flex-1" style={{ color: getSeverityColor(alert.severity) }}>
                                        {alert.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </IslandCard>

            {/* Next Steps Card */}
            <IslandCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={18} style={{ color: 'hsl(var(--primary))' }} />
                    <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--text-main))' }}>
                        Próximos Passos
                    </h3>
                </div>

                {nextSteps.length > 0 ? (
                    <div className="space-y-3">
                        {nextSteps.map((step) => (
                            <div
                                key={step.id}
                                className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-sm"
                                style={{ backgroundColor: 'hsl(var(--muted))' }}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {step.type === 'appointment' && <Calendar size={16} style={{ color: 'hsl(var(--primary))' }} />}
                                    {step.type === 'document' && <FileText size={16} style={{ color: 'hsl(var(--warning))' }} />}
                                    {step.type === 'task' && <Clock size={16} style={{ color: 'hsl(var(--info))' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: 'hsl(var(--text-main))' }}>
                                        {step.title}
                                    </p>
                                    {step.dueDate && (
                                        <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-muted))' }}>
                                            {new Date(step.dueDate).toLocaleDateString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: 'hsl(var(--success))' }} />
                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--text-muted))' }}>
                            Tudo em dia!
                        </p>
                    </div>
                )}
            </IslandCard>

            {/* AI Insights Placeholder */}
            <IslandCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} style={{ color: 'hsl(var(--violet-hint))' }} />
                    <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'hsl(var(--text-main))' }}>
                        Insights IA
                    </h3>
                </div>

                <div className="text-center py-8">
                    <div
                        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                        style={{ backgroundColor: 'hsl(var(--muted))' }}
                    >
                        <Sparkles size={24} style={{ color: 'hsl(var(--violet-hint))' }} />
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--text-main))' }}>
                        Em breve
                    </p>
                    <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                        Análises inteligentes e recomendações personalizadas
                    </p>
                </div>
            </IslandCard>
        </div>
    );
};

export default SmartCards;
