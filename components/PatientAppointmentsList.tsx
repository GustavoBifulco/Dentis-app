
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface AppointmentType {
    id: number;
    scheduledDate: string;
    scheduledTime: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    dentistName: string;
    notes?: string;
}

export default function PatientAppointmentsList() {
    const { getToken } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = await getToken();
                const res = await fetch('/api/appointments/my-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data);
                }
            } catch (error) {
                console.error("Erro ao buscar consultas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [getToken]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Confirmado</span>;
            case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12} /> Aguardando</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Cancelado</span>;
            case 'completed': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Concluído</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{status}</span>;
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500">Carregando suas consultas...</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                Minhas Consultas
            </h2>

            {appointments.length === 0 ? (
                <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200">
                    <p className="text-slate-500 mb-2">Você ainda não tem consultas agendadas.</p>
                    <button className="text-blue-600 font-bold text-sm hover:underline">
                        Agendar agora
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {appointments.map(apt => (
                        <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-800">{apt.dentistName || 'Dr. Dentista'}</h3>
                                    <p className="text-xs text-slate-500">Clínica Geral</p>
                                </div>
                                {getStatusBadge(apt.status)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-600 my-3">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-blue-500" />
                                    {new Date(apt.scheduledDate).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-blue-500" />
                                    {apt.scheduledTime.substring(0, 5)}
                                </div>
                            </div>

                            {apt.status === 'pending' && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                                    <button className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                                        Confirmar
                                    </button>
                                    <button className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
