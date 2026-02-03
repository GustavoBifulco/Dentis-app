
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
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 overflow-hidden relative bg-slate-50">

            {/* HEADER TIPO PERFIL SOCIAL */}
            <div className="relative flex-shrink-0">
                {/* Cover Image */}
                <div className="h-48 w-full bg-slate-900 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1400&q=80" className="w-full h-full object-cover opacity-10" alt="Cover" />
                    <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-md z-10 border border-white/10">
                        <ArrowLeft size={18} strokeWidth={3} />
                    </button>
                    <div className="absolute top-6 right-6 flex gap-2">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl backdrop-blur-md text-sm font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95">
                            <Share2 size={16} strokeWidth={2.5} /> Convidar Paciente
                        </button>
                    </div>
                </div>

                {/* Profile Info Bar */}
                <div className="px-8 pb-1 relative bg-white border-b border-slate-200 shadow-sm z-10">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6 -mt-16 mb-6">
                        <div className="w-40 h-40 rounded-3xl border-[6px] border-white shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                            <img src={`https://ui-avatars.com/api/?name=${patient.name}&background=6366f1&color=fff&size=256`} alt={patient.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">Paciente VIP</span>
                            </div>
                            <p className="text-slate-500 font-bold mt-1 tracking-tight">{patient.email} <span className="mx-2 text-slate-300">•</span> {patient.phone}</p>
                        </div>
                        <div className="flex gap-3 mb-2">
                            {saveSuccess && (
                                <LuxButton variant="outline" onClick={onBack} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl">
                                    Voltar à Lista
                                </LuxButton>
                            )}
                            <LuxButton variant="outline" icon={<MessageSquare size={18} />} className="rounded-2xl border-slate-200 text-slate-600">Chat</LuxButton>
                            <LuxButton onClick={handleSave} icon={<Plus size={18} />} className="rounded-2xl">
                                {saveSuccess ? 'Salvo' : 'Atualizar Prontuário'}
                            </LuxButton>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-8 overflow-x-auto custom-scrollbar">
                        {[
                            { id: 'timeline', label: 'Histórico', icon: Clock },
                            { id: 'odontogram', label: 'Odontograma', icon: Smile },
                            { id: 'docs', label: 'Documentos', icon: FileText },
                            { id: 'photos', label: 'Galeria', icon: Camera },
                            { id: 'anamnesis', label: 'Anamnese', icon: FileText },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-2 pb-4 px-1 border-b-4 transition-all font-bold text-sm whitespace-nowrap tracking-tight ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                                    }`}
                            >
                                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
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
                        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 text-red-600 mb-4">
                                <AlertTriangle size={20} strokeWidth={2.5} />
                                <span className="font-black text-xs uppercase tracking-widest">Alertas Médicos</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="px-3 py-1.5 bg-white border border-red-100 rounded-xl text-xs font-bold text-red-700 shadow-sm">Alergia: Penicilina</span>
                                <span className="px-3 py-1.5 bg-white border border-red-100 rounded-xl text-xs font-bold text-red-700 shadow-sm">Hipertenso</span>
                            </div>
                        </div>

                        {/* Info Rápida */}
                        <IslandCard className="p-6 space-y-5 border-none shadow-xl shadow-slate-200/50">
                            <h3 className="font-black text-slate-900 border-b border-slate-100 pb-3 text-sm uppercase tracking-widest">Informações</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Última Visita</p>
                                    <p className="font-bold text-slate-800 tracking-tight">10 de Maio, 2024</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Status da Conta</p>
                                    <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">Ativo</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Plano / Convênio</p>
                                    <p className="font-bold text-slate-800 tracking-tight">Particular (Prime)</p>
                                </div>
                            </div>
                        </IslandCard>

                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-9 pb-20">
                        {activeTab === 'timeline' && (
                            <div className="space-y-6 animate-in fade-in">
                                {/* Timeline Item */}
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-6 relative">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-200 border border-slate-100 flex items-center justify-center text-blue-600 z-10 group-hover:scale-110 transition-transform">
                                                <Clock size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="w-1 bg-slate-200/50 flex-1 my-2 rounded-full"></div>
                                        </div>
                                        <IslandCard className="flex-1 p-8 mb-6 border-none shadow-xl shadow-slate-200/30 group hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-black text-xl text-slate-900 tracking-tight">Consulta de Manutenção</h4>
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">10 Mai, 14:00</span>
                                            </div>
                                            <p className="text-slate-600 text-base leading-relaxed mb-6 font-medium">
                                                Paciente relatou sensibilidade no elemento 21. Realizada aplicação de flúor e ajuste na oclusão.
                                            </p>
                                            <div className="flex gap-2">
                                                <span className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Dr. Ricardo</span>
                                                <span className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600">Procedimento Especial</span>
                                            </div>
                                        </IslandCard>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'odontogram' && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden h-full min-h-[600px] animate-in zoom-in-95 duration-300">
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
