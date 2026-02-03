import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateAppointmentModal from './CreateAppointmentModal';

interface Appointment {
    id: number;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    status: string;
    appointmentType: string;
    patient?: {
        id: number;
        name: string;
        phone?: string;
    };
    procedure?: {
        id: number;
        name: string;
    };
    notes?: string;
    chiefComplaint?: string;
}

export default function AppointmentCalendar() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState<'day' | 'week' | 'month'>('week');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate, view]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const startDate = getStartDate();
            const endDate = getEndDate();

            const response = await fetch(
                `/api/appointments?start_date=${startDate}&end_date=${endDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStartDate = () => {
        const date = new Date(selectedDate);
        if (view === 'day') {
            return date.toISOString().split('T')[0];
        } else if (view === 'week') {
            const day = date.getDay();
            date.setDate(date.getDate() - day);
            return date.toISOString().split('T')[0];
        } else {
            date.setDate(1);
            return date.toISOString().split('T')[0];
        }
    };

    const getEndDate = () => {
        const date = new Date(selectedDate);
        if (view === 'day') {
            return date.toISOString().split('T')[0];
        } else if (view === 'week') {
            const day = date.getDay();
            date.setDate(date.getDate() + (6 - day));
            return date.toISOString().split('T')[0];
        } else {
            date.setMonth(date.getMonth() + 1);
            date.setDate(0);
            return date.toISOString().split('T')[0];
        }
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const date = new Date(selectedDate);
        if (view === 'day') {
            date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
        } else if (view === 'week') {
            date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setSelectedDate(date);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-500',
            confirmed: 'bg-green-500',
            completed: 'bg-blue-500',
            cancelled: 'bg-red-500',
            no_show: 'bg-gray-500',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            consulta: '🦷',
            retorno: '🔄',
            urgência: '🚨',
            procedimento: '⚕️',
        };
        return icons[type as keyof typeof icons] || '📅';
    };

    const filteredAppointments = filterStatus === 'all'
        ? appointments
        : appointments.filter(apt => apt.status === filterStatus);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
                            <p className="text-sm text-slate-500">Gerencie seus agendamentos</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Nova Consulta</span>
                    </button>
                </div>

                {/* Navigation and View Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigateDate('prev')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="text-lg font-semibold text-slate-700 min-w-[200px] text-center">
                            {selectedDate.toLocaleDateString('pt-BR', {
                                month: 'long',
                                year: 'numeric',
                                ...(view === 'day' && { day: 'numeric' })
                            })}
                        </div>

                        <button
                            onClick={() => navigateDate('next')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setSelectedDate(new Date())}
                            className="ml-2 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Hoje
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            {(['day', 'week', 'month'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === v
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-800'
                                        }`}
                                >
                                    {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="pending">Pendente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {view === 'day' && <DayView appointments={filteredAppointments} />}
                        {view === 'week' && <WeekView appointments={filteredAppointments} selectedDate={selectedDate} />}
                        {view === 'month' && <MonthView appointments={filteredAppointments} selectedDate={selectedDate} />}
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            <div className="bg-white border-t border-slate-200 p-4">
                <div className="flex items-center justify-around max-w-4xl mx-auto">
                    <StatCard label="Total" value={filteredAppointments.length} color="blue" />
                    <StatCard label="Confirmados" value={filteredAppointments.filter(a => a.status === 'confirmed').length} color="green" />
                    <StatCard label="Pendentes" value={filteredAppointments.filter(a => a.status === 'pending').length} color="yellow" />
                    <StatCard label="Concluídos" value={filteredAppointments.filter(a => a.status === 'completed').length} color="blue" />
                </div>
            </div>

            {/* Create Appointment Modal */}
            <CreateAppointmentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchAppointments();
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
}

