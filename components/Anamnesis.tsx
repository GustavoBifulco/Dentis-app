import React from 'react';
import { SectionHeader, LuxButton, IslandCard } from './Shared';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const Anamnesis: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SectionHeader 
        title="Ficha de Anamnese" 
        subtitle="Preencha este formulário para que possamos conhecer melhor seu histórico de saúde."
      />

      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600" size={20} />
          <p className="text-sm text-emerald-800 font-medium">Conectado à clínica <strong>Odonto Center Premium</strong>. Seus dados serão enviados com segurança.</p>
      </div>

      <div className="space-y-8">
          {/* Bloco 1: Saúde Geral */}
          <IslandCard className="p-8">
             <div className="flex items-center gap-3 mb-6 border-b border-lux-border pb-4">
                <div className="w-8 h-8 rounded-full bg-lux-subtle flex items-center justify-center text-lux-text font-bold">1</div>
                <h3 className="font-bold text-lux-text text-lg">Saúde Geral</h3>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-lux-text">Você está sob tratamento médico atualmente?</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="treatment" className="accent-lux-accent w-4 h-4" />
                            <span className="text-lux-text-secondary">Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="treatment" className="accent-lux-accent w-4 h-4" />
                            <span className="text-lux-text-secondary">Não</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-lux-text">Possui alguma alergia a medicamentos?</label>
                    <input type="text" className="apple-input w-full p-3 text-sm" placeholder="Ex: Penicilina, Dipirona..." />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-lux-text">Toma algum medicamento de uso contínuo?</label>
                    <textarea className="apple-input w-full p-3 text-sm h-24 resize-none" placeholder="Liste os medicamentos e dosagens..."></textarea>
                </div>
             </div>
          </IslandCard>

          {/* Bloco 2: Saúde Bucal */}
          <IslandCard className="p-8">
             <div className="flex items-center gap-3 mb-6 border-b border-lux-border pb-4">
                <div className="w-8 h-8 rounded-full bg-lux-subtle flex items-center justify-center text-lux-text font-bold">2</div>
                <h3 className="font-bold text-lux-text text-lg">Histórico Odontológico</h3>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-lux-text">Qual o motivo principal da sua consulta?</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Dor', 'Estética', 'Limpeza', 'Implante', 'Ortodontia', 'Outro'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer border border-lux-border p-3 rounded-lg hover:bg-lux-subtle transition">
                                <input type="checkbox" className="accent-lux-accent w-4 h-4" />
                                <span className="text-sm text-lux-text">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-lux-text">Sente sensibilidade nos dentes?</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="sens" className="accent-lux-accent w-4 h-4" />
                            <span className="text-lux-text-secondary">Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="sens" className="accent-lux-accent w-4 h-4" />
                            <span className="text-lux-text-secondary">Não</span>
                        </label>
                    </div>
                </div>
             </div>
          </IslandCard>
      </div>

      <div className="flex justify-end pt-4 pb-20">
         <LuxButton icon={<ArrowRight size={18} />}>Enviar Anamnese</LuxButton>
      </div>
    </div>
  );
};

export default Anamnesis;