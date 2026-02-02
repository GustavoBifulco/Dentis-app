import React, { useState, useEffect } from 'react';
import { IslandCard, LuxButton, SectionHeader } from './Shared';
import { Plus, Check, AlertCircle, Mic, MicOff } from 'lucide-react';
import { useDentalVoice } from './VoiceControl'; // Hook de Voz

// Representação abstrata dos dentes
const TEETH_MAP = [
  { id: 18, label: '18', status: 'healthy' }, { id: 17, label: '17', status: 'treatment' },
  { id: 16, label: '16', status: 'healthy' }, { id: 15, label: '15', status: 'healthy' },
  { id: 14, label: '14', status: 'missing' }, { id: 13, label: '13', status: 'healthy' },
  { id: 12, label: '12', status: 'healthy' }, { id: 11, label: '11', status: 'healthy' },
  { id: 21, label: '21', status: 'healthy' }, { id: 22, label: '22', status: 'restored' },
  { id: 23, label: '23', status: 'healthy' }, { id: 24, label: '24', status: 'healthy' },
  { id: 25, label: '25', status: 'healthy' }, { id: 26, label: '26', status: 'healthy' },
  { id: 27, label: '27', status: 'healthy' }, { id: 28, label: '28', status: 'healthy' },
];

const Odontogram: React.FC = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // --- INTEGRAÇÃO DE VOZ ---
  const { isListening, lastCommand, intent, toggleListening } = useDentalVoice();

  // Reação aos comandos de voz
  useEffect(() => {
    if (intent && intent.type === 'TOOTH') {
      const toothNum = intent.tooth;
      // Verifica se o dente existe no mapa (simplificado)
      if (toothNum >= 11 && toothNum <= 48) {
        setSelectedTooth(toothNum);
      }
    }
  }, [intent]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">

      {/* Header com Controle de Voz */}
      <div className="flex justify-between items-end mb-6">
        <SectionHeader title="Execução Clínica" subtitle="Selecione um elemento para registrar procedimentos." />

        <div className="flex flex-col items-end gap-2">
          {lastCommand && (
            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              "{lastCommand}"
            </span>
          )}
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all border ${isListening
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-lg'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            {isListening ? 'Ouvindo...' : 'Comando de Voz'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">
        {/* MAPA VISUAL (Esquerda) */}
        <div className="lg:col-span-2 h-full">
          <IslandCard className="h-full flex flex-col justify-center items-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-6 left-6 flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-white border border-slate-200"></div> Saudável
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-rose-100 border border-rose-300"></div> Em Tratamento
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div> Restaurado
              </div>
            </div>

            {/* Arco Superior */}
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {TEETH_MAP.map(tooth => (
                <button
                  key={tooth.id}
                  onClick={() => setSelectedTooth(tooth.id)}
                  className={`
                    w-12 h-16 rounded-xl border-2 flex flex-col items-center justify-end pb-2 transition-all duration-300
                    ${selectedTooth === tooth.id ? 'scale-110 shadow-xl border-slate-900 z-10' : 'hover:-translate-y-1'}
                    ${tooth.status === 'treatment' ? 'bg-rose-50 border-rose-200 text-rose-500' :
                      tooth.status === 'restored' ? 'bg-blue-50 border-blue-200 text-blue-500' :
                        tooth.status === 'missing' ? 'opacity-30 border-dashed bg-transparent' : 'bg-white border-slate-200 text-slate-400'}
                  `}
                >
                  <span className="text-xs font-black">{tooth.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">
              Arco Superior (Vista Vestibular)
            </div>

          </IslandCard>
        </div>

        {/* PAINEL DE AÇÃO (Direita) */}
        <div className="flex flex-col gap-6 h-full">
          {selectedTooth ? (
            <IslandCard className="flex-1 p-6 animate-in slide-in-from-right-4 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">Dente {selectedTooth}</h3>
                <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Cárie Oclusal</span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Procedimentos Sugeridos</p>

                <button className="w-full p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-900 hover:shadow-lg transition-all text-left group">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Restauração 1 Face</span>
                    <span className="font-black text-slate-900">R$ 350</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 group-hover:text-blue-600">Resina Z350 • 45 min</p>
                </button>

                <button className="w-full p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-900 hover:shadow-lg transition-all text-left">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Endodontia (Canal)</span>
                    <span className="font-black text-slate-900">R$ 850</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Sessão Única</p>
                </button>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Observações</p>
                  <textarea className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none resize-none h-24" placeholder="Adicione notas clínicas aqui..."></textarea>
                </div>
                <LuxButton className="w-full justify-center" icon={<Plus size={18} />}>Adicionar ao Plano</LuxButton>
              </div>
            </IslandCard>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p className="text-center font-medium max-w-[200px]">Selecione um dente no mapa para lançar procedimentos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Odontogram;
