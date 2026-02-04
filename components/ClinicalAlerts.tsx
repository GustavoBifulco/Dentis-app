import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Plus, X } from 'lucide-react';

interface Alert {
    id: number;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    active: boolean;
}

interface ClinicalAlertsProps {
    alerts: Alert[];
    onAddAlert?: (alert: Partial<Alert>) => void;
    onResolveAlert?: (id: number) => void;
}

const ClinicalAlerts: React.FC<ClinicalAlertsProps> = ({ alerts, onAddAlert }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newAlert, setNewAlert] = useState({ description: '', severity: 'medium', type: 'condition' });

    const handleAdd = () => {
        if (!newAlert.description) return;
        onAddAlert?.({ ...newAlert, active: true } as any);
        setNewAlert({ description: '', severity: 'medium', type: 'condition' });
        setIsAdding(false);
    };

    const hasHighRisk = alerts.some(a => a.severity === 'high');

    return (
        <div className={`rounded-xl border transition-all ${hasHighRisk ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {hasHighRisk ? (
                        <ShieldAlert className="text-red-600 animate-pulse" />
                    ) : (
                        <AlertTriangle className="text-amber-500" />
                    )}
                    <h3 className={`font-bold ${hasHighRisk ? 'text-red-800' : 'text-slate-700'}`}>
                        Alertas Clínicos ({alerts.length})
                    </h3>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs flex items-center gap-1 font-bold text-slate-500 hover:text-blue-600 px-2 py-1 hover:bg-slate-100 rounded-md transition-colors"
                >
                    <Plus size={14} /> Adicionar
                </button>
            </div>

            {(alerts.length > 0 || isAdding) && (
                <div className="px-4 pb-4 space-y-2">
                    {isAdding && (
                        <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm animate-in slide-in-from-top-2">
                            <input
                                autoFocus
                                className="w-full text-sm p-2 border border-slate-200 rounded mb-2 outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Descreva o alerta (ex: Alergia a Dipirona)"
                                value={newAlert.description}
                                onChange={e => setNewAlert(p => ({ ...p, description: e.target.value }))}
                            />
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <select
                                        className="text-xs p-1 rounded border border-slate-200"
                                        value={newAlert.severity}
                                        onChange={e => setNewAlert(p => ({ ...p, severity: e.target.value }))}
                                    >
                                        <option value="low">Baixo Risco</option>
                                        <option value="medium">Médio</option>
                                        <option value="high">Alto Risco</option>
                                    </select>
                                    <select
                                        className="text-xs p-1 rounded border border-slate-200"
                                        value={newAlert.type}
                                        onChange={e => setNewAlert(p => ({ ...p, type: e.target.value }))}
                                    >
                                        <option value="allergy">Alergia</option>
                                        <option value="condition">Condição</option>
                                        <option value="observation">Observação</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsAdding(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancelar</button>
                                    <button onClick={handleAdd} className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-bold hover:bg-blue-700">Salvar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {alerts.map(alert => (
                        <div
                            key={alert.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${alert.severity === 'high' ? 'bg-red-50 border-red-100 text-red-800' :
                                    alert.severity === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                        'bg-slate-50 border-slate-100 text-slate-600'
                                }`}
                        >
                            <span className={`mt-0.5 w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' :
                                    alert.severity === 'medium' ? 'bg-amber-500' :
                                        'bg-slate-400'
                                }`} />
                            <div className="flex-1">
                                <span className="font-bold mr-2 uppercase text-[10px] tracking-wider opacity-70">{alert.type}</span>
                                {alert.description}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClinicalAlerts;
