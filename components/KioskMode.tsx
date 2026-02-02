import React, { useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

type KioskPatient = {
  id: string;
  name?: string;
  fullName?: string;
  surname?: string;
  avatarUrl?: string;
  photoUrl?: string;
  cpf?: string;
};

type KioskAppointment = {
  id: string;
  startTime?: string;
  procedureName?: string;
  dentist?: { name?: string };
};

type KioskResponse = {
  ok: boolean;
  data?: {
    patient: KioskPatient;
    appointment: KioskAppointment | null;
    message?: string;
  };
  error?: string;
};

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const KioskMode: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [patient, setPatient] = useState<KioskPatient | null>(null);
  const [appointment, setAppointment] = useState<KioskAppointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kiosk/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
      });

      const data: KioskResponse = await response.json();

      if (!response.ok || !data.ok || !data.data) {
        setError(data.error || 'Falha ao localizar o paciente.');
        setLoading(false);
        return;
      }

      setPatient(data.data.patient);
      setAppointment(data.data.appointment || null);
      setStep('confirm');
    } catch (err) {
      setError('Falha de conexao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCpf('');
    setPatient(null);
    setAppointment(null);
    setError(null);
    setStep('input');
  };

  const displayName =
    patient?.name ||
    patient?.fullName ||
    [patient?.name, patient?.surname].filter(Boolean).join(' ') ||
    'Paciente';

  return (
    <div className="min-h-screen bg-lux-background text-lux-charcoal flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white border border-lux-border rounded-[2.5rem] shadow-xl p-10">
          <div className="flex flex-col items-center text-center gap-3 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-lux-subtle flex items-center justify-center text-lux-accent font-bold text-2xl">
              D
            </div>
            <h1 className="text-3xl md:text-4xl font-editorial font-medium tracking-tight">Check-in Digital</h1>
            <p className="text-sm text-lux-text-secondary max-w-md">
              Digite seu CPF para confirmar sua chegada e acelerar o atendimento.
            </p>
          </div>

          {step === 'input' && (
            <form onSubmit={handleCheckin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-lux-text-secondary">
                  CPF do Paciente
                </label>
                <input
                  type="text"
                  value={formatCpf(cpf)}
                  onChange={(event) => setCpf(event.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full text-2xl md:text-3xl px-6 py-5 rounded-2xl border border-lux-border bg-lux-background focus:border-lux-accent outline-none transition"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cpf.replace(/\D/g, '').length < 11}
                className="w-full rounded-2xl bg-lux-charcoal text-white text-xl font-bold py-5 flex items-center justify-center gap-3 hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Check-in'}
              </button>
            </form>
          )}

          {step === 'confirm' && patient && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-6 bg-lux-subtle/60 border border-lux-border rounded-3xl p-6">
                <div className="w-24 h-24 rounded-2xl bg-white border border-lux-border overflow-hidden flex items-center justify-center">
                  {patient?.avatarUrl || patient?.photoUrl ? (
                    <img
                      src={patient.avatarUrl || patient.photoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-lux-charcoal">
                      {displayName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-lux-charcoal">{displayName}</h2>
                  <p className="text-sm text-lux-text-secondary">CPF: {patient.cpf || cpf}</p>
                  {appointment && (
                    <p className="text-sm text-lux-text-secondary mt-2">
                      Horario: {formatTime(appointment.startTime)} · {appointment.procedureName || 'Consulta'}
                    </p>
                  )}
                  {!appointment && (
                    <p className="text-sm text-rose-600 mt-2">Nenhum horario encontrado para hoje.</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStep('success')}
                className="w-full rounded-2xl bg-lux-gold text-white text-xl font-bold py-5 hover:opacity-90 transition"
              >
                Confirmar Dados
              </button>

              <button
                onClick={handleReset}
                className="w-full rounded-2xl border border-lux-border text-lux-charcoal text-base font-medium py-4 hover:bg-lux-subtle transition"
              >
                Corrigir CPF
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-600" size={36} />
                </div>
                <h2 className="text-3xl font-bold text-lux-charcoal">Check-in confirmado</h2>
                <p className="text-lux-text-secondary">Aguarde na recepção.</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full rounded-2xl bg-lux-charcoal text-white text-lg font-bold py-5 hover:opacity-90 transition"
              >
                Novo Check-in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskMode;
