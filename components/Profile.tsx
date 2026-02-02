import React from 'react';
import { UserRole } from '../types';
import { SectionHeader, LuxButton } from './Shared';
import { User, MapPin, Phone, Mail, FileBadge, Building, Upload, LogOut, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  userRole: UserRole;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userRole, onLogout }) => {

  const renderField = (label: string, icon: React.ReactNode, value: string, readOnly = false, type = "text", placeholder = "") => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-lux-text-secondary uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-3.5 text-lux-text-secondary group-focus-within:text-lux-accent transition-colors">
            {icon}
        </div>
        <input 
          type={type} 
          defaultValue={value}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 font-medium
            ${readOnly 
                ? 'bg-lux-subtle border-transparent text-lux-text-secondary cursor-not-allowed opacity-70' 
                : 'bg-lux-surface border-lux-border focus:border-lux-accent text-lux-text shadow-sm focus:ring-1 focus:ring-lux-accent/50'
            }
          `} 
        />
        {readOnly && (
            <span className="absolute right-4 top-3.5 text-[10px] uppercase font-bold text-lux-text-secondary bg-lux-border/30 px-2 py-0.5 rounded">
                Protegido
            </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-start justify-between">
          <SectionHeader 
            title="Meu Perfil" 
            subtitle={`Gerencie os dados da sua conta ${userRole === 'clinic_owner' ? 'Corporativa' : userRole === 'dentist' ? 'Profissional' : 'Pessoal'}.`}
          />
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition text-sm font-bold"
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Avatar e Selo LGPD */}
        <div className="lg:col-span-1 space-y-6">
           <div className="apple-card p-8 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-lux-subtle"></div>
              
              <div className="relative mt-4 mb-6">
                 <div className="w-32 h-32 rounded-full border-[6px] border-lux-surface shadow-2xl overflow-hidden bg-white relative">
                   <img 
                    src={userRole === 'clinic_owner' 
                        ? "https://ui-avatars.com/api/?name=Odonto+Center&background=0D8ABC&color=fff&size=256" 
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole}`
                    } 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                   />
                   
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer backdrop-blur-sm">
                      <Upload className="text-white w-8 h-8" />
                   </div>
                 </div>
              </div>

              <h3 className="text-xl font-bold text-lux-text">
                {userRole === 'clinic_owner' ? 'Odonto Center' : 'Ricardo Silva'}
              </h3>
              <p className="text-lux-text-secondary text-sm font-medium mb-6">
                {userRole === 'clinic_owner' ? 'Matriz - São Paulo' : userRole === 'dentist' ? 'Cirurgião Dentista' : 'Paciente VIP'}
              </p>

              <div className="w-full bg-lux-subtle p-3 rounded-xl border border-lux-border/50">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-lux-text-secondary">Plano</span>
                    <span className="font-bold text-lux-accent">Premium</span>
                </div>
              </div>
           </div>

           {/* Selo LGPD */}
           <div className="apple-card p-4 flex items-center gap-3 border border-emerald-100 bg-emerald-50/50">
               <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
               <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase">Dados Protegidos</h4>
                  <p className="text-[10px] text-emerald-700 leading-tight">Em conformidade com a Lei 13.709/18 (LGPD). Seus dados são criptografados.</p>
               </div>
           </div>
        </div>

        {/* Coluna Direita: Formulário */}
        <div className="lg:col-span-2">
           <div className="apple-card p-8 space-y-8">
              
              {/* Dados Pessoais Comuns */}
              <div className="space-y-6">
                  <h4 className="text-sm font-black text-lux-text uppercase tracking-widest border-b border-lux-border pb-2">
                    Dados Básicos
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderField("Nome", <User size={18}/>, userRole === 'clinic_owner' ? "Ricardo" : "Ricardo")}
                      {renderField("Sobrenome", <User size={18}/>, "Silva")}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderField("CPF", <FileBadge size={18}/>, "123.456.789-00", true)} {/* CPF Read Only */}
                      {renderField("Data de Nascimento", <User size={18}/>, "1985-05-20", false, "date")}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderField("Celular", <Phone size={18}/>, "(11) 99999-8888")}
                      {renderField("E-mail", <Mail size={18}/>, "ricardo@dentis.com")}
                  </div>
              </div>

              {/* Endereço Completo (Para Todos) */}
              <div className="space-y-6">
                 <h4 className="text-sm font-black text-lux-text uppercase tracking-widest border-b border-lux-border pb-2">
                    Endereço
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2">
                        {renderField("Rua", <MapPin size={18}/>, "Rua das Flores", false, "text")}
                     </div>
                     <div>
                        {renderField("Número", <MapPin size={18}/>, "123", false, "text")}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {renderField("Bairro", <MapPin size={18}/>, "Jardins", false, "text")}
                     {renderField("Cidade/UF", <MapPin size={18}/>, "São Paulo / SP", false, "text")}
                  </div>
              </div>

              {/* Campos Específicos da Clínica */}
              {userRole === 'clinic_owner' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <h4 className="text-sm font-black text-lux-text uppercase tracking-widest border-b border-lux-border pb-2">
                        Dados da Clínica
                    </h4>
                    {renderField("Nome Fantasia", <Building size={18}/>, "Odonto Center Premium")}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField("CNPJ", <FileBadge size={18}/>, "00.000.000/0001-99", true)}
                        {renderField("Responsável Técnico", <User size={18}/>, "Dr. Ricardo Silva")}
                    </div>
                </div>
              )}

              {/* Botão Salvar Fixo no Final */}
              <div className="pt-4 flex justify-end">
                <LuxButton>Salvar Alterações</LuxButton>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;