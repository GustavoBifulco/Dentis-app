import { useUser, useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export default function PatientPortal() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [finance, setFinance] = useState({ balance: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = await getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [resApp, resRec, resFin] = await Promise.all([
          fetch('/api/appointments/me', { headers }),
          fetch('/api/clinical/me', { headers }),
          fetch('/api/finance/me', { headers }),
        ]);

        setAppointments(await resApp.json());
        setRecords(await resRec.json());
        setFinance(await resFin.json());
      } catch (err) {
        console.error('Erro ao carregar dados do paciente:', err);
      }
    };

    fetchData();
  }, [user, getToken]);

  if (!user) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bem-vindo, {(user.publicMetadata?.name as string) || 'Paciente'}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Próximos Agendamentos</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">Nenhum agendamento futuro.</p>
        ) : (
          <ul className="space-y-3">
            {appointments.map(a => (
              <li key={a.id} className="border p-4 rounded-lg bg-white shadow-sm">
                <div className="font-medium">
                  {new Date(a.startTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
                <div className="text-sm text-gray-600">Status: {a.status}</div>
                {a.notes && <p className="text-sm mt-1">{a.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Histórico de Tratamentos</h2>
        {records.length === 0 ? (
          <p className="text-gray-600">Nenhum registro ainda.</p>
        ) : (
          <ul className="space-y-3">
            {records.map(r => (
              <li key={r.id} className="border p-4 rounded-lg bg-white shadow-sm">
                <div className="font-medium">
                  {new Date(r.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-sm">{r.treatment}</div>
                {r.notes && <p className="text-sm text-gray-600 mt-1">{r.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Financeiro</h2>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-lg font-medium">
            Saldo pendente: R$ {(finance.balance / 100).toFixed(2)}
          </p>
        </div>
      </section>
    </div>
  );
}
