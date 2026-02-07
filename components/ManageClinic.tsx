import React, { useState, useEffect } from 'react';
import { useOrganization, useUser } from '@clerk/clerk-react';
import { SectionHeader, IslandCard, LuxButton } from './Shared';
import { Users, Mail, Shield, AlertTriangle, Check, UserPlus, Trash2 } from 'lucide-react';
import { UserRole } from '../types';
import { useAppContext } from '../lib/useAppContext';
import { useI18n } from '../lib/i18n';

const ROLES = [
    { value: 'dentist', label: 'Dentista' },
    { value: 'partner', label: 'Sócio' },
    { value: 'manager', label: 'Gerente' },
    { value: 'admin', label: 'Administrador' },
    { value: 'secretary', label: 'Secretário(a)' },
];

const ManageClinic: React.FC = () => {
    const { organization, isLoaded, memberships } = useOrganization({
        memberships: { infinite: true },
    });
    const { user } = useUser();
    const { showToast } = useAppContext();
    const { t } = useI18n();

    const [activeTab, setActiveTab] = useState<'team' | 'invites'>('team');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('dentist');
    const [loading, setLoading] = useState(false);

    // Invitation Handler
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !organization) return;

        try {
            setLoading(true);
            // Clerk expects standard roles 'admin' or 'member'.
            // We map our custom roles to metadata.
            // 'admin' -> Clerk 'admin', others -> Clerk 'member'
            const clerkRole = inviteRole === 'admin' || inviteRole === 'partner' ? 'org:admin' : 'org:member';

            await organization.inviteMember({
                emailAddress: inviteEmail,
                role: clerkRole,
            });

            // Note: Clerk Invitation API via client currently supports sending email.
            // Metadata support on invitation creation might be limited on client-side depending on settings.
            // Ideally we would update metadata after they accept, BUT:
            // We can try to rely on the backend hook or just set it later.
            // For now, we assume the simple invite works.

            showToast(t('settings.inviteSent'), 'success');
            setInviteEmail('');
            setActiveTab('team');

        } catch (err: any) {
            console.error(err);
            showToast(err.errors?.[0]?.message || t('settings.inviteError'), 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return <div className="p-8 text-center text-slate-500">Carregando dados da organização...</div>;

    if (!organization) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Acesso Restrito</h2>
                <p className="text-slate-500 max-w-md">
                    Esta área é exclusiva para gestão de clínicas (Organizações).
                    Você está navegando em sua conta pessoal.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <SectionHeader
                title="Gerenciar Clínica"
                subtitle={`Gestão de equipe e acessos para ${organization.name}`}
            />

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-1">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'team'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    Equipe ({memberships?.count || 0})
                </button>
                <button
                    onClick={() => setActiveTab('invites')}
                    className={`pb-3 px-1 text-sm font-bold transition-all ${activeTab === 'invites'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    Convidar Membros
                </button>
            </div>

            {activeTab === 'team' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memberships?.data?.map((mem) => (
                        <IslandCard key={mem.id} className="p-0 overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="p-6 flex items-center gap-4 border-b border-slate-50 dark:border-slate-800">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                    <img
                                        src={mem.publicUserData.imageUrl}
                                        alt={mem.publicUserData.identifier}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                                        {mem.publicUserData.firstName} {mem.publicUserData.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                                            {/* Showing Clerk Role for now, ideally customized via metadata */}
                                            {mem.role === 'org:admin' ? 'Administrador' : 'Membro'}
                                        </span>
                                        {mem.role === 'org:admin' && <Shield size={12} className="text-emerald-500" />}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 truncate">{mem.publicUserData.identifier}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-2">
                                {/* Actions based on permissions could go here */}
                                <span className="text-[10px] text-slate-400 font-medium self-center mr-auto">
                                    Entrou em {new Date(mem.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </IslandCard>
                    ))}

                    {/* Add New - Quick Link */}
                    <button
                        onClick={() => setActiveTab('invites')}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all min-h-[200px] group"
                    >
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <UserPlus size={24} />
                        </div>
                        <span className="font-bold text-sm">Adicionar Membro</span>
                    </button>
                </div>
            )}

            {activeTab === 'invites' && (
                <div className="max-w-xl mx-auto">
                    <IslandCard className="p-8 space-y-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enviar Convite</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Convide novos membros para colaborar em <strong>{organization.name}</strong>.
                            </p>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    E-mail do Colaborador
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="exemplo@dentis.com.br"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    Cargo / Função
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {ROLES.map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setInviteRole(role.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all text-left flex items-center justify-between ${inviteRole === role.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {role.label}
                                            {inviteRole === role.value && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <LuxButton
                                    loading={loading}
                                    onClick={() => { }} // Form handles submit
                                    className="w-full justify-center"
                                >
                                    Enviar Convite
                                </LuxButton>
                            </div>

                            <p className="text-xs text-center text-slate-400">
                                O usuário receberá um e-mail com instruções para entrar na organização.
                            </p>
                        </form>
                    </IslandCard>
                </div>
            )}
        </div>
    );
};

export default ManageClinic;
