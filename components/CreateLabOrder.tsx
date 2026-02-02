import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Box,
    Cloud,
    Upload,
    Check,
    ArrowRight,
    ChevronLeft,
    Calendar,
    DollarSign,
    User,
    Stethoscope,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import STLViewer from './STLViewer';
import { LabOrder } from '../types';

interface CreateLabOrderProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderCreated: (order: Partial<LabOrder>) => void;
}

type FlowType = 'selection' | 'form';

export default function CreateLabOrder({ isOpen, onClose, onOrderCreated }: CreateLabOrderProps) {
    const [step, setStep] = useState<FlowType>('selection');
    const [isDigital, setIsDigital] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [patientName, setPatientName] = useState('');
    const [procedure, setProcedure] = useState('');
    const [cost, setCost] = useState('');
    const [deadline, setDeadline] = useState('');

    const resetForm = () => {
        setStep('selection');
        setIsDigital(false);
        setUploadedUrl(null);
        setPatientName('');
        setProcedure('');
        setCost('');
        setDeadline('');
        setUploadProgress(0);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'LAB_SCAN');

        try {
            // Manual Progress Emulation (since fetch doesn't support upload progress natively without XHR)
            const interval = setInterval(() => {
                setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
            }, 200);

            const response = await fetch('/api/uploads', {
                method: 'POST',
                headers: {
                    'x-user-id': 'current' // Handled by backend auth usually
                },
                body: formData,
            });

            clearInterval(interval);
            setUploadProgress(100);

            const result = await response.json();
            if (result.ok) {
                setUploadedUrl(result.data.url);
            } else {
                alert(result.error || 'Erro no upload');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao enviar arquivo');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!patientName || !procedure) {
            alert('Por favor preencha os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                patientName,
                procedure,
                isDigital,
                stlFileUrl: uploadedUrl,
                cost: Number(cost),
                deadline,
                description: procedure,
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            if (result.success) {
                onOrderCreated(result.order);
                onClose();
                resetForm();
            } else {
                alert(result.error || 'Erro ao criar pedido');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar pedido');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                layoutId="order-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        {step === 'form' && (
                            <button
                                onClick={() => setStep('selection')}
                                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-500" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">
                                {step === 'selection' ? 'Novo Pedido de Lab' : (isDigital ? 'Fluxo Digital' : 'Fluxo Físico')}
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                {step === 'selection' ? 'Escolha o tipo de envio' : 'Preencha os detalhes do trabalho'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {step === 'selection' ? (
                            <motion.div
                                key="selection"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {/* Opção Física */}
                                <button
                                    onClick={() => { setIsDigital(false); setStep('form'); }}
                                    className="group relative p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-50 transition-all text-left bg-slate-50/50 hover:bg-white"
                                >
                                    <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Box size={28} className="text-slate-600 group-hover:text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Envio Físico</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Moldagens, modelos de gesso ou componentes via Motoboy Coleta.
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        Selecionar <ArrowRight size={16} />
                                    </div>
                                </button>

                                {/* Opção Digital */}
                                <button
                                    onClick={() => { setIsDigital(true); setStep('form'); }}
                                    className="group relative p-8 rounded-3xl border-2 border-indigo-100 bg-indigo-50/30 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-50 transition-all text-left hover:bg-white"
                                >
                                    <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                        Scanner
                                    </div>
                                    <div className="w-14 h-14 bg-indigo-600 shadow-lg shadow-indigo-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Cloud size={28} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Fluxo Digital</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Envio instantâneo de arquivos STL/PLY direto do seu Scanner Intraoral.
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        Selecionar <ArrowRight size={16} />
                                    </div>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-6"
                            >
                                {/* Zona de Upload para Digital */}
                                {isDigital && (
                                    <div className="space-y-4">
                                        {!uploadedUrl ? (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-indigo-200 rounded-3xl p-10 bg-indigo-50/20 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/40 transition-colors group"
                                            >
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept=".stl,.ply,.obj"
                                                    onChange={handleFileUpload}
                                                />
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    {loading ? (
                                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Upload size={32} className="text-indigo-600" />
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-900 mb-1">Upload do Arquivo 3D</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Arraste seu .STL aqui ou clique</p>

                                                {uploadProgress > 0 && uploadProgress < 100 && (
                                                    <div className="w-full max-w-xs mt-6 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-600 transition-all duration-300"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <STLViewer url={uploadedUrl} className="h-72" />
                                                <button
                                                    onClick={() => setUploadedUrl(null)}
                                                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                                <div className="mt-3 flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                                                    <Check size={18} /> Arquivo verificado com sucesso
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                                            <User size={14} /> Paciente *
                                        </label>
                                        <input
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                                            <Stethoscope size={14} /> Procedimento *
                                        </label>
                                        <input
                                            value={procedure}
                                            onChange={(e) => setProcedure(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Ex: Coroa E-max Dente 11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                                            <Calendar size={14} /> Prazo Desejado
                                        </label>
                                        <input
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                                            <DollarSign size={14} /> Custo Estimado (R$)
                                        </label>
                                        <input
                                            type="number"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all outline-none font-bold text-slate-700"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                {isDigital && !uploadedUrl && (
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                                        <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                            Atenção: Para prosseguir no fluxo digital, você deve anexar o arquivo .STL ou .PLY do escaneamento.
                                            Isso evita custos desnecessários de motoboy.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Passo {step === 'selection' ? '1' : '2'} de 2
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        {step === 'form' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading || (isDigital && !uploadedUrl)}
                                onClick={handleSubmit}
                                className={`
                            px-10 py-3 rounded-2xl font-black text-white shadow-lg transition-all
                            ${loading || (isDigital && !uploadedUrl) ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}
                        `}
                            >
                                {loading ? 'Salvando...' : 'Criar Pedido'}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
