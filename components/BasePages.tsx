import React from 'react';
import { SectionHeader, EmptyState } from './Shared';
import { Shield, HelpCircle, Database, FileText } from 'lucide-react';

export const Terms: React.FC = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeader title="Termos e Privacidade" subtitle="Documentos legais e políticas de uso." />
        <EmptyState
            title="Em Construção"
            description="Esta página conterá os Termos de Uso e Política de Privacidade detalhados."
        />
    </div>
);

export const Help: React.FC = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeader title="Ajuda e Suporte" subtitle="Central de ajuda e documentação." />
        <EmptyState
            title="Central de Ajuda"
            description="Tutoriais e FAQs estarão disponíveis aqui em breve."
        />
    </div>
);

export const Backup: React.FC = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeader title="Backup e Dados" subtitle="Gerencie seus dados e exportações." />
        <EmptyState
            title="Gerenciamento de Dados"
            description="Ferramentas para exportação e backup dos seus dados clínicos."
        />
    </div>
);
