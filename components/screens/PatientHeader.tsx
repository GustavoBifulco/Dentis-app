import React from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Plus,
    DollarSign,
    Upload,
    UserPlus,
    MessageSquare,
    Shield,
    CreditCard,
    Stethoscope
} from 'lucide-react';
import { LuxButton } from '../Shared';
import PatientInviteButton from '../PatientInviteButton';

interface PatientHeaderProps {
    patient: {
        id: number;
        name: string;
        email?: string | null;
        phone?: string | null;
        cpf?: string | null;
        birthdate?: string | null;
        gender?: string | null;
        status?: string;
        avatarUrl?: string | null;
        hasAccount: boolean;
    };
    viewType: 'dentist' | 'patient';
    onAction: (action: string) => void;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ patient, viewType, onAction }) => {
    // Calculate age from birthdate
    const calculateAge = (birthdate: string | null | undefined): number | null => {
        if (!birthdate) return null;
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Mask CPF (show only last 4 digits)
    const maskCPF = (cpf: string | null | undefined): string => {
        if (!cpf) return 'Não informado';
        return `***.***.***-${cpf.slice(-2)}`;
    };

    // Generate initials for avatar fallback
    const getInitials = (name: string): string => {
        const parts = name.split(' ').filter(p => p.length > 0);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const age = calculateAge(patient.birthdate);

    return (
        <div className="bg-white border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            {/* Main Header */}
            <div className="px-6 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {patient.avatarUrl ? (
                                <img
                                    src={patient.avatarUrl}
                                    alt={patient.name}
                                    className="w-16 h-16 rounded-full object-cover shadow-md"
                                />
                            ) : (
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md"
                                    style={{
                                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--violet-hint)) 100%)'
                                    }}
                                >
                                    {getInitials(patient.name)}
                                </div>
                            )}
                            {/* Status indicator */}
                            <div
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${patient.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                title={patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                            />
                        </div>

                        {/* Patient Info */}
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-main))' }}>
                                {patient.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                                {age && (
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {age} anos
                                    </span>
                                )}
                                {patient.cpf && (
                                    <span className="flex items-center gap-1">
                                        <FileText size={14} />
                                        {maskCPF(patient.cpf)}
                                    </span>
                                )}
                                {patient.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} />
                                        {patient.phone}
                                    </span>
                                )}
                                {patient.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail size={14} />
                                        {patient.email}
                                    </span>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{
                                        backgroundColor: patient.status === 'active' ? 'hsl(var(--success-bg))' : 'hsl(var(--muted))',
                                        color: patient.status === 'active' ? 'hsl(var(--success))' : 'hsl(var(--text-muted))'
                                    }}
                                >
                                    {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                                </span>
                                {patient.hasAccount && (
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                                        style={{
                                            backgroundColor: 'hsl(var(--info-bg))',
                                            color: 'hsl(var(--info))'
                                        }}
                                    >
                                        Com Conta
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                        {viewType === 'dentist' ? (
                            <>
                                <LuxButton
                                    variant="primary"
                                    size="sm"
                                    icon={<Stethoscope size={16} />}
                                    onClick={() => onAction('new-record')}
                                >
                                    Novo Registro
                                </LuxButton>
                                <LuxButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<Calendar size={16} />}
                                    onClick={() => onAction('new-appointment')}
                                >
                                    Agendar
                                </LuxButton>
                                <LuxButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<Upload size={16} />}
                                    onClick={() => onAction('upload-document')}
                                >
                                    Anexar
                                </LuxButton>
                                <LuxButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<DollarSign size={16} />}
                                    onClick={() => onAction('create-charge')}
                                >
                                    Cobrar
                                </LuxButton>
                                <PatientInviteButton
                                    patientId={patient.id}
                                    patientName={patient.name}
                                    hasAccount={patient.hasAccount}
                                    label="Enviar Link para Cadastro"
                                    variant="ghost"
                                    size="sm"
                                />
                            </>
                        ) : (
                            <>
                                <LuxButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<FileText size={16} />}
                                    onClick={() => onAction('my-documents')}
                                >
                                    Meus Documentos
                                </LuxButton>
                                <LuxButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<CreditCard size={16} />}
                                    onClick={() => onAction('my-payments')}
                                >
                                    Pagamentos
                                </LuxButton>
                                <LuxButton
                                    variant="ghost"
                                    size="sm"
                                    icon={<Shield size={16} />}
                                    onClick={() => onAction('consents')}
                                >
                                    Privacidade
                                </LuxButton>
                                <LuxButton
                                    variant="primary"
                                    size="sm"
                                    icon={<MessageSquare size={16} />}
                                    onClick={() => onAction('contact-clinic')}
                                >
                                    Falar com Clínica
                                </LuxButton>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientHeader;
