import React, { useState, useEffect } from 'react';
import { SectionHeader, LuxButton, IslandCard, LoadingState } from './Shared';
import { CheckCircle2, FileText, ArrowRight, Save } from 'lucide-react';
import { useAppContext } from '../lib/useAppContext';
import { useI18n } from '../lib/i18n';

interface Question {
    id: number;
    section: string;
    text: string;
    type: string;
    options: string[] | null;
    required: boolean;
}

interface AnamnesisProps {
    patientId: number;
}

import { useAuth } from '@clerk/clerk-react';

const Anamnesis: React.FC<AnamnesisProps> = ({ patientId }) => {
    const { getToken } = useAuth();
    const { showToast } = useAppContext();
    const { t } = useI18n();
    const [template, setTemplate] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [patientId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            // 1. Load Template
            const tplRes = await fetch('/api/anamnesis/template', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tplData = await tplRes.json();
            setTemplate(tplData.template);
            setQuestions(tplData.questions);

            // 2. Load Existing Responses
            const respRes = await fetch(`/api/anamnesis/responses/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (respRes.ok) {
                const respData = await respRes.json();
                if (respData && respData.answers) {
                    setAnswers(respData.answers);
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t('anamnesis.loadError'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: number, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = await getToken();
            const res = await fetch('/api/anamnesis/responses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId,
                    templateId: template.id,
                    answers
                })
            });

            if (res.ok) {
                showToast(t('anamnesis.saveSuccess'), 'success');
            } else {
                showToast(t('anamnesis.saveError'), 'error');
            }
        } catch (error) {
            console.error(error);
            showToast(t('anamnesis.saveError'), 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingState />;

    // Group questions by section
    const sections: Record<string, Question[]> = {};
    questions.forEach(q => {
        if (!sections[q.section]) sections[q.section] = [];
        sections[q.section].push(q);
    });

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <SectionHeader
                title={template?.title || 'Ficha de Anamnese'}
                subtitle={template?.description || 'Preencha este formulário para que possamos conhecer melhor seu histórico de saúde.'}
            />

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={20} />
                <p className="text-sm text-emerald-800 font-medium">As respostas são salvas automaticamente no prontuário do paciente.</p>
            </div>

            <div className="space-y-8">
                {Object.entries(sections).map(([sectionName, sectionQuestions], idx) => (
                    <IslandCard key={sectionName} className="p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-lux-border pb-4">
                            <div className="w-8 h-8 rounded-full bg-lux-subtle flex items-center justify-center text-lux-text font-bold">{idx + 1}</div>
                            <h3 className="font-bold text-lux-text text-lg">{sectionName}</h3>
                        </div>

                        <div className="space-y-6">
                            {sectionQuestions.map(q => (
                                <div key={q.id} className="space-y-2">
                                    <label className="text-sm font-bold text-lux-text">
                                        {q.text} {q.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {/* Component Renderer Based on Type */}
                                    {q.type === 'text' && (
                                        <input
                                            type="text"
                                            className="apple-input w-full p-3 text-sm"
                                            value={answers[q.id] || ''}
                                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                                        />
                                    )}

                                    {q.type === 'long_text' && (
                                        <textarea
                                            className="apple-input w-full p-3 text-sm h-24 resize-none"
                                            value={answers[q.id] || ''}
                                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                                        />
                                    )}

                                    {q.type === 'yes_no' && (
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`q_${q.id}`}
                                                    className="accent-lux-accent w-4 h-4"
                                                    checked={answers[q.id] === 'Sim'}
                                                    onChange={() => handleAnswerChange(q.id, 'Sim')}
                                                />
                                                <span className="text-lux-text-secondary">Sim</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`q_${q.id}`}
                                                    className="accent-lux-accent w-4 h-4"
                                                    checked={answers[q.id] === 'Não'}
                                                    onChange={() => handleAnswerChange(q.id, 'Não')}
                                                />
                                                <span className="text-lux-text-secondary">Não</span>
                                            </label>
                                        </div>
                                    )}

                                    {q.type === 'checkbox' && q.options && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {typeof q.options === 'string' ? JSON.parse(q.options).map((opt: string) => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer border border-lux-border p-3 rounded-lg hover:bg-lux-subtle transition">
                                                    <input
                                                        type="checkbox"
                                                        className="accent-lux-accent w-4 h-4"
                                                        checked={(answers[q.id] || []).includes(opt)}
                                                        onChange={(e) => {
                                                            const current = answers[q.id] || [];
                                                            if (e.target.checked) handleAnswerChange(q.id, [...current, opt]);
                                                            else handleAnswerChange(q.id, current.filter((x: string) => x !== opt));
                                                        }}
                                                    />
                                                    <span className="text-sm text-lux-text">{opt}</span>
                                                </label>
                                            )) : (Array.isArray(q.options) ? q.options : []).map((opt: string) => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer border border-lux-border p-3 rounded-lg hover:bg-lux-subtle transition">
                                                    <input
                                                        type="checkbox"
                                                        className="accent-lux-accent w-4 h-4"
                                                        checked={(answers[q.id] || []).includes(opt)}
                                                        onChange={(e) => {
                                                            const current = answers[q.id] || [];
                                                            if (e.target.checked) handleAnswerChange(q.id, [...current, opt]);
                                                            else handleAnswerChange(q.id, current.filter((x: string) => x !== opt));
                                                        }}
                                                    />
                                                    <span className="text-sm text-lux-text">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </IslandCard>
                ))}
            </div>

            <div className="flex justify-end pt-4 pb-20">
                <LuxButton onClick={handleSave} disabled={saving} icon={<Save size={18} />}>
                    {saving ? 'Salvando...' : 'Salvar Anamnese'}
                </LuxButton>
            </div>
        </div>
    );
};

export default Anamnesis;