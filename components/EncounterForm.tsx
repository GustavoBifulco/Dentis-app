
import React, { useState, useEffect } from 'react';
import { Save, Lock, AlertCircle } from 'lucide-react';

interface EncounterFormProps {
    patientId: number;
    initialData?: any;
    onSave: (data: any, isDraft: boolean) => Promise<void>;
    readOnly?: boolean;
}

const EncounterForm: React.FC<EncounterFormProps> = ({ patientId, initialData, onSave, readOnly = false }) => {
    const [formData, setFormData] = useState({
        type: 'consulta',
        subjective: '', // S
        objective: '',  // O
        assessment: '', // A
        plan: ''        // P
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                type: initialData.type || 'consulta',
                subjective: initialData.subjective || '',
                objective: initialData.objective || '',
                assessment: initialData.assessment || '',
                plan: initialData.plan || ''
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (isDraft: boolean) => {
        setLoading(true);
        try {
            await onSave(formData, isDraft);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">Registro Clínico (SOAP)</span>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        disabled={readOnly}
                        className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="consulta">Consulta</option>
                        <option value="retorno">Retorno</option>
                        <option value="urgencia">Urgência</option>
                        <option value="cirurgia">Cirurgia</option>
                    </select>
                </div>
                {readOnly && (
                    <div className="flex items-center gap-2 text-green-700 px-3 py-1 bg-green-100 rounded-full text-xs font-bold">
                        <Lock size={12} /> Assinado
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Subjective */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subjectivo (Queixa / História)</label>
                    <textarea
                        name="subjective"
                        value={formData.subjective}
                        onChange={handleChange}
                        disabled={readOnly}
                        rows={3}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        placeholder="Paciente relata..."
                    />
                </div>

                {/* Objective */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Objetivo (Exame Clínico)</label>
                    <textarea
                        name="objective"
                        value={formData.objective}
                        onChange={handleChange}
                        disabled={readOnly}
                        rows={3}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        placeholder="Ao exame físico extra-oral..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assessment */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avaliação (Diagnóstico)</label>
                        <textarea
                            name="assessment"
                            value={formData.assessment}
                            onChange={handleChange}
                            disabled={readOnly}
                            rows={4}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Hipótese diagnóstica..."
                        />
                    </div>

                    {/* Plan */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plano (Conduta)</label>
                        <textarea
                            name="plan"
                            value={formData.plan}
                            onChange={handleChange}
                            disabled={readOnly}
                            rows={4}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Solicitado exames, prescrito..."
                        />
                    </div>
                </div>
            </div>

            {!readOnly && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> Salvar Rascunho
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Tem certeza? Após assinar, não será possível editar.')) {
                                handleSubmit(false);
                            }
                        }}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
                    >
                        <Lock size={16} /> Assinar e Finalizar
                    </button>
                </div>
            )}
        </div>
    );
};

export default EncounterForm;
