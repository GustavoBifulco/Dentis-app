import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface PatientImportProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PatientImport: React.FC<PatientImportProps> = ({ isOpen, onClose, onSuccess }) => {
    const { getToken } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

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
        const validExtensions = ['.csv', '.xlsx', '.xls', '.sql'];
        const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];

        if (!fileExtension || !validExtensions.includes(fileExtension)) {
            setError('Formato inválido. Use CSV, Excel (.xlsx, .xls) ou SQL.');
            return;
        }

        setFile(file);
        setError(null);
        setResult(null);
        setPreviewData([]);

        // Generate Preview
        setLoadingPreview(true);
        try {
            if (fileExtension === '.csv') {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    preview: 5, // Only get first 5 rows
                    complete: (results) => {
                        setPreviewData(results.data);
                        setLoadingPreview(false);
                    },
                    error: (err) => {
                        setError(`Erro ao ler CSV: ${err.message}`);
                        setLoadingPreview(false);
                    }
                });
            } else {
                // For now, only preview CSV easily on client without heavier libs or just show file info
                // Excel preview requires 'xlsx' parsing which we can do if installed
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(sheet);
                        setPreviewData(json.slice(0, 5));
                    } catch (err) {
                        console.warn("Excel preview failed", err);
                    } finally {
                        setLoadingPreview(false);
                    }
                };
                reader.readAsBinaryString(file);
            }
        } catch (e) {
            setLoadingPreview(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Não autenticado');
            }

            // Parse full file content to send as JSON
            let payloadData: any[] = [];

            if (file.name.toLowerCase().endsWith('.csv')) {
                await new Promise<void>((resolve, reject) => {
                    Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            payloadData = results.data;
                            resolve();
                        },
                        error: reject
                    });
                });
            } else {
                // Excel processing
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                payloadData = XLSX.utils.sheet_to_json(sheet);
            }

            if (payloadData.length === 0) {
                throw new Error("O arquivo está vazio ou inválido.");
            }

            const response = await fetch('/api/patient-import/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patients: payloadData }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao importar');
            }

            setResult(data);

            // Auto close success after longer delay
            if (data.success) {
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 3000);
            }

        } catch (err: any) {
            setError(err.message || 'Erro ao processar arquivo');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        setError(null);
        setIsDragging(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-lux-border flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-lux-text">Importar Pacientes <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">v2.7</span></h2>
                            <p className="text-sm text-lux-text-secondary mt-1">
                                Suporta CSV, Excel e SQL de qualquer sistema
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-lux-subtle hover:bg-lux-border transition flex items-center justify-center"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Upload Area */}
                        {!result && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center transition-all
                  ${isDragging ? 'border-lux-accent bg-lux-accent/5' : 'border-lux-border hover:border-lux-accent/50'}
                  ${file ? 'bg-lux-subtle' : ''}
                `}
                            >
                                {!file ? (
                                    <>
                                        <Upload size={48} className="mx-auto text-lux-text-secondary mb-4" />
                                        <p className="text-lg font-bold text-lux-text mb-2">
                                            Arraste seu arquivo aqui
                                        </p>
                                        <p className="text-sm text-lux-text-secondary mb-4">
                                            ou clique para selecionar
                                        </p>
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls,.sql"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-block bg-lux-accent text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-opacity-90 transition"
                                        >
                                            Selecionar Arquivo
                                        </label>
                                        <p className="text-xs text-lux-text-secondary mt-4">
                                            Formatos: CSV, Excel (.xlsx, .xls), SQL
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between bg-white p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <FileText size={32} className="text-lux-accent" />
                                            <div className="text-left">
                                                <p className="font-bold text-lux-text">{file.name}</p>
                                                <p className="text-xs text-lux-text-secondary">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="text-lux-text-secondary hover:text-red-500 transition"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Preview Section */}
                        {file && !result && previewData.length > 0 && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-200 bg-slate-100/50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 text-sm">Pré-visualização (5 linhas)</h3>
                                    <span className="text-xs text-slate-500">Verifique se os dados estão corretos</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                                            <tr>
                                                {Object.keys(previewData[0]).slice(0, 5).map(key => (
                                                    <th key={key} className="px-4 py-2 border-b border-slate-200 whitespace-nowrap">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {previewData.map((row, idx) => (
                                                <tr key={idx}>
                                                    {Object.values(row).slice(0, 5).map((val: any, i) => (
                                                        <td key={i} className="px-4 py-2 text-slate-600 whitespace-nowrap overflow-hidden max-w-[150px] text-ellipsis">{String(val)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-red-900">Erro</p>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Success Result */}
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-50 border border-emerald-200 rounded-xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle size={32} className="text-emerald-600" />
                                    <div>
                                        <p className="text-xl font-black text-emerald-900">Importação Concluída!</p>
                                        <p className="text-sm text-emerald-700">Pacientes adicionados com sucesso</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-2xl font-black text-lux-text">{result.imported}</p>
                                        <p className="text-xs text-lux-text-secondary">Importados</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-2xl font-black text-lux-text">{result.total}</p>
                                        <p className="text-xs text-lux-text-secondary">Total</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-2xl font-black text-lux-text">{result.skipped}</p>
                                        <p className="text-xs text-lux-text-secondary">Ignorados</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Info Box */}
                        {!result && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm font-bold text-blue-900 mb-2">💡 Reconhecimento Automático</p>
                                <p className="text-xs text-blue-700">
                                    O sistema identifica automaticamente as colunas (nome, telefone, email, CPF, etc.)
                                    mesmo que estejam em formatos diferentes. Apenas o nome é obrigatório.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!result && (
                        <div className="p-8 border-t border-lux-border flex gap-3 justify-end">
                            <button
                                onClick={handleClose}
                                className="px-6 py-3 rounded-xl font-bold text-lux-text hover:bg-lux-subtle transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="px-6 py-3 rounded-xl font-bold bg-lux-accent text-white hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    'Importar Pacientes'
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PatientImport;
