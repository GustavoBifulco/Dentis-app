import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
    Upload, X, FileText, Check, AlertCircle, Loader,
    ArrowLeft, ChevronRight, Mail, Phone, Info,
    Calendar, MapPin, Briefcase, User, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { LuxButton, IslandCard } from './Shared';

// --- CONSTANTS & HELPERS ---

const COLUMN_MAPPINGS: Record<string, string[]> = {
    name: ['name', 'nome', 'patient_name', 'paciente', 'full_name', 'nome_completo', 'patient', 'nome completo'],
    firstName: ['first_name', 'firstname', 'primeiro_nome', 'nome_proprio', 'first', 'given_name'],
    lastName: ['last_name', 'lastname', 'sobrenome', 'last', 'surname', 'family_name', 'apellido'],
    phone: ['phone', 'telefone', 'celular', 'mobile', 'contact', 'tel', 'fone', 'whatsapp', 'cel'],
    email: ['email', 'e-mail', 'mail', 'correio'],
    cpf: ['cpf', 'document', 'documento', 'tax_id'],
    birthDate: ['birth_date', 'birthdate', 'data_nascimento', 'dob', 'date_of_birth', 'nascimento', 'aniversario'],
    address: ['address', 'endereco', 'endereço', 'rua', 'street'],
    notes: ['notes', 'observacoes', 'observações', 'obs', 'comments', 'comentarios'],
};

const MAPPABLE_FIELDS = [
    { key: 'name', label: 'Nome Completo', icon: User, required: true },
    { key: 'firstName', label: 'Primeiro Nome', icon: User },
    { key: 'lastName', label: 'Sobrenome', icon: User },
    { key: 'phone', label: 'Telefone/WhatsApp', icon: Phone },
    { key: 'email', label: 'E-mail', icon: Mail },
    { key: 'cpf', label: 'CPF', icon: FileText },
    { key: 'birthDate', label: 'Nascimento', icon: Calendar },
    { key: 'address', label: 'Endereço', icon: MapPin },
    { key: 'occupation', label: 'Profissão', icon: Briefcase },
];

function normalizeColumnName(col: string): string {
    return String(col).toLowerCase().trim().replace(/[_\s-]+/g, '_');
}

// --- COMPONENT ---

type Step = 'upload' | 'mapping' | 'preview' | 'summary';

interface PatientImportProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PatientImport: React.FC<PatientImportProps> = ({ isOpen, onClose, onSuccess }) => {
    const { getToken } = useAuth();
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<{
        success: boolean;
        imported: number;
        total: number;
        skipped: number;
        errors: any[];
    } | null>(null);

