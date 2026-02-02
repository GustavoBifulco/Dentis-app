
import React, { useState } from 'react';
import { Patient } from '../types';
import { SectionHeader, LuxButton, IslandCard } from './Shared';
import { ArrowLeft, Smile, FileText, Clock, Camera, Mail, Plus, MessageSquare, AlertTriangle, Send, Share2 } from 'lucide-react';
import Odontogram from './Odontogram';
import SmartPrescription from './SmartPrescription';
import Anamnesis from './Anamnesis';
import { useAppContext } from '../lib/useAppContext';

interface PatientRecordProps {
    patient: Patient;
    onBack: () => void;
}

type Tab = 'timeline' | 'odontogram' | 'docs' | 'photos' | 'anamnesis';

const PatientRecord: React.FC<PatientRecordProps> = ({ patient, onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('timeline');
    const { showToast } = useAppContext();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = () => {
        // Simulação de salvamento
        showToast('Prontuário atualizado com sucesso!', 'success');
        setSaveSuccess(true);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 overflow-hidden relative bg-lux-background">

            {/* HEADER TIPO PERFIL SOCIAL */}
            <div className="relative flex-shrink-0">
                {/* Cover Image */}
                <div className="h-48 w-full bg-gradient-to-r from-slate-800 to-indigo-900 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1400&q=80" className="w-full h-full object-cover opacity-30" alt="Cover" />
                    <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition backdrop-blur-sm z-10">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="absolute top-6 right-6 flex gap-2">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-xs font-bold flex items-center gap-2">
                            <Share2 size={14} /> Convidar para App
                        </button>
                    </div>
                </div>

                {/* Profile Info Bar */}
                <div className="px-8 pb-4 relative bg-lux-surface border-b border-lux-border shadow-sm z-10">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12 mb-4">
                        <div className="w-32 h-32 rounded-full border-[6px] border-lux-surface shadow-xl overflow-hidden bg-white">
                            <img src={`https://ui-avatars.com/api/?name=${patient.name}&background=random&size=256`} alt={patient.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-black text-lux-text">{patient.name}</h1>
                            <p className="text-lux-text-secondary font-medium">{patient.email} • {patient.phone}</p>
                        </div>
                        <div className="flex gap-3 mb-2">
                            {saveSuccess && (
                                <LuxButton variant="outline" onClick={onBack} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                    Voltar para Lista
                                </LuxButton>
                            )}
                            <LuxButton variant="outline" icon={<Mail size={16} />}>Enviar Mensagem</LuxButton>
                            <LuxButton onClick={handleSave} icon={<Plus size={16} />}>
                                {saveSuccess ? 'Salvo' : 'Salvar Alterações'}
                            </LuxButton>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 overflow-x-auto">
                        {[
                            { id: 'timeline', label: 'Histórico', icon: Clock },
                            { id: 'odontogram', label: 'Odontograma', icon: Smile },
                            { id: 'docs', label: 'Receituário & Atestados', icon: FileText },
                            { id: 'photos', label: 'Galeria', icon: Camera },
                            { id: 'anamnesis', label: 'Anamnese', icon: FileText },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all font-bold text-sm whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-lux-accent text-lux-accent'
                                        : 'border-transparent text-lux-text-secondary hover:text-lux-text hover:border-lux-border'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* BODY CONTENT */}
            <div className="flex-1 overflow-y-auto bg-lux-background p-6">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT SIDEBAR (Sticky Info) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Alertas */}
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-rose-600 mb-2">
                                <AlertTriangle size={18} />
                                <span className="font-black text-xs uppercase tracking-widest">Alertas Médicos</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-white border border-rose-200 rounded text-xs font-bold text-rose-700">Alergia: Penicilina</span>
                                <span className="px-2 py-1 bg-white border border-rose-200 rounded text-xs font-bold text-rose-700">Hipertenso</span>
                            </div>
                        </div>

                        {/* Info Rápida */}
                        <IslandCard className="p-6 space-y-4">
                            <h3 className="font-bold text-lux-text border-b border-lux-border pb-2">Detalhes</h3>
                            <div className="text-sm">
                                <p className="text-lux-text-secondary text-xs uppercase font-bold mb-1">Última Visita</p>
                                <p className="font-medium text-lux-text">10/05/2024</p>
                            </div>
                            <div className="text-sm">
                                <p className="text-lux-text-secondary text-xs uppercase font-bold mb-1">Status</p>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold uppercase">Ativo</span>
                            </div>
                            <div className="text-sm">
                                <p className="text-lux-text-secondary text-xs uppercase font-bold mb-1">Convênio</p>
                                <p className="font-medium text-lux-text">Particular</p>
                            </div>
                        </IslandCard>

                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-9 pb-20">
                        {activeTab === 'timeline' && (
                            <div className="space-y-6 animate-in fade-in">
                                {/* Timeline Item Mock */}
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-full bg-lux-subtle flex items-center justify-center text-lux-text shadow-sm border border-lux-border">
                                                <Clock size={16} />
                                            </div>
                                            <div className="w-0.5 bg-lux-border h-full my-2"></div>
                                        </div>
                                        <IslandCard className="flex-1 p-6 mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg text-lux-text">Consulta de Manutenção</h4>
                                                <span className="text-xs text-lux-text-secondary font-medium">10 Mai, 14:00</span>
                                            </div>
                                            <p className="text-lux-text-secondary text-sm mb-4">
                                                Paciente relatou sensibilidade no elemento 21. Realizada aplicação de flúor e ajuste na oclusão.
                                            </p>
                                            <div className="flex gap-2">
                                                <span className="bg-lux-subtle px-2 py-1 rounded text-[10px] font-bold uppercase text-lux-text-secondary">Dr. Ricardo</span>
                                                <span className="bg-lux-subtle px-2 py-1 rounded text-[10px] font-bold uppercase text-lux-text-secondary">Procedimento</span>
                                            </div>
                                        </IslandCard>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'odontogram' && (
                            <div className="bg-white rounded-[2rem] border border-lux-border overflow-hidden h-full min-h-[600px] animate-in zoom-in-95 duration-300">
                                <Odontogram />
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="space-y-6 animate-in fade-in">
                                <SmartPrescription />
                            </div>
                        )}

                        {activeTab === 'anamnesis' && (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="flex justify-end gap-2 mb-4">
                                    <LuxButton variant="outline" icon={<Send size={16} />}>Enviar para Paciente</LuxButton>
                                    <LuxButton icon={<Plus size={16} />}>Preencher Agora</LuxButton>
                                </div>
                                <Anamnesis />
                            </div>
                        )}

                        {activeTab === 'photos' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square bg-lux-subtle rounded-2xl flex items-center justify-center text-lux-text-secondary hover:bg-lux-border transition cursor-pointer">
                                        <Camera size={24} className="opacity-50" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
};

export default PatientRecord;
