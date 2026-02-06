
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { useUser } from '@clerk/clerk-react';
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
import PatientHeader from './screens/PatientHeader';
import SmartCards from './screens/SmartCards';

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

    // Overview data from new endpoint
    const [overviewData, setOverviewData] = useState<any>(null);
    const [loadingOverview, setLoadingOverview] = useState(false);

    // Dynamic role detection: if logged-in user is the patient, show patient view
    const { user: clerkUser } = useUser();
    const viewType: 'dentist' | 'patient' =
        (clerkUser?.id && activePatient.userId && clerkUser.id === activePatient.userId)
            ? 'patient'
            : 'dentist';

    useEffect(() => {
        if (activePatient?.id) {
            fetchOverview();
            fetchAlerts();
        }
    }, [activePatient?.id]);

    const fetchOverview = async () => {
        setLoadingOverview(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/patients/${activePatient.id}/overview?view=${viewType}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOverviewData(data.data);
            }
        } catch (e) {
            console.error("Failed to load overview");
        } finally {
            setLoadingOverview(false);
        }
    };

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

    const handleHeaderAction = (action: string) => {
        switch (action) {
            case 'new-record':
                setActiveTab('encounters');
                setIsCreatingEncounter(true);
                break;
            case 'new-appointment':
                // TODO: Open appointment modal
                showToast('Funcionalidade em desenvolvimento', 'info');
                break;
            case 'upload-document':
                // TODO: Open upload modal
                showToast('Funcionalidade em desenvolvimento', 'info');
                break;
            case 'create-charge':
                setIsBillingModalOpen(true);
                break;
            case 'invite-patient':
                // Handled by PatientInviteButton
                break;
            case 'my-documents':
                setActiveTab('docs');
                break;
            case 'my-payments':
                // TODO: Navigate to patient wallet
                showToast('Funcionalidade em desenvolvimento', 'info');
                break;
            case 'consents':
                setActiveTab('docs');
                break;
            case 'contact-clinic':
                // TODO: Open chat/contact modal
                showToast('Funcionalidade em desenvolvimento', 'info');
                break;
            case 'edit-profile':
                setIsEditModalOpen(true);
                break;
        }
    };

    const handleEditEvent = (event: any) => {
        showToast('Edição de evento em desenvolvimento', 'info');
        // TODO: Open edit modal based on event type
    };

    const handleAddNote = (event: any) => {
        showToast('Adicionar nota em desenvolvimento', 'info');
        // TODO: Open note modal
    };

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--background))] animate-fade-in relative overflow-hidden">

            {/* Back Button - Compact */}
            <div className="bg-white border-b border-[hsl(var(--border))]">
                <button
                    onClick={onBack}
                    className="p-3 hover:bg-slate-50 text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Voltar para Lista
                </button>
            </div>

            {/* NEW HEADER */}
            <PatientHeader
                patient={{
                    id: activePatient.id,
                    name: activePatient.name,
                    email: activePatient.email,
                    phone: activePatient.phone,
                    cpf: activePatient.cpf,
                    birthdate: activePatient.birthdate,
                    gender: activePatient.gender,
                    status: activePatient.status,
                    avatarUrl: overviewData?.patient?.avatarUrl || null,
                    hasAccount: !!activePatient.userId
                }}
                viewType={viewType}
                onAction={handleHeaderAction}
            />

            {/* Tab Navigation */}
            <div className="px-6 flex gap-6 overflow-x-auto custom-scrollbar bg-white" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className="flex items-center gap-2 py-3 border-b-2 transition-all font-medium text-sm whitespace-nowrap"
                        style={{
                            borderColor: activeTab === tab.id ? 'hsl(var(--primary))' : 'transparent',
                            color: activeTab === tab.id ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
                        }}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT AREA - NEW TWO-COLUMN LAYOUT */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
                <div className="max-w-[1400px] mx-auto">

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT COLUMN: Timeline/Feed (60%) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Timeline */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid hsl(var(--border))' }}>
                                    <h3 className="font-bold text-lg mb-6" style={{ color: 'hsl(var(--text-main))' }}>
                                        <Clock size={18} className="inline mr-2" style={{ color: 'hsl(var(--primary))' }} />
                                        Timeline de Eventos
                                    </h3>
                                    <PatientTimeline
                                        events={timelineEvents}
                                        loading={loadingTimeline}
                                        viewType={viewType}
                                        onEdit={handleEditEvent}
                                        onAddNote={handleAddNote}
                                    />
                                    {timelineEvents.length === 0 && !loadingTimeline && (
                                        <div className="text-center py-12">
                                            <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                                                Nenhum evento registrado ainda.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Smart Cards (40%) */}
                            <div>
                                <SmartCards
                                    patient={{
                                        id: activePatient.id,
                                        name: activePatient.name
                                    }}
                                    alerts={overviewData?.alerts || alerts}
                                    nextSteps={[]} // TODO: Calculate next steps from overview data
                                    summary={{
                                        lastVisit: overviewData?.appointments?.[0]?.scheduledDate,
                                        nextAppointment: overviewData?.appointments?.find((a: any) => new Date(a.scheduledDate) > new Date())?.scheduledDate,
                                        pendingDocuments: 0,
                                        activeTreatments: overviewData?.treatmentProgress?.activePlans || 0
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[500px]" style={{ border: '1px solid hsl(var(--border))' }}>
                            <h3 className="font-bold text-lg mb-6" style={{ color: 'hsl(var(--text-main))' }}>Linha do Tempo Completa</h3>
                            <PatientTimeline
                                events={timelineEvents}
                                loading={loadingTimeline}
                                viewType={viewType}
                                onEdit={handleEditEvent}
                                onAddNote={handleAddNote}
                            />
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