// Day View Component
function DayView({ appointments }: { appointments: Appointment[] }) {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {hours.map((hour) => {
                const hourAppointments = appointments.filter(apt => {
                    const aptHour = parseInt(apt.scheduledTime.split(':')[0]);
                    return aptHour === hour;
                });

                return (
                    <div key={hour} className="border-b border-slate-100 last:border-0">
                        <div className="flex">
                            <div className="w-20 p-4 bg-slate-50 border-r border-slate-200 text-center">
                                <span className="text-sm font-medium text-slate-600">
                                    {hour}:00
                                </span>
                            </div>
                            <div className="flex-1 p-2 min-h-[80px]">
                                <div className="grid gap-2">
                                    {hourAppointments.map((apt) => (
                                        <AppointmentCard key={apt.id} appointment={apt} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Week View Component
function WeekView({ appointments, selectedDate }: { appointments: Appointment[]; selectedDate: Date }) {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(selectedDate);
        const day = date.getDay();
        date.setDate(date.getDate() - day + i);
        return date;
    });

    return (
        <div className="grid grid-cols-7 gap-4">
            {weekDays.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayAppointments = appointments.filter(apt => apt.scheduledDate === dateStr);

                return (
                    <div key={dateStr} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                            <div className="text-center">
                                <div className="text-xs font-medium text-blue-600 uppercase">
                                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                </div>
                                <div className="text-2xl font-bold text-slate-800">
                                    {date.getDate()}
                                </div>
                            </div>
                        </div>
                        <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                            {dayAppointments.map((apt) => (
                                <AppointmentCard key={apt.id} appointment={apt} compact />
                            ))}
                            {dayAppointments.length === 0 && (
                                <p className="text-center text-sm text-slate-400 py-4">
                                    Sem consultas
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Month View Component  
function MonthView({ appointments, selectedDate }: { appointments: Appointment[]; selectedDate: Date }) {
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 bg-slate-50">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {emptyDays.map((i) => (
                    <div key={`empty-${i}`} className="aspect-square border-r border-b border-slate-100 bg-slate-50" />
                ))}
                {days.map((day) => {
                    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayAppointments = appointments.filter(apt => apt.scheduledDate === dateStr);

                    return (
                        <div
                            key={day}
                            className="aspect-square border-r border-b border-slate-100 p-2 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                            <div className="text-sm font-medium text-slate-700 mb-1">{day}</div>
                            <div className="space-y-1">
                                {dayAppointments.slice(0, 3).map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded truncate"
                                    >
                                        {apt.scheduledTime} - {apt.patient?.name}
                                    </div>
                                ))}
                                {dayAppointments.length > 3 && (
                                    <div className="text-xs text-slate-500 px-2">
                                        +{dayAppointments.length - 3} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Appointment Card Component
function AppointmentCard({ appointment, compact = false }: { appointment: Appointment; compact?: boolean }) {
    const statusColor = {
        pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        confirmed: 'bg-green-100 border-green-300 text-green-800',
        completed: 'bg-blue-100 border-blue-300 text-blue-800',
        cancelled: 'bg-red-100 border-red-300 text-red-800',
        no_show: 'bg-gray-100 border-gray-300 text-gray-800',
    }[appointment.status] || 'bg-gray-100 border-gray-300 text-gray-800';

    if (compact) {
        return (
            <div className={`p-2 rounded-lg border-l-4 ${statusColor} cursor-pointer hover:shadow-md transition-shadow`}>
                <div className="text-xs font-semibold">{appointment.scheduledTime}</div>
                <div className="text-xs truncate">{appointment.patient?.name}</div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-l-4 ${statusColor} cursor-pointer hover:shadow-lg transition-all`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{appointment.scheduledTime}</span>
                    <span className="text-sm">({appointment.duration}min)</span>
                </div>
                <span className="text-2xl">{appointment.appointmentType === 'consulta' ? '🦷' : appointment.appointmentType === 'retorno' ? '🔄' : '⚕️'}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                <span className="font-medium">{appointment.patient?.name}</span>
            </div>
            {appointment.procedure && (
                <div className="text-sm text-slate-600 mb-1">
                    Procedimento: {appointment.procedure.name}
                </div>
            )}
            {appointment.chiefComplaint && (
                <div className="text-sm text-slate-600 italic">
                    "{appointment.chiefComplaint}"
                </div>
            )}
        </motion.div>
    );
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        yellow: 'text-yellow-600 bg-yellow-50',
    };

    return (
        <div className="text-center">
            <div className={`text-3xl font-bold ${colors[color as keyof typeof colors]?.split(' ')[0]}`}>
                {value}
            </div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
        </div>
    );
}
