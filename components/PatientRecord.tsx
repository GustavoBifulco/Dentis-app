
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { SectionHeader, LuxButton, IslandCard } from './Shared';
import { ArrowLeft, Smile, FileText, Clock, Camera, Mail, Plus, MessageSquare, AlertTriangle, Send, User } from 'lucide-react';
import Odontogram from './Odontogram';
import SmartPrescription from './SmartPrescription';
import Anamnesis from './Anamnesis';
import { useAppContext } from '../lib/useAppContext';
import PatientInviteButton from './PatientInviteButton';
import EditPatientModal from './EditPatientModal';

interface PatientRecordProps {
    patient: Patient;
    onBack: () => void;
}

type Tab = 'timeline' | 'odontogram' | 'docs' | 'photos' | 'anamnesis';

const PatientRecord: React.FC<PatientRecordProps> = ({ patient, onBack }) => {
    const [activePatient, setActivePatient] = useState<Patient>(patient);
    const [activeTab, setActiveTab] = useState<Tab>('timeline');
    const { showToast } = useAppContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        setActivePatient(patient);
    }, [patient]);

    const handleEditSave = (updated: Patient) => {
        setActivePatient(updated);
        showToast('Perfil atualizado com sucesso!', 'success');
        setIsEditModalOpen(false);
    };

    // Mock data - in real app, fetch from API
    const allergies: string[] = activePatient.allergies ? [activePatient.allergies] : [];
    const medicalConditions: string[] = activePatient.medicalHistory ? [activePatient.medicalHistory] : [];
    const appointments: any[] = []; // Empty by default

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 overflow-hidden relative bg-slate-50">

            {/* HEADER */}
            <div className="relative flex-shrink-0">
                {/* Cover Image */}
                <div className="h-32 w-full bg-slate-900 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1400&q=80" className="w-full h-full object-cover opacity-10" alt="Cover" />
                    <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-md z-10 border border-white/10">
                        <ArrowLeft size={18} strokeWidth={3} />
                    </button>
                    <div className="absolute top-6 right-6 flex gap-2">
                        <PatientInviteButton
                            patientId={activePatient.id}
                            patientName={activePatient.name}
                            hasAccount={!!activePatient.userId}
                        />
                    </div>
                </div>

                {/* Profile Info Bar */}
                <div className="px-8 pb-1 relative bg-white border-b border-slate-200 shadow-sm z-10">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-4 -mt-12 mb-4">
                        <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                            <img src={`https://ui-avatars.com/api/?name=${activePatient.name}&background=6366f1&color=fff&size=256`} alt={activePatient.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activePatient.name}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    {activePatient.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium mt-1">{activePatient.email || 'Sem email'} <span className="mx-2 text-slate-300">•</span> {activePatient.phone}</p>
                        </div>
                        <div className="flex gap-3 mb-2">
                            <LuxButton variant="outline" onClick={onBack} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl">
                                Voltar à Lista
                            </LuxButton>
                            <LuxButton variant="outline" icon={<MessageSquare size={18} />} className="rounded-2xl border-slate-200 text-slate-600">Chat</LuxButton>
                            <LuxButton onClick={() => setIsEditModalOpen(true)} icon={<User size={18} />} className="rounded-2xl">
                                Editar Perfil
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
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT SIDEBAR */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Alertas Médicos - Only show if there are any */}
                        {(allergies.length > 0 || medicalConditions.length > 0) && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-red-600 mb-3">
                                    <AlertTriangle size={18} strokeWidth={2.5} />
                                    <span className="font-black text-xs uppercase tracking-widest">Alertas Médicos</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {allergies.map((allergy, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white border border-red-100 rounded-lg text-xs font-bold text-red-700">
                                            Alergia: {allergy}
                                        </span>
                                    ))}
                                    {medicalConditions.map((condition, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white border border-red-100 rounded-lg text-xs font-bold text-red-700">
                                            {condition}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info Rápida */}
                        <IslandCard className="p-4 space-y-4 border-none shadow-lg">
                            <h3 className="font-black text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-widest">Informações</h3>
                            <div className="space-y-3">
                                {activePatient.lastVisit && (
                                    <div>
                                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Última Visita</p>
                                        <p className="font-bold text-slate-800 text-sm">{activePatient.lastVisit}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Status</p>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activePatient.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                                        }`}>
                                        {activePatient.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                {activePatient.cpf && (
                                    <div>
                                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">CPF</p>
                                        <p className="font-bold text-slate-800 text-sm">{activePatient.cpf}</p>
                                    </div>
                                )}
                                {activePatient.birthdate && (
                                    <div>
                                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Nascimento</p>
                                        <p className="font-bold text-slate-800 text-sm">{activePatient.birthdate}</p>
                                    </div>
                                )}
                                {activePatient.address && (
                                    <div>
                                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Endereço</p>
                                        <p className="font-bold text-slate-800 text-sm">{activePatient.address}</p>
                                    </div>
                                )}
                            </div>
                        </IslandCard>

                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-9 pb-20">
                        {activeTab === 'timeline' && (
                            <div className="space-y-4 animate-in fade-in">
                                {appointments.length > 0 ? (
                                    appointments.map((appointment, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-blue-600">
                                                    <Clock size={16} strokeWidth={2.5} />
                                                </div>
                                                {i < appointments.length - 1 && <div className="w-0.5 bg-slate-200 flex-1 my-2"></div>}
                                            </div>
                                            <IslandCard className="flex-1 p-6 mb-4 border-none shadow-lg">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-black text-lg text-slate-900">{appointment.title}</h4>
                                                    <span className="text-xs text-slate-400 font-bold">{appointment.date}</span>
                                                </div>
                                                <p className="text-slate-600 text-sm mb-4">{appointment.description}</p>
                                                <div className="flex gap-2">
                                                    <span className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-slate-500">
                                                        {appointment.doctor}
                                                    </span>
                                                </div>
                                            </IslandCard>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16">
                                        <Clock size={48} className="mx-auto text-slate-300 mb-4" />
                                        <h3 className="font-black text-slate-900 mb-2">Nenhum histórico ainda</h3>
                                        <p className="text-slate-500 text-sm mb-6">As consultas e procedimentos aparecerão aqui</p>
                                        <LuxButton icon={<Plus size={18} />}>Adicionar Consulta</LuxButton>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'odontogram' && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden h-full min-h-[600px] animate-in zoom-in-95 duration-300">
                                <Odontogram />
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="space-y-4 animate-in fade-in">
                                <SmartPrescription />
                            </div>
                        )}

                        {activeTab === 'anamnesis' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex justify-end gap-2 mb-4">
                                    <LuxButton variant="outline" icon={<Send size={16} />}>Enviar para Paciente</LuxButton>
                                    <LuxButton icon={<Plus size={16} />}>Preencher Agora</LuxButton>
                                </div>
                                <Anamnesis patientId={activePatient.id} />
                            </div>
                        )}

                        {activeTab === 'photos' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
                                {[].length > 0 ? (
                                    // Show photos when available
                                    <></>
                                ) : (
                                    <div className="col-span-full text-center py-16">
                                        <Camera size={48} className="mx-auto text-slate-300 mb-4" />
                                        <h3 className="font-black text-slate-900 mb-2">Nenhuma foto ainda</h3>
                                        <p className="text-slate-500 text-sm mb-6">Adicione fotos do tratamento</p>
                                        <LuxButton icon={<Plus size={18} />}>Adicionar Foto</LuxButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <EditPatientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                patient={activePatient}
                onSave={handleEditSave}
            />
        </div>
    );
};

export default PatientRecord;
