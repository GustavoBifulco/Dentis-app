
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    FileText,
    Activity,
    Pill,
    Paperclip,
    ChevronRight,
    Stethoscope,
    Truck,
    FlaskConical,
    DollarSign,
    AlertCircle,
    Download,
    Edit,
    MessageSquare,
    Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TimelineItem, UnifiedTimelineEvent } from '../types';
import { LuxButton } from './Shared';

interface PatientTimelineProps {
    events: TimelineItem[];
    loading?: boolean;
    onSelectEvent?: (event: TimelineItem) => void;
    viewType?: 'dentist' | 'patient';
    onEdit?: (event: TimelineItem) => void;
    onAddNote?: (event: TimelineItem) => void;
}

const EventIcon = ({ type, subType }: { type: string, subType?: string }) => {
    const iconProps = { size: 20 };

    switch (type) {
        case 'encounter':
            return <Stethoscope {...iconProps} style={{ color: 'hsl(var(--primary))' }} />;
        case 'prescription':
            return <Pill {...iconProps} style={{ color: 'hsl(var(--success))' }} />;
        case 'exam_order':
            return <Activity {...iconProps} style={{ color: 'hsl(var(--violet-hint))' }} />;
        case 'document_emitted':
            return <FileText {...iconProps} style={{ color: 'hsl(var(--warning))' }} />;
        case 'timeline_event':
            switch (subType) {
                case 'lab':
                    return <FlaskConical {...iconProps} style={{ color: 'hsl(var(--violet-hint))' }} />;
                case 'logistic':
                    return <Truck {...iconProps} style={{ color: 'hsl(var(--info))' }} />;
                case 'financial':
                    return <DollarSign {...iconProps} style={{ color: 'hsl(var(--success))' }} />;
                default:
                    return <AlertCircle {...iconProps} style={{ color: 'hsl(var(--text-muted))' }} />;
            }
        default:
            return <Paperclip {...iconProps} style={{ color: 'hsl(var(--text-muted))' }} />;
    }
};

const EventCard = ({
    event,
    onClick,
    viewType = 'dentist',
    onEdit,
    onAddNote
}: {
    event: TimelineItem;
    onClick?: () => void;
    viewType?: 'dentist' | 'patient';
    onEdit?: (event: TimelineItem) => void;
    onAddNote?: (event: TimelineItem) => void;
}) => {
    const { type, date, data } = event;
    const formattedDate = format(new Date(date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });

    let title = 'Evento';
    let details = '';
    let status = data.status;
    let subType = '';
    let attachments: any[] = [];

    if (type === 'encounter') {
        title = `Atendimento (${data.type || 'Consulta'})`;
        details = data.subjective || data.description || 'Sem descrição';
        attachments = data.attachments || [];
    } else if (type === 'prescription') {
        title = 'Prescrição Receitada';
        details = `${(data.medications || []).length} medicamentos`;
        attachments = data.attachments || [];
    } else if (type === 'exam_order') {
        title = 'Pedido de Exame';
        details = (data.exams || []).join(', ');
        attachments = data.attachments || [];
    } else if (type === 'document_emitted') {
        title = data.title || 'Documento';
        details = data.type;
        attachments = data.url ? [{ name: data.title, url: data.url }] : [];
    } else if (type === 'timeline_event') {
        const tObj = data as UnifiedTimelineEvent;
        title = tObj.title;
        details = tObj.summary || '';
        subType = tObj.eventType;
        attachments = tObj.attachments || [];
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return { bg: 'hsl(var(--warning-bg))', text: 'hsl(var(--warning))' };
            case 'signed': return { bg: 'hsl(var(--success-bg))', text: 'hsl(var(--success))' };
            case 'ordered': return { bg: 'hsl(var(--info-bg))', text: 'hsl(var(--info))' };
            default: return { bg: 'hsl(var(--muted))', text: 'hsl(var(--text-muted))' };
        }
    };

    const statusColors = status ? getStatusColor(status) : null;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all mb-4"
            style={{ border: '1px solid hsl(var(--border))' }}
        >
            <div className="flex gap-4">
                <div className="p-3 rounded-full h-fit flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                    <EventIcon type={type} subType={subType} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold" style={{ color: 'hsl(var(--text-main))' }}>{title}</h4>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--text-muted))' }}>
                            <Calendar size={12} /> {formattedDate}
                        </span>
                    </div>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'hsl(var(--text-secondary))' }}>{details}</p>

                    {status && statusColors && (
                        <span
                            className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                        >
                            {status}
                        </span>
                    )}
                </div>
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-16">
                    {attachments.map((att: any, idx: number) => (
                        <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-sm"
                            style={{
                                backgroundColor: 'hsl(var(--muted))',
                                color: 'hsl(var(--primary))'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Paperclip size={12} />
                            {att.name || 'Anexo'}
                            <Download size={12} />
                        </a>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pl-16">
                <button
                    onClick={onClick}
                    className="flex items-center gap-1 text-xs font-medium transition-all hover:underline"
                    style={{ color: 'hsl(var(--primary))' }}
                >
                    <Eye size={12} />
                    Ver detalhes
                </button>

                {viewType === 'dentist' && (
                    <div className="flex gap-2">
                        {onEdit && (
                            <LuxButton
                                variant="ghost"
                                size="sm"
                                icon={<Edit size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(event);
                                }}
                            >
                                Editar
                            </LuxButton>
                        )}
                        {onAddNote && (
                            <LuxButton
                                variant="ghost"
                                size="sm"
                                icon={<MessageSquare size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddNote(event);
                                }}
                            >
                                Nota
                            </LuxButton>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const PatientTimeline: React.FC<PatientTimelineProps> = ({
    events,
    loading,
    onSelectEvent,
    viewType = 'dentist',
    onEdit,
    onAddNote
}) => {
    const [filter, setFilter] = useState('all');

    const filteredEvents = filter === 'all'
        ? events
        : events.filter(e => {
            if (e.type === 'timeline_event') {
                return (e.data as UnifiedTimelineEvent).eventType === filter;
            }
            return e.type === filter;
        });

    if (loading) {
        return (
            <div className="p-8 text-center" style={{ color: 'hsl(var(--text-muted))' }}>
                Carregando histórico...
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center p-12 rounded-2xl border border-dashed" style={{
                backgroundColor: 'hsl(var(--muted))',
                borderColor: 'hsl(var(--border))'
            }}>
                <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Activity size={32} style={{ color: 'hsl(var(--text-muted))' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--text-main))' }}>
                    Nenhum registro encontrado
                </h3>
                <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-muted))' }}>
                    O histórico deste paciente está vazio.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 rounded-lg w-fit overflow-x-auto" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                {['all', 'encounter', 'lab', 'logistic', 'financial'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap"
                        style={{
                            backgroundColor: filter === f ? 'white' : 'transparent',
                            color: filter === f ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                            boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        {f === 'all' ? 'Tudo' :
                            f === 'encounter' ? 'Clínico' :
                                f === 'lab' ? 'Laboratório' :
                                    f === 'logistic' ? 'Logística' : 'Financeiro'}
                    </button>
                ))}
            </div>

            <div className="relative border-l-2 pl-8 ml-4 space-y-8" style={{ borderColor: 'hsl(var(--border))' }}>
                {filteredEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                        <span
                            className="absolute -left-[41px] top-6 w-5 h-5 bg-white rounded-full"
                            style={{ border: '4px solid hsl(var(--border))' }}
                        />
                        <EventCard
                            event={event}
                            onClick={() => onSelectEvent?.(event)}
                            viewType={viewType}
                            onEdit={onEdit}
                            onAddNote={onAddNote}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientTimeline;
