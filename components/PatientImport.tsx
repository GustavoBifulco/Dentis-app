import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// --- MAPPING LOGIC (Ported to Client) ---

// Column mapping - recognizes common variations
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

function normalizeColumnName(col: string): string {
    return String(col).toLowerCase().trim().replace(/[_\s-]+/g, '_');
}

function mapColumns(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    headers.forEach(header => {
        const normalized = normalizeColumnName(header);

        for (const [targetField, variations] of Object.entries(COLUMN_MAPPINGS)) {
            if (variations.some(v => normalized.includes(v) || v.includes(normalized))) {
                mapping[header] = targetField;
                break;
            }
        }
    });

    return mapping;
}

function transformPatientData(rawData: any[], columnMapping: Record<string, string>): any[] {
    return rawData.map((row, index) => {
        const patient: any = {
            id: index, // Temporary ID for UI handling
            status: 'active',
            name: '',
            email: '',
            phone: '',
            cpf: '',
            birthDate: ''
        };

        let firstName = '';
        let lastName = '';

        Object.entries(row).forEach(([key, value]) => {
            const targetField = columnMapping[key];
            if (targetField && value) {
                const trimmedValue = String(value).trim();

                // Handle separate first and last name columns
                if (targetField === 'firstName') {
                    firstName = trimmedValue;
                } else if (targetField === 'lastName') {
                    lastName = trimmedValue;
                } else if (targetField === 'name') {
                    patient.name = trimmedValue;
                } else {
                    patient[targetField] = trimmedValue;
                }
            }
        });

        // Combine firstName + lastName if we don't have a full name
        if (!patient.name && (firstName || lastName)) {
            patient.name = `${firstName} ${lastName}`.trim();
        }

        // Fallback: If no name found, try to use the first column that looks like a name
        if (!patient.name) {
            const possibleName = Object.values(row).find(v => v && String(v).length > 2 && isNaN(Number(v)));
            if (possibleName) {
                patient.name = String(possibleName).trim();
            }
        }

        return patient;
    }).filter(p => p.name && p.name.length > 0); // Only keep patients with at least a name
}

// --- COMPONENT ---

interface PatientImportProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PatientImport: React.FC<PatientImportProps> = ({ isOpen, onClose, onSuccess }) => {
    const { getToken } = useAuth();
    const [file, setFile] = useState<File | null>(null);

    // The list of patients ready to be imported (edited state)
    const [patients, setPatients] = useState<any[]>([]);

