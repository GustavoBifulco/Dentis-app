import { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, FileText, AlertCircle, Check, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Patient {
    id: number;
    name: string;
    phone?: string;
    email?: string;
}

interface Procedure {
    id: number;
    name: string;
    duration?: number;
    price?: string;
}

interface CreateAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: string;
    initialTime?: string;
}

export default function CreateAppointmentModal({
    isOpen,
    onClose,
    onSuccess,
    initialDate,
    initialTime,
}: CreateAppointmentModalProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        patient_id: '',
        scheduled_date: initialDate || '',
        scheduled_time: initialTime || '',
        duration: 60,
        appointment_type: 'consulta',
        procedure_id: '',
        notes: '',
        chief_complaint: '',
        is_followup: false,
        notify_patient: true,
        confirmation_required: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            fetchPatients();
            fetchProcedures();
        }
    }, [isOpen]);

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/patients', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchProcedures = async () => {
        try {
            const response = await fetch('/api/procedures', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setProcedures(data);
            }
        } catch (error) {
            console.error('Error fetching procedures:', error);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.patient_id) newErrors.patient_id = 'Selecione um paciente';
        if (!formData.scheduled_date) newErrors.scheduled_date = 'Selecione uma data';
        if (!formData.scheduled_time) newErrors.scheduled_time = 'Selecione um horário';
        if (formData.duration < 15) newErrors.duration = 'Duração mínima: 15 minutos';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ...formData,
                    patient_id: parseInt(formData.patient_id),
                    procedure_id: formData.procedure_id ? parseInt(formData.procedure_id) : null,
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
                resetForm();
            } else {
                const error = await response.json();
                setErrors({ submit: error.error || 'Erro ao criar agendamento' });
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            setErrors({ submit: 'Erro ao criar agendamento' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            patient_id: '',
            scheduled_date: '',
            scheduled_time: '',
            duration: 60,
            appointment_type: 'consulta',
            procedure_id: '',
            notes: '',
            chief_complaint: '',
            is_followup: false,
            notify_patient: true,
            confirmation_required: true,
        });
        setErrors({});
        setSearchTerm('');
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-6 h-6" />
                                <h2 className="text-2xl font-bold">Nova Consulta</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        <div className="space-y-6">
                            {/* Patient Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <User className="w-4 h-4" />
                                    Paciente *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                />
                                <select
                                    value={formData.patient_id}
                                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.patient_id ? 'border-red-500' : 'border-slate-300'
                                        }`}
                                >
                                    <option value="">Selecione um paciente</option>
                                    {filteredPatients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} {patient.phone && `- ${patient.phone}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.patient_id && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.patient_id}
                                    </p>
                                )}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        Data *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.scheduled_date}
                                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.scheduled_date ? 'border-red-500' : 'border-slate-300'
                                            }`}
                                    />
                                    {errors.scheduled_date && (
                                        <p className="text-red-500 text-sm mt-1">{errors.scheduled_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <Clock className="w-4 h-4" />
                                        Horário *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.scheduled_time}
                                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.scheduled_time ? 'border-red-500' : 'border-slate-300'
                                            }`}
                                    />
                                    {errors.scheduled_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.scheduled_time}</p>
                                    )}
                                </div>
                            </div>

                            {/* Duration and Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Duração (minutos) *
                                    </label>
                                    <input
                                        type="number"
                                        min="15"
                                        step="15"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Tipo de Consulta
                                    </label>
                                    <select
                                        value={formData.appointment_type}
                                        onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="consulta">Consulta</option>
                                        <option value="retorno">Retorno</option>
                                        <option value="urgência">Urgência</option>
                                        <option value="procedimento">Procedimento</option>
                                    </select>
                                </div>
                            </div>

                            {/* Procedure */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Procedimento (opcional)
                                </label>
                                <select
                                    value={formData.procedure_id}
                                    onChange={(e) => setFormData({ ...formData, procedure_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Nenhum procedimento selecionado</option>
                                    {procedures.map((procedure) => (
                                        <option key={procedure.id} value={procedure.id}>
                                            {procedure.name} {procedure.price && `- R$ ${procedure.price}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Chief Complaint */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <FileText className="w-4 h-4" />
                                    Queixa Principal
                                </label>
                                <textarea
                                    value={formData.chief_complaint}
                                    onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                                    placeholder="Descreva a queixa do paciente..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Observações
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Observações adicionais..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_followup}
                                        onChange={(e) => setFormData({ ...formData, is_followup: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">
                                        Marcar como retorno
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.notify_patient}
                                        onChange={(e) => setFormData({ ...formData, notify_patient: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-slate-600" />
                                        <span className="text-sm font-medium text-slate-700">
                                            Notificar paciente
                                        </span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.confirmation_required}
                                        onChange={(e) => setFormData({ ...formData, confirmation_required: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-slate-600" />
                                        <span className="text-sm font-medium text-slate-700">
                                            Requerer confirmação do paciente
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        {errors.submit}
                                    </p>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="border-t border-slate-200 p-6 bg-slate-50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Criar Consulta
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
