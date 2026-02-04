
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    FileText,
    Activity,
    Pill,
    Paperclip,
    ChevronRight,
    ChevronDown,
    Stethoscope
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineEvent {
    type: 'encounter' | 'prescription' | 'exam_order' | 'document_emitted' | 'attachment';
    date: string;
    data: any;
}

interface PatientTimelineProps {
    events: TimelineEvent[];
    loading?: boolean;
    onSelectEvent?: (event: TimelineEvent) => void;
}

const EventIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'encounter': return <Stethoscope size={20} className="text-blue-500" />;
        case 'prescription': return <Pill size={20} className="text-green-500" />;
        case 'exam_order': return <Activity size={20} className="text-purple-500" />;
        case 'document_emitted': return <FileText size={20} className="text-orange-500" />;
        default: return <Paperclip size={20} className="text-gray-500" />;
    }
};

const EventCard = ({ event, onClick }: { event: TimelineEvent; onClick?: () => void }) => {
    const { type, date, data } = event;
    const formattedDate = format(new Date(date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });

    let title = 'Evento';
    let details = '';

    if (type === 'encounter') {
        title = `Atendimento (${data.type || 'Consulta'})`;
        details = data.subjective || data.description || 'Sem descrição';
    } else if (type === 'prescription') {
        title = 'Prescrição Receitada';
        details = `${(data.medications || []).length} medicamentos`;
    } else if (type === 'exam_order') {
        title = 'Pedido de Exame';
        details = (data.exams || []).join(', ');
    } else if (type === 'document_emitted') {
        title = data.title || 'Documento';
        details = data.type;
    }

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer mb-4"
            onClick={onClick}
        >
            <div className={`p-3 rounded-full h-fit flex items-center justify-center bg-gray-50`}>
                <EventIcon type={type} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800">{title}</h4>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} /> {formattedDate}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{details}</p>

                {data.status && (
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${data.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${data.status === 'signed' ? 'bg-green-100 text-green-700' : ''}
                        ${data.status === 'ordered' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                        {data.status}
                    </span>
                )}
            </div>
            <ChevronRight size={20} className="text-gray-300 self-center" />
        </motion.div>
    );
};

const PatientTimeline: React.FC<PatientTimelineProps> = ({ events, loading, onSelectEvent }) => {
    const [filter, setFilter] = useState('all');

    const filteredEvents = filter === 'all'
        ? events
        : events.filter(e => e.type === filter);

    if (loading) return <div className="p-8 text-center text-gray-400">Carregando histórico...</div>;

    if (events.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Activity size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">Nenhum registro encontrado</h3>
                <p className="text-gray-500 text-sm mt-1">O histórico deste paciente está vazio.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                {['all', 'encounter', 'prescription', 'exam_order', 'document'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === f
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f === 'all' ? 'Tudo' :
                            f === 'encounter' ? 'Consultas' :
                                f === 'prescription' ? 'Receitas' :
                                    f === 'exam_order' ? 'Exames' : 'Docs'}
                    </button>
                ))}
            </div>

            <div className="relative border-l-2 border-gray-100 pl-8 ml-4 space-y-8">
                {filteredEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                        <span className="absolute -left-[41px] top-6 w-5 h-5 bg-white border-4 border-gray-200 rounded-full" />
                        <EventCard event={event} onClick={() => onSelectEvent?.(event)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientTimeline;
