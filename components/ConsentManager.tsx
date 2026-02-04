import React, { useState, useEffect } from 'react';
import { FileSignature, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Consent {
    id: number;
    title: string;
    description?: string;
    signedAt: string;
    signedByIp: string;
    content: string;
}

interface ConsentManagerProps {
    patientId: number;
}

const TEMPLATES = [
    { title: 'Consentimento Geral', content: '<p>Autorizo a realização dos procedimentos...</p>' },
    { title: 'Uso de Imagem', content: '<p>Autorizo o uso de minha imagem para fins...</p>' },
    { title: 'Procedimento Cirúrgico', content: '<p>Estou ciente dos riscos e benefícios...</p>' },
];

const ConsentManager: React.FC<ConsentManagerProps> = ({ patientId }) => {
    const { getToken } = useAuth();
    const [consents, setConsents] = useState<Consent[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchConsents();
    }, [patientId]);

    const fetchConsents = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`/api/records/consents/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setConsents(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleSign = async () => {
        if (selectedTemplate === null) return;
        setLoading(true);
        try {
            const token = await getToken();
            const template = TEMPLATES[selectedTemplate];

            const res = await fetch('/api/records/consents', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId,
                    title: template.title,
                    content: template.content
                })
            });

            if (res.ok) {
                fetchConsents();
                setSelectedTemplate(null);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Signed Consents */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-emerald-500" /> Termos Assinados
                </h3>

                {consents.length === 0 ? (
                    <p className="text-slate-400 text-sm">Nenhum termo assinado digitalmente.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consents.map(consent => (
                            <div key={consent.id} className="border border-emerald-100 bg-emerald-50/50 p-4 rounded-xl flex items-start gap-3">
                                <CheckCircle className="text-emerald-500 mt-1" size={18} />
                                <div>
                                    <h4 className="font-bold text-emerald-900">{consent.title}</h4>
                                    <p className="text-xs text-emerald-700 mt-1">
                                        Assinado em {format(new Date(consent.signedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 font-mono mt-1">IP: {consent.signedByIp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Consent */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileSignature size={20} className="text-blue-500" /> Coletar Assinatura
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {TEMPLATES.map((tmpl, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedTemplate(idx)}
                            className={`cursor-pointer p-4 rounded-xl border transition-all ${selectedTemplate === idx
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                }`}
                        >
                            <h4 className="font-bold text-slate-700 text-sm">{tmpl.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">Clique para selecionar</p>
                        </div>
                    ))}
                </div>

                {selectedTemplate !== null && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in slide-in-from-top-4">
                        <h4 className="font-bold text-slate-900 mb-2">Pré-visualização</h4>
                        <div className="bg-white p-4 border border-slate-200 rounded-lg text-sm text-slate-600 mb-6 min-h-[100px]"
                            dangerouslySetInnerHTML={{ __html: TEMPLATES[selectedTemplate].content }} />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="px-4 py-2 text-sm text-slate-600 font-bold hover:bg-slate-200 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSign}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Registrando...' : 'Coletar Assinatura Digital'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsentManager;
