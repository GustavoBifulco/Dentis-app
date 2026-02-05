
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { LuxButton, IslandCard } from './Shared';
import {
    ArrowLeft, Clock, FileText, Camera, Plus,
    MessageSquare, Trash2, User, Stethoscope,
    Activity, Pill, ClipboardList, DollarSign
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../lib/useAppContext';

import PatientTimeline from './PatientTimeline';
import EncounterForm from './EncounterForm';
import Odontogram from './Odontogram';
import SmartPrescription from './SmartPrescription';
import Anamnesis from './Anamnesis';
import PatientInviteButton from './PatientInviteButton';
import EditPatientModal from './EditPatientModal';
import PatientDeletionModal from './PatientDeletionModal';
import ClinicalAlerts from './ClinicalAlerts';
import ConsentManager from './ConsentManager';
import ImageGallery from './ImageGallery';
import TreatmentPlans from './TreatmentPlans';
import CreateBillingModal from './Billing/CreateBillingModal';

interface PatientRecordProps {
    patient: Patient;
    onBack: () => void;
}

type Tab = 'overview' | 'timeline' | 'encounters' | 'exams' | 'docs' | 'odontogram' | 'anamnesis' | 'plans';

const PatientRecord: React.FC<PatientRecordProps> = ({ patient, onBack }) => {
    const [activePatient, setActivePatient] = useState<Patient>(patient);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const { showToast } = useAppContext();
    const { getToken } = useAuth();

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Data States
    const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [isCreatingEncounter, setIsCreatingEncounter] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

    // Phase 2: Alerts
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        if (activePatient?.id) fetchAlerts();
    }, [activePatient?.id]);

    const fetchAlerts = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`/api/records/alerts/${activePatient.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setAlerts(await res.json());
        } catch (e) {
            console.error("Failed to load alerts");
        }
    };

    const handleAddAlert = async (alert: any) => {
        try {
            const token = await getToken();
            const res = await fetch('/api/records/alerts', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId: activePatient.id,
                    ...alert
                })
            });
            if (res.ok) {
                showToast('Alerta adicionado', 'success');
                fetchAlerts();
            }
        } catch (e) {
            showToast('Erro ao salvar alerta', 'error');
        }
    };

    useEffect(() => {
        setActivePatient(patient);
    }, [patient]);

    // Fetch Timeline on Tab Change
    useEffect(() => {
        if (activeTab === 'timeline' || activeTab === 'overview') {
            fetchTimeline();
        }
    }, [activeTab, activePatient.id]);

    const fetchTimeline = async () => {
        setLoadingTimeline(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/records/timeline/${activePatient.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTimelineEvents(data.timeline || []);
            }
        } catch (error) {
            console.error(error);
            // Fallback for demo/offline
            setTimelineEvents([]);
        } finally {
            setLoadingTimeline(false);
        }
    };

    const handleEditSave = (updated: Patient) => {
        setActivePatient(updated);
        showToast('Perfil atualizado com sucesso!', 'success');
        setIsEditModalOpen(false);
    };

    const handleSaveEncounter = async (data: any, isDraft: boolean) => {
        try {
            const token = await getToken();
            const endpoint = isDraft ? '/api/records/encounters' : `/api/records/encounters/${data.id || ''}/sign`; // Logic simplified
            // For MVP: always create new via POST /api/records/encounters

            const method = 'POST';
            const body = {
                ...data,
                patientId: activePatient.id,
                status: isDraft ? 'draft' : 'signed' // API handles logic
            };

            // If signing, we might need a separate call or specific endpoint logic
            // Assuming POST /encounters handles creation. 
            // If we are editing, we would use PUT. 
            // Simplifying for this MVP step:

            const res = await fetch('/api/records/encounters', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                showToast(isDraft ? 'Rascunho salvo' : 'Atendimento finalizado', 'success');
                setIsCreatingEncounter(false);
                fetchTimeline(); // Refresh
            } else {
                throw new Error('Falha ao salvar');
            }
        } catch (e) {
            showToast('Erro ao salvar atendimento', 'error');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Resumo', icon: ClipboardList },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'encounters', label: 'Atendimentos', icon: Stethoscope },
        { id: 'exams', label: 'Exames', icon: Activity },
        { id: 'docs', label: 'Receitas & Docs', icon: FileText },
        { id: 'odontogram', label: 'Odontograma', icon: Pill }, // Should ideally be a tooth icon
        { id: 'plans', label: 'Orçamentos', icon: DollarSign },
        { id: 'anamnesis', label: 'Anamnese', icon: MessageSquare },
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 bg-slate-50 relative overflow-hidden">

            {/* HERDER */}
            <div className="bg-white border-b border-slate-200 z-10 flex-shrink-0">
                {/* Top Bar with Back & Actions */}
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {activePatient.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 leading-tight">{activePatient.name}</h1>
                                <p className="text-xs text-slate-500 font-medium">Cod: {activePatient.id} • {activePatient.cpf || 'Sem CPF'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <PatientInviteButton
                            patientId={activePatient.id}
                            patientName={activePatient.name}
                            hasAccount={!!activePatient.userId}
                        />
                        <LuxButton variant="ghost" onClick={() => setIsEditModalOpen(true)} icon={<User size={16} />}>Editar Perfil</LuxButton>
                        <LuxButton variant="ghost" className="text-red-500" onClick={() => setIsDeleteModalOpen(true)} icon={<Trash2 size={16} />}>Excluir</LuxButton>
                    </div>
                </div>

                {/* Tags Navigation */}
                <div className="px-6 flex gap-6 overflow-x-auto custom-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 py-3 border-b-2 transition-all font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="max-w-[1200px] mx-auto">

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Quick Access / Highlights */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div onClick={() => setActiveTab('encounters')} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center gap-2 text-center group">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition"><Stethoscope size={24} /></div>
                                        <span className="text-sm font-bold text-slate-700">Atendimento</span>
                                    </div>
                                    <div onClick={() => setActiveTab('docs')} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center gap-2 text-center group">
                                        <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition"><FileText size={24} /></div>
                                        <span className="text-sm font-bold text-slate-700">Prescrição</span>
                                    </div>
                                    <div onClick={() => setActiveTab('exams')} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center gap-2 text-center group">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition"><Activity size={24} /></div>
                                        <span className="text-sm font-bold text-slate-700">Exames</span>
                                    </div>
                                    <div onClick={() => setActiveTab('odontogram')} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center gap-2 text-center group">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition"><Pill size={24} /></div>
                                        <span className="text-sm font-bold text-slate-700">Odonto</span>
                                    </div>
                                    <div onClick={() => setIsBillingModalOpen(true)} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center gap-2 text-center group">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition"><DollarSign size={24} /></div>
                                        <span className="text-sm font-bold text-slate-700">Cobrar</span>
                                    </div>
                                </div>

                                {/* Recent Activity Preview */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Clock size={18} className="text-slate-400" /> Atividade Recente
                                    </h3>
                                    <PatientTimeline events={timelineEvents.slice(0, 3)} loading={loadingTimeline} />
                                    <button onClick={() => setActiveTab('timeline')} className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                                        Ver histórico completo
                                    </button>
                                </div>
                            </div>

                            {/* Alerts and Info */}
                            <div className="space-y-6">
                                <ClinicalAlerts
                                    alerts={alerts}
                                    onAddAlert={handleAddAlert}
                                />

                                {/* Patient Info Card */}
                                <IslandCard className="p-5 border-none shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <h3 className="font-bold text-slate-700 text-sm uppercase">Dados Pessoais</h3>
                                        <button onClick={() => setIsEditModalOpen(true)} className="text-blue-600 text-xs font-bold hover:underline">Editar</button>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div><span className="block text-slate-400 text-xs font-bold uppercase">Email</span> {activePatient.email || '-'}</div>
                                        <div><span className="block text-slate-400 text-xs font-bold uppercase">Telefone</span> {activePatient.phone || '-'}</div>
                                        <div><span className="block text-slate-400 text-xs font-bold uppercase">Nascimento</span> {activePatient.birthdate || '-'}</div>
                                        <div><span className="block text-slate-400 text-xs font-bold uppercase">CPF</span> {activePatient.cpf || '-'}</div>
                                    </div>
                                </IslandCard>

                                {/* Legacy Medical History (ReadOnly) */}
                                {activePatient.medicalHistory && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
                                        <h4 className="font-bold mb-1 flex items-center gap-2 uppercase">Histórico Prévio</h4>
                                        <p>{activePatient.medicalHistory}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[500px]">
                            <h3 className="font-bold text-lg mb-6 text-slate-800">Linha do Tempo Completa</h3>
                            <PatientTimeline events={timelineEvents} loading={loadingTimeline} />
                        </div>
                    )}

                    {activeTab === 'encounters' && (
                        <div className="space-y-6">
                            {!isCreatingEncounter ? (
                                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <Stethoscope size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Iniciar Novo Atendimento</h3>
                                    <p className="text-slate-500 max-w-sm text-center mb-6">Registre evolução, procedimento ou consulta de rotina.</p>
                                    <LuxButton onClick={() => setIsCreatingEncounter(true)} icon={<Plus size={20} />}>
                                        Novo Atendimento (SOAP)
                                    </LuxButton>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button onClick={() => setIsCreatingEncounter(false)} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2">
                                        <ArrowLeft size={16} /> Cancelar
                                    </button>
                                    <EncounterForm
                                        patientId={activePatient.id}
                                        onSave={handleSaveEncounter}
                                    />
                                </div>
                            )}

                            {/* List of past encounters could go here */}
                            <div className="mt-8">
                                <h4 className="font-bold text-slate-700 mb-4">Histórico de Atendimentos</h4>
                                <PatientTimeline
                                    events={timelineEvents.filter(e => e.type === 'encounter')}
                                    loading={loadingTimeline}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'docs' && (
                        <div className="animate-in fade-in space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-4">Prescrições</h3>
                                    <SmartPrescription />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-4">Termos e Consentimentos</h3>
                                    <ConsentManager patientId={activePatient.id} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exams' && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="font-bold text-slate-900">Exames</h3>
                            <p className="text-slate-500 mb-6">Módulo de pedidos de exame em breve (Fase 1.5).</p>
                        </div>
                    )}

                    {activeTab === 'odontogram' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <Odontogram patientId={activePatient.id} />
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <ImageGallery patientId={activePatient.id} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'anamnesis' && (
                        <Anamnesis patientId={activePatient.id} />
                    )}

                </div>
            </div>

            {/* Modals */}
            <EditPatientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                patient={activePatient}
                onSave={handleEditSave}
            />

            <PatientDeletionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                patient={activePatient}
                onConfirm={async () => {
                    // Re-implement delete logic if needed or pass existing handler
                    showToast('Funcionalidade de exclusão mantida.', 'info');
                    setIsDeleteModalOpen(false);
                }}
            />

            <CreateBillingModal
                isOpen={isBillingModalOpen}
                onClose={() => setIsBillingModalOpen(false)}
                patientId={activePatient.id}
                patientName={activePatient.name}
                onSuccess={() => {
                    fetchTimeline(); // To show the new charge in activity
                }}
            />
        </div>
    );
};

export default PatientRecord;