    const [loadingPreview, setLoadingPreview] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Reset state when closing
    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setPatients([]);
            setResult(null);
            setError(null);
        }
    }, [isOpen]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        // Simple extension check
        const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];

        if (!fileExtension || !validExtensions.includes(fileExtension)) {
            setError('Formato inválido. Use CSV ou Excel (.xlsx, .xls).');
            return;
        }

        setFile(file);
        setError(null);
        setResult(null);
        setPatients([]);

        // Generate Preview / Parse Data
        setLoadingPreview(true);

        try {
            const processData = (rawData: any[]) => {
                if (!rawData || rawData.length === 0) {
                    setError("O arquivo parece estar vazio.");
                    setLoadingPreview(false);
                    return;
                }

                // Map columns
                const headers = Object.keys(rawData[0]);
                const columnMapping = mapColumns(headers);

                // Transform locally
                const transformed = transformPatientData(rawData, columnMapping);

                if (transformed.length === 0) {
                    setError("Não foi possível identificar colunas de Nome. Verifique o cabeçalho do arquivo.");
                    setLoadingPreview(false);
                    return;
                }

                setPatients(transformed);
                setLoadingPreview(false);
            };

            if (fileExtension === '.csv') {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        processData(results.data);
                    },
                    error: (err) => {
                        setError(`Erro ao ler CSV: ${err.message}`);
                        setLoadingPreview(false);
                    }
                });
            } else {
                // Excel
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(sheet);
                        processData(json);
                    } catch (err) {
                        setError("Falha ao ler arquivo Excel. Verifique se não está corrompido.");
                        setLoadingPreview(false);
                    }
                };
                reader.readAsBinaryString(file);
            }
        } catch (e) {
            setError("Erro inesperado ao abrir arquivo.");
            setLoadingPreview(false);
        }
    };

    const handleCellChange = (index: number, field: string, value: string) => {
        const updated = [...patients];
        updated[index] = { ...updated[index], [field]: value };
        setPatients(updated);
    };

    const handleDeleteRow = (index: number) => {
        const updated = patients.filter((_, i) => i !== index);
        setPatients(updated);
        // If all rows deleted, reset file to allow re-upload
        if (updated.length === 0) {
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (patients.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Não autenticado');
            }

            // Clean data before sending (remove temp ID)
            const payload = patients.map(({ id, ...rest }) => rest);

            const response = await fetch('/api/patient-import/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patients: payload }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao importar');
            }

            setResult(data);

            // Auto close success
            if (data.success) {
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 2500);
            }

        } catch (err: any) {
            setError(err.message || 'Erro ao processar arquivo');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        onClose();
        // State reset handled by useEffect
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-lux-border flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-3xl font-black text-lux-text">Importar Pacientes</h2>
                            <p className="text-sm text-lux-text-secondary mt-1">
                                {patients.length > 0
                                    ? `Revisar ${patients.length} pacientes encontrados`
                                    : 'Arraste ou selecione sua planilha de pacientes'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-lux-subtle hover:bg-lux-border transition flex items-center justify-center"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                        {/* 1. Upload Area (Only if no valid data parsed yet) */}
                        {patients.length === 0 && !result && (
                            <div className="space-y-6">
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`
                                        border-2 border-dashed rounded-2xl p-20 text-center transition-all cursor-pointer
                                        ${isDragging ? 'border-lux-accent bg-lux-accent/5' : 'border-lux-border hover:border-lux-accent/50'}
                                    `}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    {loadingPreview ? (
                                        <div className="flex flex-col items-center">
                                            <Loader size={48} className="text-lux-accent animate-spin mb-4" />
                                            <p className="font-bold text-lux-text">Lendo arquivo...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={48} className="mx-auto text-lux-text-secondary mb-4" />
                                            <p className="text-xl font-bold text-lux-text mb-2">
                                                Clique para selecionar ou arraste aqui
                                            </p>
                                            <p className="text-sm text-lux-text-secondary">
                                                Suporta CSV e Excel (.xlsx, .xls)
                                            </p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                                    <div className="mt-1">
                                        <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">i</div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-900 text-sm">Colunas Reconhecidas Automaticamente</p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            O sistema tenta identificar colunas como: <b>Nome, Telefone, Email, CPF, Data Nascimento</b>.
                                            Não se preocupe com a ordem, apenas certifique-se que o arquivo tenha cabeçalho.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Editor Table (If we have patients) */}
                        {patients.length > 0 && !result && (
                            <div className="space-y-4">
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto max-h-[500px]">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 font-bold text-slate-600 uppercase text-xs sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="px-4 py-3 border-b border-slate-200 w-10">#</th>
                                                    <th className="px-4 py-3 border-b border-slate-200 min-w-[200px]">Nome Completo *</th>
                                                    <th className="px-4 py-3 border-b border-slate-200 min-w-[150px]">Telefone</th>
                                                    <th className="px-4 py-3 border-b border-slate-200 min-w-[200px]">Email</th>
                                                    <th className="px-4 py-3 border-b border-slate-200 min-w-[140px]">CPF</th>
                                                    <th className="px-4 py-3 border-b border-slate-200 w-16">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {patients.map((patient, idx) => (
                                                    <tr key={patient.id || idx} className="hover:bg-slate-50 transition group">
                                                        <td className="px-4 py-2 text-slate-400 text-xs bg-white group-hover:bg-slate-50">{idx + 1}</td>
                                                        <td className="p-1">
                                                            <input
                                                                type="text"
                                                                value={patient.name}
                                                                onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                                                                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-lux-accent/50 outline-none transition bg-transparent ${!patient.name ? 'border-red-300 bg-red-50' : 'border-transparent hover:border-slate-300 focus:bg-white'}`}
                                                                placeholder="Nome Obrigatório"
                                                            />
                                                        </td>
                                                        <td className="p-1">
                                                            <input
                                                                type="text"
                                                                value={patient.phone || ''}
                                                                onChange={(e) => handleCellChange(idx, 'phone', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg border border-transparent hover:border-slate-300 focus:bg-white focus:border-lux-accent focus:ring-2 focus:ring-lux-accent/50 outline-none transition bg-transparent"
                                                                placeholder="Telefone"
                                                            />
                                                        </td>
                                                        <td className="p-1">
                                                            <input
                                                                type="text"
                                                                value={patient.email || ''}
                                                                onChange={(e) => handleCellChange(idx, 'email', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg border border-transparent hover:border-slate-300 focus:bg-white focus:border-lux-accent focus:ring-2 focus:ring-lux-accent/50 outline-none transition bg-transparent"
                                                                placeholder="Email"
                                                            />
                                                        </td>
                                                        <td className="p-1">
                                                            <input
                                                                type="text"
                                                                value={patient.cpf || ''}
                                                                onChange={(e) => handleCellChange(idx, 'cpf', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg border border-transparent hover:border-slate-300 focus:bg-white focus:border-lux-accent focus:ring-2 focus:ring-lux-accent/50 outline-none transition bg-transparent"
                                                                placeholder="CPF"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button
                                                                onClick={() => handleDeleteRow(idx)}
                                                                className="text-slate-400 hover:text-red-500 transition p-1 rounded-md hover:bg-red-50"
                                                                title="Remover linha"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                                        <span>Total: {patients.length} pacientes</span>
                                        <span>* Campos editáveis. O nome é obrigatório.</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Error State */}
                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-red-900">Algo deu errado</p>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* 4. Success State */}
                        {result && (
                            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                                >
                                    <CheckCircle size={40} className="text-emerald-600" />
                                </motion.div>
                                <h3 className="text-2xl font-black text-lux-text mb-2">Sucesso!</h3>
                                <p className="text-lux-text-secondary mb-8 text-lg">
                                    {result.imported} pacientes foram adicionados à sua base.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <span className="block text-2xl font-black text-slate-800">{result.total}</span>
                                        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Processados</span>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                        <span className="block text-2xl font-black text-emerald-700">{result.imported}</span>
                                        <span className="text-xs uppercase font-bold text-emerald-600/70 tracking-wider">Importados</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {!result && (
                        <div className="p-8 border-t border-lux-border flex justify-between items-center bg-white flex-shrink-0 z-20">
                            <button
                                onClick={handleClose}
                                className="px-6 py-3 rounded-xl font-bold text-lux-text hover:bg-lux-subtle transition"
                            >
                                Cancelar
                            </button>

                            {patients.length > 0 ? (
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-8 py-3 rounded-xl font-bold bg-lux-accent text-white shadow-lg shadow-lux-accent/20 hover:shadow-xl hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Confirmar Importação de {patients.length} Pacientes
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed"
                                >
                                    Aguardando Arquivo...
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PatientImport;
