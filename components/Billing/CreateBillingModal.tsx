
import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Receipt, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { LuxButton } from '../Shared';
import { useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../../lib/useAppContext';
import { useI18n } from '../../lib/i18n';

interface CreateBillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: number;
    patientName: string;
    appointmentId?: number;
    onSuccess?: (charge: any) => void;
}

const CreateBillingModal: React.FC<CreateBillingModalProps> = ({
    isOpen,
    onClose,
    patientId,
    patientName,
    appointmentId,
    onSuccess
}) => {
    const { getToken } = useAuth();
    const { showToast } = useAppContext();
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [form, setForm] = useState({
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        method: 'PIX',
        description: ''
    });

    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async () => {
        if (!form.amount || Number(form.amount) <= 0) {
            showToast(t('finance.invalidValue'), 'error');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch('/api/billing/charges', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId,
                    appointmentId,
                    amount: form.amount,
                    method: form.method,
                    dueDate: form.dueDate,
                    description: form.description
                })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                showToast(t('finance.chargeCreated'), 'success');
                onSuccess?.(data);
            } else {
                const err = await res.json();
                throw new Error(err.error || t('finance.createChargeError'));
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('finance.createCharge')}</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            {t('finance.patient')}: <span className="text-blue-600">{patientName}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all h-fit">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {!result ? (
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('finance.amount')}</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black tracking-tight outline-none focus:border-blue-500 focus:bg-white transition-all text-xl"
                                    placeholder="0,00"
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('finance.dueDate')}</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    value={form.dueDate}
                                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('finance.method')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'PIX', label: 'PIX', icon: QrCode, color: 'text-emerald-600' },
                                    { id: 'BOLETO', label: 'Boleto', icon: Receipt, color: 'text-orange-600' }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setForm({ ...form, method: m.id })}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${form.method === m.id
                                            ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-lg shadow-blue-500/10'
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        <m.icon size={20} className={form.method === m.id ? m.color : ''} />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('finance.description')}</label>
                            <textarea
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-500 focus:bg-white transition-all min-h-[100px]"
                                placeholder="Descreva o motivo da cobrança..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="pt-4">
                            <LuxButton
                                className="w-full py-6 rounded-2xl shadow-xl shadow-blue-600/20 font-black uppercase tracking-widest text-sm h-16"
                                onClick={handleCreate}
                                disabled={loading}
                                icon={loading ? <Loader2 className="animate-spin" /> : <Banknote size={20} />}
                            >
                                {loading ? t('finance.generating') : t('finance.generateNow')}
                            </LuxButton>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 space-y-8 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-100">
                            <Check size={40} strokeWidth={3} />
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{t('finance.successTitle')}</h4>
                            <p className="text-slate-500 text-sm">{t('finance.successDesc', { method: form.method })}</p>
                        </div>

                        {form.method === 'PIX' && result.pix && (
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4">
                                {result.pix.image && (
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                        <img src={`data:image/png;base64,${result.pix.image}`} alt="PIX QR Code" className="w-48 h-48" />
                                    </div>
                                )}
                                <div className="w-full flex flex-col gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('finance.copyCode')}</p>
                                    <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden p-1">
                                        <input
                                            readOnly
                                            className="flex-1 bg-transparent border-none text-[10px] font-mono px-3 py-2 outline-none"
                                            value={result.pix.payload}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(result.pix.payload)}
                                            className="bg-slate-900 text-white p-2 rounded-lg hover:bg-black transition-colors"
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {form.method === 'BOLETO' && result.bankSlipUrl && (
                            <div className="space-y-4">
                                <a
                                    href={result.bankSlipUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-700 transition-all"
                                >
                                    <Receipt size={24} /> {t('finance.openBoleto')}
                                </a>
                            </div>
                        )}

                        {result.invoiceUrl && (
                            <a
                                href={result.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm font-bold text-blue-600 hover:underline"
                            >
                                {t('finance.paymentLink')}
                            </a>
                        )}

                        <div className="pt-4 border-t border-slate-50">
                            <LuxButton variant="outline" className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest" onClick={onClose}>
                                {t('finance.closeManual')}
                            </LuxButton>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default CreateBillingModal;
