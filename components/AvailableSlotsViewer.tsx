
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Services } from '../lib/services';

interface Slot {
    time: string;
    available: boolean;
}

interface AvailableSlotsViewerProps {
    dentistId?: string;
    onSelectSlot: (date: string, time: string) => void;
}

export default function AvailableSlotsViewer({ dentistId, onSelectSlot }: AvailableSlotsViewerProps) {
    const { getToken } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSlots = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) return;

                const response = await Services.appointments.getAvailability(token, selectedDate);

                if (response.slots) {
                    setSlots(response.slots);
                } else {
                    setSlots([]);
                }
            } catch (err) {
                console.error('Error fetching slots:', err);
                setSlots([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [selectedDate, dentistId, getToken]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Horários Disponíveis
            </h3>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 mb-2">Escolha a data</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]} // Não permite passado
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot, index) => (
                        <button
                            key={index}
                            disabled={!slot.available}
                            onClick={() => slot.available && onSelectSlot(selectedDate, slot.time)}
                            className={`
                                py-2 px-1 rounded-lg text-sm font-medium transition-all
                                ${slot.available
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:scale-105'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                            `}
                        >
                            {slot.time}
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 justify-center">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-100 border border-blue-500"></div>
                    <span>Livre</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-100 border border-slate-300"></div>
                    <span>Ocupado</span>
                </div>
            </div>
        </div>
    );
}