    // Reset state when closing
    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setRawData([]);
            setHeaders([]);
            setColumnMapping({});
            setPatients([]);
            setLoading(false);
            setError(null);
            setImportResult(null);
            setStep('upload');
        }
    }, [isOpen]);

    const validateAndSetFile = (file: File) => {
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];

        if (!fileExtension || !validExtensions.includes(fileExtension)) {
            setError('Formato inválido. Use CSV ou Excel (.xlsx, .xls).');
            return;
        }

        setFile(file);
        setError(null);
        processFile(file);
    };

    const processFile = (file: File) => {
        setLoading(true);
        setError(null);

        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        const detectedHeaders = Object.keys(results.data[0]);
                        setHeaders(detectedHeaders);
                        setRawData(results.data);
                        autoMapColumns(detectedHeaders);
                        setStep('mapping');
                    } else {
                        setError('O arquivo CSV parece estar vazio.');
                    }
                    setLoading(false);
                },
                error: (err) => {
                    setError('Erro ao ler CSV: ' + err.message);
                    setLoading(false);
                }
            });
        } else if (['xlsx', 'xls'].includes(extension || '')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);

                    if (json && json.length > 0) {
                        const detectedHeaders = Object.keys(json[0] as any);
                        setHeaders(detectedHeaders);
                        setRawData(json);
                        autoMapColumns(detectedHeaders);
                        setStep('mapping');
                    } else {
                        setError('O arquivo Excel parece estar vazio.');
                    }
                } catch (err) {
                    setError('Erro ao processar Excel.');
                }
                setLoading(false);
            };
            reader.readAsBinaryString(file);
        } else {
            setError('Formato não suportado.');
            setLoading(false);
        }
    };

    const autoMapColumns = (detectedHeaders: string[]) => {
        const mapping: Record<string, string> = {};
        detectedHeaders.forEach(header => {
            const normalized = normalizeColumnName(header);
            for (const [targetField, variations] of Object.entries(COLUMN_MAPPINGS)) {
                if (variations.some(v => normalized.includes(v) || v.includes(normalized))) {
                    mapping[header] = targetField;
                    break;
                }
            }
        });
        setColumnMapping(mapping);
    };

    const handleMappingChange = (header: string, field: string) => {
        setColumnMapping(prev => ({ ...prev, [header]: field }));
    };

    const transformData = (data: any[], mapping: Record<string, string>) => {
        return data.map((row, index) => {
            const patient: any = {
                id: index,
                status: 'active',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                cpf: '',
                birthDate: '',
                address: '',
                occupation: ''
            };
            let fullName = '';

            Object.entries(row).forEach(([header, value]) => {
                const targetField = mapping[header];
                if (targetField && value) {
                    const strValue = String(value).trim();
                    if (targetField === 'firstName') patient.firstName = strValue;
                    else if (targetField === 'lastName') patient.lastName = strValue;
                    else if (targetField === 'name') fullName = strValue;
                    else patient[targetField] = strValue;
                }
            });

            if (fullName && !patient.firstName && !patient.lastName) {
                const parts = fullName.split(' ');
                patient.firstName = parts[0] || '';
                patient.lastName = parts.slice(1).join(' ') || '';
            }

            return patient;
        }).filter(p => p.firstName && p.firstName.length > 0);
    };

    const handleContinueToPreview = () => {
        const transformed = transformData(rawData, columnMapping);
        if (transformed.length === 0) {
            setError("Identifique a coluna de NOME para prosseguir.");
            return;
        }
        setPatients(transformed);
        setStep('preview');
    };

    const handleCellChange = (index: number, field: string, value: string) => {
        const updated = [...patients];
        updated[index] = { ...updated[index], [field]: value };
        setPatients(updated);
    };

    const handleRemoveRow = (index: number) => {
        const updated = patients.filter((_, i) => i !== index);
        setPatients(updated);
        if (updated.length === 0) {
            setFile(null);
            setStep('upload');
        }
    };

    const handleUpload = async () => {
        if (patients.length === 0) return;
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Não autenticado');

            const payloadPath = patients.map(({ id, ...rest }) => ({
                ...rest,
                name: `${rest.firstName} ${rest.lastName}`.trim()
            }));

            const response = await fetch('/api/patient-import/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patients: payloadPath }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao importar');

            setImportResult(data);
            setStep('summary');
            if (data.success) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao processar');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderStepper = () => (
        <div className="flex items-center justify-center mb-12 px-12">
            {[
                { id: 'upload', label: 'Upload' },
                { id: 'mapping', label: 'Mapeamento' },
                { id: 'preview', label: 'Revisão' },
                { id: 'summary', label: 'Concluído' }
            ].map((s, idx, arr) => (
                <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${step === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' :
                            arr.findIndex(x => x.id === step) > idx ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {arr.findIndex(x => x.id === step) > idx ? <Check size={20} strokeWidth={3} /> : idx + 1}
                        </div>
                        <span className={`absolute -bottom-7 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${step === s.id ? 'text-blue-600' : 'text-slate-400'
                            }`}>{s.label}</span>
                    </div>
                    {idx < arr.length - 1 && (
                        <div className={`flex-1 h-[2px] mx-6 transition-colors duration-500 ${arr.findIndex(x => x.id === step) > idx ? 'bg-emerald-500' : 'bg-slate-100'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Importação de Pacientes</h2>
                        <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Dentis OS Data Transfer</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/40">
                    {renderStepper()}

                    <div className="mt-16 max-w-4xl mx-auto">
                        {step === 'upload' && (
                            <div className="space-y-8">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        const droppedFile = e.dataTransfer.files[0];
                                        if (droppedFile) validateAndSetFile(droppedFile);
                                    }}
                                    className={`border-[3px] border-dashed rounded-[3rem] p-24 flex flex-col items-center justify-center transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' : 'border-slate-200 hover:border-blue-300 bg-white'
                                        }`}
                                >
                                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner shadow-blue-100/50">
                                        <Upload size={48} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Selecione seu arquivo</h3>
                                    <p className="text-slate-500 mb-10 text-center max-w-sm font-medium leading-relaxed">
                                        Arraste e solte seu arquivo .csv ou .xlsx aqui. <br />
                                        O Dentis detectará as colunas automaticamente.
                                    </p>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        accept=".csv, .xlsx, .xls"
                                        onChange={(e) => {
                                            const selectedFile = e.target.files?.[0];
                                            if (selectedFile) validateAndSetFile(selectedFile);
                                        }}
                                    />
                                    <LuxButton
                                        onClick={() => document.getElementById('fileInput')?.click()}
                                        variant="primary"
                                        size="lg"
                                        loading={loading}
                                        className="px-12 py-4 text-base"
                                    >
                                        Procurar Arquivo
                                    </LuxButton>
                                </div>

                                <IslandCard className="p-8 bg-blue-50/50 border-blue-100 flex gap-5 items-start rounded-[2rem]">
                                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-blue-900 text-sm uppercase tracking-widest">Dica Premium</h4>
                                        <p className="text-blue-700 text-sm leading-relaxed mt-2 font-medium">
                                            Arquivos com cabeçalho na primeira linha são processados instantaneamente.
                                            Suportamos nomes separados ou completos, e formatos flexíveis de CPF e Telefone.
                                        </p>
                                    </div>
                                </IslandCard>
                            </div>
                        )}

                        {step === 'mapping' && (
                            <div className="space-y-8">
                                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                                    <div className="bg-slate-50/80 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-black text-slate-900 tracking-tight">Mapeamento Inteligente</h3>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-slate-100">{file?.name}</span>
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/30">
                                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Destino (Dentis)</th>
                                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origem (Seu Arquivo)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {MAPPABLE_FIELDS.map(field => {
                                                    const mappedHeader = Object.keys(columnMapping).find(h => columnMapping[h] === field.key);
                                                    return (
                                                        <tr key={field.key} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`p-3 rounded-2xl transition-colors ${mappedHeader ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                        <field.icon size={20} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-black text-slate-900">{field.label} {field.required && <span className="text-red-500">*</span>}</div>
                                                                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Módulo Paciente</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-center">
                                                                {mappedHeader ? (
                                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                                        <Check size={12} strokeWidth={4} /> Mapeado
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                                                        Pendente
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <select
                                                                    value={mappedHeader || ''}
                                                                    onChange={(e) => handleMappingChange(e.target.value, field.key)}
                                                                    className={`w-full bg-slate-50 border rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${mappedHeader ? 'border-blue-100 text-blue-900' : 'border-slate-100 text-slate-400'
                                                                        }`}
                                                                >
                                                                    <option value="">-- Ignorar Coluna --</option>
                                                                    {headers.map(h => (
                                                                        <option key={h} value={h}>{h}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <LuxButton variant="ghost" onClick={() => setStep('upload')} icon={<ArrowLeft size={18} />}>Trocar Arquivo</LuxButton>
                                    <LuxButton
                                        disabled={!Object.values(columnMapping).includes('name') && !Object.values(columnMapping).includes('firstName')}
                                        onClick={handleContinueToPreview}
                                        icon={<ChevronRight size={18} />}
                                        className="px-10"
                                    >
                                        Revisar Pacientes
                                    </LuxButton>
                                </div>
                            </div>
                        )}

                        {step === 'preview' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revisão e Ajustes</h3>
                                        <p className="text-sm text-slate-400 font-medium mt-1">Limpamos os dados para você. Clique em qualquer campo para editar.</p>
                                    </div>
                                    <LuxButton
                                        onClick={handleUpload}
                                        loading={loading}
                                        icon={<Check size={20} strokeWidth={3} />}
                                        className="px-12 py-4"
                                    >
                                        Importar {patients.length} Pacientes
                                    </LuxButton>
                                </div>

                                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                                    <div className="max-h-[450px] overflow-y-auto">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato Profissional</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {patients.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-100">
                                                                    {p.firstName?.[0] || 'P'}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <input
                                                                        type="text"
                                                                        value={`${p.firstName} ${p.lastName}`.trim()}
                                                                        onChange={(e) => {
                                                                            const parts = e.target.value.split(' ');
                                                                            handleCellChange(idx, 'firstName', parts[0] || '');
                                                                            handleCellChange(idx, 'lastName', parts.slice(1).join(' ') || '');
                                                                        }}
                                                                        className="bg-transparent border-none focus:ring-2 focus:ring-blue-100 px-2 py-1 rounded-xl font-bold text-slate-900 text-base -ml-2 w-full transition-all"
                                                                    />
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                            <FileText size={10} className="text-slate-300" />
                                                                            <input
                                                                                type="text"
                                                                                value={p.cpf || ''}
                                                                                onChange={(e) => handleCellChange(idx, 'cpf', e.target.value)}
                                                                                placeholder="CPF não informado"
                                                                                className="bg-transparent border-none focus:ring-2 focus:ring-blue-100 px-2 rounded-lg py-0.5 w-full uppercase"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <Mail size={14} className="text-slate-300" />
                                                                    <input
                                                                        type="text"
                                                                        value={p.email || ''}
                                                                        onChange={(e) => handleCellChange(idx, 'email', e.target.value)}
                                                                        placeholder="Sem e-mail"
                                                                        className="bg-transparent border-none focus:ring-2 focus:ring-blue-100 px-2 py-1 rounded-xl text-sm font-medium text-slate-600 w-full transition-all"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Phone size={14} className="text-slate-300" />
                                                                    <input
                                                                        type="text"
                                                                        value={p.phone || ''}
                                                                        onChange={(e) => handleCellChange(idx, 'phone', e.target.value)}
                                                                        placeholder="Sem telefone"
                                                                        className="bg-transparent border-none focus:ring-2 focus:ring-blue-100 px-2 py-1 rounded-xl text-sm font-medium text-slate-600 w-full transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <button
                                                                onClick={() => handleRemoveRow(idx)}
                                                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <LuxButton variant="outline" onClick={() => setStep('mapping')} icon={<ArrowLeft size={18} />}>Ajustar Mapeamento</LuxButton>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Info size={14} /> Dica: os dados acima são salvos apenas após confirmar
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'summary' && importResult && (
                            <div className="text-center space-y-12 animate-in zoom-in-95 duration-500">
                                <div className="relative inline-flex">
                                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                                    <div className="relative inline-flex items-center justify-center w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] shadow-2xl shadow-emerald-200 border-8 border-emerald-50">
                                        <Check size={64} strokeWidth={4} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Importação de Sucesso!</h2>
                                    <p className="text-lg text-slate-500 font-medium">Seus novos pacientes já estão prontos no prontuário.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-105">
                                        <div className="text-5xl font-black text-emerald-500">{importResult.imported}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Importados</div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-105">
                                        <div className="text-5xl font-black text-red-500">{importResult.total - importResult.imported}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Falhas/Ignorados</div>
                                    </div>
                                </div>

                                {importResult.errors.length > 0 && (
                                    <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8 text-left max-w-2xl mx-auto overflow-hidden">
                                        <h4 className="font-black text-red-900 text-sm uppercase tracking-widest flex items-center gap-3 mb-5">
                                            <AlertCircle size={20} /> Detalhes das inconsistências
                                        </h4>
                                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                                            {importResult.errors.map((err, idx) => (
                                                <div key={idx} className="text-xs font-bold text-red-700 bg-white/70 p-4 rounded-2xl border border-red-50 flex justify-between items-center group hover:bg-white transition-colors">
                                                    <span>Paciente na linha <span className="text-red-900 font-black px-1.5 py-0.5 bg-red-100 rounded-md mx-1">{err.row}</span></span>
                                                    <span className="text-red-500/70 font-black">{err.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-8">
                                    <LuxButton onClick={onClose} size="lg" className="px-16 py-5 rounded-2xl text-lg font-black shadow-2xl">Voltar ao Dentis OS</LuxButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Bar / Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="absolute bottom-10 left-10 right-10 bg-slate-900 text-white px-8 py-5 rounded-[2rem] flex items-center justify-between shadow-2xl z-50 border border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-red-500 p-2 rounded-xl">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="font-bold tracking-tight">{error}</div>
                            </div>
                            <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default PatientImport;
