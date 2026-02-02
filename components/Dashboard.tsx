import React from 'react';
import { ContextType, ViewType } from '../types';
import ClinicalDashboard from './dashboards/ClinicalDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import LabDashboard from './LabDashboard';
import CourierApp from './CourierApp';

interface DashboardProps {
   activeContextType: ContextType | null;
   onNavigate?: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeContextType, onNavigate }) => {
   if (!activeContextType) {
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-center">
               <h2 className="text-2xl font-bold text-lux-text mb-2">Nenhum Contexto Ativo</h2>
               <p className="text-lux-text-secondary">Selecione um contexto no menu lateral.</p>
            </div>
         </div>
      );
   }

   switch (activeContextType) {
      case 'CLINIC':
         return <ClinicalDashboard />;

      case 'LAB':
         return <LabDashboard />;

      case 'PATIENT':
         return <PatientDashboard onNavigate={onNavigate} />;

      case 'COURIER':
         return <CourierApp />;

      default:
         return (
            <div className="flex items-center justify-center h-screen">
               <div className="text-center">
                  <h2 className="text-2xl font-bold text-lux-text mb-2">Contexto Desconhecido</h2>
                  <p className="text-lux-text-secondary">Tipo de contexto não suportado: {activeContextType}</p>
               </div>
            </div>
         );
   }
};

export default Dashboard;