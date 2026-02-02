import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { completeOnboarding } from '../lib/api';

export default function Onboarding() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: 'dentist',
    cpf: '',
    cro: '',
    phone: ''
  });

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await completeOnboarding({
        userId: user.id,
        name: user.fullName,
        ...formData
      });
      window.location.href = '/dashboard';
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-2xl mt-10 border border-blue-50">
      <h1 className="text-2xl font-bold mb-2 text-blue-900">Configuração do Perfil</h1>
      <p className="mb-6 text-gray-500">Olá {user?.firstName}, preencha os dados da sua clínica.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Tipo de Conta</label>
          <select 
            className="w-full p-2.5 border rounded-lg mt-1 text-black bg-gray-50"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="dentist">Dentista Autônomo</option>
            <option value="clinic_owner">Dono de Clínica / Gestor</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">CPF</label>
            <input type="text" className="w-full p-2.5 border rounded-lg mt-1 text-black" 
              onChange={(e) => setFormData({...formData, cpf: e.target.value})} placeholder="000.000..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">CRO (se dentista)</label>
            <input type="text" className="w-full p-2.5 border rounded-lg mt-1 text-black" 
              onChange={(e) => setFormData({...formData, cro: e.target.value})} placeholder="UF-0000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Telefone Contato</label>
          <input type="text" className="w-full p-2.5 border rounded-lg mt-1 text-black" 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="(00) 90000-0000" />
        </div>
      </div>

      <button 
        onClick={handleFinish}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-8 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
      >
        {loading ? "Criando seu ambiente..." : "Finalizar Configuração"}
      </button>
    </div>
  );
}
