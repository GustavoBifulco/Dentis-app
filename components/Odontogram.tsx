import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

interface ToothState {
  tooth: number;
  surface: string;
  condition: string;
  notes?: string;
}

const TEETH_ADULT = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

// Simplified status mapping
const STATUS_COLORS: Record<string, string> = {
  'healthy': 'bg-white border-slate-300',
  'decay': 'bg-red-100 border-red-500 text-red-500',
  'restoration': 'bg-blue-100 border-blue-500 text-blue-500',
  'missing': 'bg-slate-800 border-slate-900 text-slate-400 opacity-50',
  'crown': 'bg-amber-100 border-amber-500 text-amber-600',
  'canal': 'bg-purple-100 border-purple-500 text-purple-600'
};

const Odontogram = () => {
  // For MVP, we pass patientId via context or props. 
  // Assuming context isn't fully robust yet, we might need to rely on parent props.
  // However, Odontogram is used inside PatientRecord which has activePatient.
  // We should probably accept `patientId` as prop.
  return <p className="text-red-500">Error: Missing patientId prop</p>;
};

interface OdontogramProps {
  patientId: number;
}

const OdontogramComponent: React.FC<OdontogramProps> = ({ patientId }) => {
  const { getToken } = useAuth();
  const [teethState, setTeethState] = useState<Record<number, ToothState>>({});
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOdontogram();
  }, [patientId]);

  const fetchOdontogram = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/records/odontogram/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: ToothState[] = await res.json();
        const map: Record<number, ToothState> = {};
        data.forEach(t => map[t.tooth] = t);
        setTeethState(map);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateTooth = async (condition: string) => {
    if (!selectedTooth) return;

    // Optimistic update
    const newState = {
      tooth: selectedTooth,
      surface: 'whole',
      condition,
      status: 'current'
    };

    setTeethState(prev => ({ ...prev, [selectedTooth]: newState }));

    try {
      const token = await getToken();
      await fetch('/api/records/odontogram', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientId, ...newState })
      });
      setSelectedTooth(null);
    } catch (e) {
      console.error("Failed to save");
      fetchOdontogram(); // Revert
    }
  };

  const renderTooth = (id: number) => {
    const state = teethState[id];
    const condition = state?.condition || 'healthy';
    const style = STATUS_COLORS[condition] || STATUS_COLORS['healthy'];

    return (
      <div
        key={id}
        onClick={() => setSelectedTooth(id)}
        className={`
                    w-12 h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-sm
                    ${style} ${selectedTooth === id ? 'ring-4 ring-blue-200 z-10' : ''}
                `}
      >
        <span className="text-xs font-bold mb-1 opacity-50">{id}</span>
        {condition === 'missing' && <X size={20} />}
        {condition === 'decay' && <AlertCircle size={20} />}
        {condition === 'restoration' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Toolbar / Legend */}
      <div className="bg-white border-b border-slate-200 p-4 flex gap-4 overflow-x-auto text-xs">
        {Object.entries(STATUS_COLORS).map(([key, cls]) => (
          <div key={key} className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
            <div className={`w-3 h-3 rounded-full border ${cls.split(' ')[0]} ${cls.split(' ')[1]}`} />
            <span className="capitalize">{key}</span>
          </div>
        ))}
      </div>

      {/* Mouth Map */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-slate-50/50 p-8">
        {/* Maxilla (Upper) */}
        <div className="flex gap-2">
          {TEETH_ADULT.slice(0, 16).map(t => renderTooth(t))}
        </div>

        {/* Mandible (Lower) */}
        <div className="flex gap-2">
          {TEETH_ADULT.slice(16).map(t => renderTooth(t))}
        </div>
      </div>

      {/* Context Menu / Action Bar */}
      {selectedTooth && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex gap-4 animate-in slide-in-from-bottom-4">
          <div className="border-r pr-4 mr-2">
            <span className="text-xs font-bold text-slate-400 block uppercase">Dente</span>
            <span className="text-2xl font-black text-slate-800">{selectedTooth}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => updateTooth('healthy')} className="p-2 hover:bg-slate-100 rounded-lg flex flex-col items-center gap-1 min-w-[60px]">
              <Check className="text-green-500" /> <span className="text-[10px]">Saudável</span>
            </button>
            <button onClick={() => updateTooth('decay')} className="p-2 hover:bg-red-50 rounded-lg flex flex-col items-center gap-1 min-w-[60px]">
              <AlertCircle className="text-red-500" /> <span className="text-[10px]">Cárie</span>
            </button>
            <button onClick={() => updateTooth('restoration')} className="p-2 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-1 min-w-[60px]">
              <div className="w-5 h-5 bg-blue-500 rounded-full" /> <span className="text-[10px]">Restaurado</span>
            </button>
            <button onClick={() => updateTooth('missing')} className="p-2 hover:bg-slate-100 rounded-lg flex flex-col items-center gap-1 min-w-[60px]">
              <X className="text-slate-500" /> <span className="text-[10px]">Ausente</span>
            </button>
          </div>
          <button onClick={() => setSelectedTooth(null)} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1"><X size={12} /></button>
        </div>
      )}
    </div>
  );
};

export default OdontogramComponent;
