import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, X, Box, MapPin, ScanBarcode } from 'lucide-react';
import { Services } from '../lib/services';
import { useAuth } from '@clerk/clerk-react';

interface CreateShipmentProps {
    isOpen: boolean;
    onClose: () => void;
    labOrderId: number;
    labName?: string;
    onShipmentCreated: () => void;
}

export default function CreateShipment({ isOpen, onClose, labOrderId, labName, onShipmentCreated }: CreateShipmentProps) {
    const { getToken } = useAuth();
    const [provider, setProvider] = useState('LOGGI');
    const [cost, setCost] = useState('');
    const [loading, setLoading] = useState(false);

    // Label Generation State
    const [labelUrl, setLabelUrl] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            // 1. Create Shipment
            const trackingCode = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const res = await Services.logistics.createShipment(token, {
                trackingCode,
                provider,
                labOrderId,
                status: 'CREATED',
                metadata: { cost: Number(cost) }
            });

            if (res) { // Assume success if no error thrown by api helper (it throws on !ok)
                // 2. Generate Label (Mock)
                setLabelUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${trackingCode}`);

                // 3. Update Order Status to 'sent'
                await Services.labs.update(token, labOrderId, { status: 'sent' });

                // Don't close immediately, show label
                onShipmentCreated();
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao criar envio');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
                {labelUrl ? (
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                            <ScanBarcode size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Etiqueta Gerada!</h2>
                        <div className="bg-white border-4 border-slate-900 p-4 rounded-xl">
                            <img src={labelUrl} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
                            <p className="text-xs font-mono font-bold mt-2 text-slate-900 uppercase tracking-widest">
                                PARA: {labName || 'Laboratório'}
                            </p>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Imprima e cole na caixa de envio.</p>
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                            Concluir
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">Novo Envio</h2>
                            <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-indigo-50/50 p-4 rounded-xl flex gap-3 border border-indigo-100">
                                <Box className="text-indigo-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-indigo-400 uppercase">Item</p>
                                    <p className="font-bold text-indigo-900">Pedido #{labOrderId}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase">Transportadora</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['LOGGI', 'RAPPI', 'MOTOBOY'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setProvider(p)}
                                            className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all ${provider === p ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase">Custo de Envio (R$)</label>
                                <input
                                    type="number"
                                    value={cost}
                                    onChange={e => setCost(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processando...' : <><Truck size={18} /> Confirmar Envio</>}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
