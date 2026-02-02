import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Package, CheckCircle2, ShieldCheck, DollarSign, Power, History } from 'lucide-react';

interface Job {
    id: number;
    clinicName: string;
    labName: string;
    distance: number; // km
    price: number; // R$
    pickupAddress: string;
    deliveryAddress: string;
    status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED';
}

const CourierApp: React.FC = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [activeJob, setActiveJob] = useState<Job | null>(null);
    const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
    const [earnings, setEarnings] = useState(120.50);
    const [validationCode, setValidationCode] = useState('');

    // Mock Fetching Jobs
    useEffect(() => {
        if (isOnline) {
            // Simulate polling
            const mockJobs: Job[] = [
                {
                    id: 101,
                    clinicName: "Clínica Sorriso",
                    labName: "ProteseArt",
                    distance: 3.2,
                    price: 15.00,
                    pickupAddress: "Rua das Flores, 123",
                    deliveryAddress: "Av. Industrial, 900",
                    status: 'PENDING'
                },
                {
                    id: 102,
                    clinicName: "Dr. Roberto",
                    labName: "Lentes Premium",
                    distance: 5.8,
                    price: 22.50,
                    pickupAddress: "Alameda Santos, 400",
                    deliveryAddress: "Rua Pamplona, 120",
                    status: 'PENDING'
                }
            ];
            setTimeout(() => setAvailableJobs(mockJobs), 1000);
        } else {
            setAvailableJobs([]);
        }
    }, [isOnline]);

    const handleToggleOnline = () => {
        setIsOnline(!isOnline);
        // API Call to update status
    };

    const handleAcceptJob = (job: Job) => {
        setActiveJob({ ...job, status: 'ACCEPTED' });
        setAvailableJobs([]); // Clear others
    };

    const openWaze = (address: string) => {
        // Deep link example
        window.location.href = `https://waze.com/ul?q=${encodeURIComponent(address)}`;
    };

    const handleStatusUpdate = () => {
        if (!activeJob) return;

        if (activeJob.status === 'ACCEPTED') {
            setActiveJob({ ...activeJob, status: 'PICKED_UP' });
        } else if (activeJob.status === 'PICKED_UP') {
            // Validate Code logic here
            if (validationCode.length < 4) {
                alert("Digite o código de segurança!");
                return;
            }
            setActiveJob({ ...activeJob, status: 'DELIVERED' });
            setEarnings(prev => prev + activeJob.price);
            setTimeout(() => {
                setActiveJob(null); // Back to list
                setValidationCode('');
            }, 2000); // Show success then close
        }
    };

    // --- RENDER ---

    if (activeJob?.status === 'DELIVERED') {
        return (
            <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center text-white p-6">
                <CheckCircle2 size={80} className="mb-4" />
                <h1 className="text-4xl font-black uppercase mb-2">Sucesso!</h1>
                <p className="text-xl">Corrida finalizada.</p>
                <p className="text-3xl font-bold mt-4">+ R$ {activeJob.price.toFixed(2)}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans pb-safe">

            {/* HEADER STATUS */}
            <div className={`p-6 pb-8 rounded-b-3xl shadow-xl transition-colors duration-500 ${isOnline ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold opacity-80">Olá, Motoboy</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="font-bold tracking-wide">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-wider opacity-70">Ganhos Hoje</p>
                        <p className="text-2xl font-black text-green-400">R$ {earnings.toFixed(2)}</p>
                    </div>
                </div>

                {/* BIG TOGGLE BUTTON */}
                {!activeJob && (
                    <button
                        onClick={handleToggleOnline}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 ${isOnline
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-slate-900'
                            }`}
                    >
                        <Power size={24} strokeWidth={3} />
                        {isOnline ? 'Ficar Offline' : 'Ficar Online'}
                    </button>
                )}
            </div>

            {/* ACTIVE JOB MODE */}
            {activeJob && activeJob.status !== 'DELIVERED' && (
                <div className="p-4 space-y-4 -mt-4 relative z-10">
                    {/* STATUS CARD */}
                    <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl border-l-8 border-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                                    {activeJob.status === 'ACCEPTED' ? 'Busca em Andamento' : 'Entrega em Andamento'}
                                </p>
                                <h3 className="text-2xl font-black">
                                    {activeJob.status === 'ACCEPTED' ? activeJob.clinicName : activeJob.labName}
                                </h3>
                            </div>
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Navigation size={24} className="text-indigo-600" />
                            </div>
                        </div>

                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            {activeJob.status === 'ACCEPTED' ? activeJob.pickupAddress : activeJob.deliveryAddress}
                        </p>

                        {/* WAZE BUTTON */}
                        <button
                            onClick={() => openWaze(activeJob.status === 'ACCEPTED' ? activeJob.pickupAddress : activeJob.deliveryAddress)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 mb-3 shadow-lg active:translate-y-1"
                        >
                            <Navigation size={20} />
                            Abrir no Maps
                        </button>
                    </div>

                    {/* ACTION CARD */}
                    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                        {activeJob.status === 'ACCEPTED' ? (
                            <button
                                onClick={handleStatusUpdate}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-xl text-xl shadow-lg shadow-indigo-900/50 active:scale-95"
                            >
                                Cheguei na Coleta
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-600">
                                    <label className="text-xs uppercase text-slate-400 font-bold mb-2 block">Código de Segurança (Pedir ao Lab)</label>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="text-green-400" size={32} />
                                        <input
                                            type="number"
                                            value={validationCode}
                                            onChange={(e) => setValidationCode(e.target.value)}
                                            placeholder="0000"
                                            className="flex-1 bg-transparent text-3xl font-mono text-white placeholder-slate-600 focus:outline-none tracking-widest"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={validationCode.length < 4}
                                    className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black py-5 rounded-xl text-xl shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                                >
                                    Validar & Finalizar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* JOB LIST (ONLY IF ONLINE & NO ACTIVE JOB) */}
            {isOnline && !activeJob && (
                <div className="p-4 space-y-4">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider ml-2">Disponíveis ({availableJobs.length})</h3>

                    {availableJobs.map(job => (
                        <div key={job.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-indigo-500 transition-colors relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-500/20 text-green-400 p-1.5 rounded-lg">
                                        <DollarSign size={16} strokeWidth={3} />
                                    </div>
                                    <span className="text-2xl font-black text-white">R$ {job.price.toFixed(2)}</span>
                                </div>
                                <span className="text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded text-sm">{job.distance} km</span>
                            </div>

                            <div className="space-y-3 mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                    <p className="text-slate-300 font-medium">{job.clinicName}</p>
                                </div>
                                <div className="w-0.5 h-3 bg-slate-700 ml-[3px]"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                                    <p className="text-slate-300 font-medium">{job.labName}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAcceptJob(job)}
                                className="w-full bg-white hover:bg-indigo-50 text-slate-900 font-bold py-3 rounded-xl uppercase tracking-wider text-sm shadow-lg active:translate-y-1 transition-all"
                            >
                                Aceitar Corrida
                            </button>
                        </div>
                    ))}

                    {availableJobs.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <MapPin className="mx-auto mb-3" size={40} />
                            <p>Procurando corridas próximas...</p>
                        </div>
                    )}
                </div>
            )}

            {/* FOOTER NAV (MOCKED) */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 p-4 flex justify-around">
                <button className="flex flex-col items-center gap-1 text-indigo-400">
                    <Navigation size={24} />
                    <span className="text-[10px] font-bold">Corridas</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-500">
                    <History size={24} />
                    <span className="text-[10px] font-bold">Histórico</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-500">
                    <Package size={24} />
                    <span className="text-[10px] font-bold">Entregas</span>
                </button>
            </div>

        </div>
    );
};

export default CourierApp;
