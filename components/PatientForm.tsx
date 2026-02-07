import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, FileText, Phone, MapPin, Briefcase, GraduationCap, Heart, AlertTriangle, Plus, Trash2, Camera, Loader2 } from 'lucide-react';
import { Patient, EmergencyContact, Insurance, Address } from '../types';
import { useI18n } from '../lib/i18n';

interface PatientFormProps {
    initialData?: Partial<Patient> & { avatarUrl?: string | null };
    onSubmit: (data: any) => void;
    loading?: boolean;
    mode: 'create' | 'edit';
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, loading, mode }) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'personal' | 'docs' | 'contacts'>('personal');
    const [uploading, setUploading] = useState(false);

    // Flattened state for simpler form handling
    const [formData, setFormData] = useState({
        // Personal
        name: initialData?.name || '',
        avatarUrl: initialData?.avatarUrl || '',
        socialName: initialData?.socialName || '',
        gender: initialData?.gender || '',
        birthdate: initialData?.birthdate || '',
        placeOfBirth: initialData?.placeOfBirth || '',
        maritalStatus: initialData?.maritalStatus || '',
        occupation: initialData?.occupation || '',
        educationLevel: initialData?.educationLevel || '',

        // Docs
        cpf: initialData?.cpf || '',
        rg: initialData?.rg || '',
        cns: initialData?.cns || '',

        // Insurance (One for now in UI flow, or list)
        companyName: initialData?.companyName || '', // Benefício/Empresa

        // Contact
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        contactPreference: initialData?.contactPreference || 'whatsapp',

        // Legal
        legalGuardianName: initialData?.legalGuardianName || '',
        legalGuardianRelationship: initialData?.legalGuardianRelationship || '',
        legalGuardianPhone: initialData?.legalGuardianPhone || '',

        // Legacy
        medicalHistory: initialData?.medicalHistory || '',
        allergies: initialData?.allergies || '',
        medications: initialData?.medications || '',
    });

    // Nested states
    const [address, setAddress] = useState<Address>(initialData?.addressDetails || {
        street: '', number: '', neighborhood: '', city: '', state: '', postalCode: '', complement: ''
    });

    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(initialData?.emergencyContacts || []);
    const [insurances, setInsurances] = useState<Insurance[]>(initialData?.insurances || []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field: keyof Address, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    };

    const isMinor = () => {
        if (!formData.birthdate) return false;
        const today = new Date();
        const birthDate = new Date(formData.birthdate);
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        return (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ? age - 1 < 18 : age < 18;
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'PATIENT_AVATAR');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload falhou');
            const data = await res.json();
            handleChange('avatarUrl', data.url);
        } catch (error) {
            console.error("Upload error:", error);
            // alert("Erro ao enviar foto. Tente novamente."); // Optional: user toast
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            addressDetails: address,
            emergencyContacts,
            insurances
        });
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
                {[
                    { id: 'personal', label: t('patients.form.personal'), icon: User },
                    { id: 'docs', label: t('patients.form.docs'), icon: FileText },
                    { id: 'contacts', label: t('patients.form.contacts'), icon: Phone },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* --- PERSONAL TAB --- */}
                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">

                            {/* Avatar Section */}
                            <div className="col-span-2 flex justify-center mb-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center">
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={64} className="text-gray-300" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition-transform hover:scale-110">
                                        <Camera size={20} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="label">{t('patients.form.fullName')} *</label>
                                <input required className="input" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                            </div>

                            <div>
                                <label className="label">{t('patients.form.socialName')}</label>
                                <input className="input" value={formData.socialName} onChange={e => handleChange('socialName', e.target.value)} />
                            </div>

                            <div>
                                <label className="label">{t('patients.form.gender')}</label>
                                <select className="input" value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                                    <option value="">{t('common.select')}...</option>
                                    <option value="M">{t('patients.form.gender.male')}</option>
                                    <option value="F">{t('patients.form.gender.female')}</option>
                                    <option value="O">{t('patients.form.gender.other')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">{t('patients.form.birthdate')}</label>
                                <input type="date" className="input" value={formData.birthdate} onChange={e => handleChange('birthdate', e.target.value)} />
                            </div>

                            <div>
                                <label className="label">{t('patients.form.birthplace')}</label>
                                <input className="input" placeholder={t('patients.form.birthplacePlaceholder')} value={formData.placeOfBirth} onChange={e => handleChange('placeOfBirth', e.target.value)} />
                            </div>

                            <div>
                                <label className="label">{t('patients.form.maritalStatus')}</label>
                                <select className="input" value={formData.maritalStatus} onChange={e => handleChange('maritalStatus', e.target.value)}>
                                    <option value="">{t('common.select')}...</option>
                                    <option value="single">{t('patients.form.maritalStatus.single')}</option>
                                    <option value="married">{t('patients.form.maritalStatus.married')}</option>
                                    <option value="divorced">{t('patients.form.maritalStatus.divorced')}</option>
                                    <option value="widowed">{t('patients.form.maritalStatus.widowed')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">{t('patients.form.education')}</label>
                                <select className="input" value={formData.educationLevel} onChange={e => handleChange('educationLevel', e.target.value)}>
                                    <option value="">{t('common.select')}...</option>
                                    <option value="fundamental">{t('patients.form.education.fundamental')}</option>
                                    <option value="medio">{t('patients.form.education.highSchool')}</option>
                                    <option value="superior">{t('patients.form.education.university')}</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="label">{t('patients.form.profession')}</label>
                                <input className="input" value={formData.occupation} onChange={e => handleChange('occupation', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* --- DOCS TAB --- */}
                    {activeTab === 'docs' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            {/* Docs Pessoais */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={20} /> {t('patients.form.documents')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="label flex justify-between">
                                            CPF
                                            {mode === 'edit' && initialData?.cpf && (
                                                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{t('patients.form.immutable')}</span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                className={`input ${mode === 'edit' && initialData?.cpf ? 'bg-gray-100/50 text-gray-500 cursor-not-allowed border-dashed' : ''}`}
                                                placeholder="000.000.000-00"
                                                value={formData.cpf}
                                                onChange={e => handleChange('cpf', e.target.value)}
                                                readOnly={mode === 'edit' && !!initialData?.cpf}
                                                title={mode === 'edit' && !!initialData?.cpf ? t('patients.form.cpfImmutableMsg') : ""}
                                            />
                                            {mode === 'edit' && !!initialData?.cpf && (
                                                <div className="mt-1.5 flex justify-between items-center px-1">
                                                    <p className="text-[11px] text-gray-400 font-medium italic">{t('patients.form.contactSupport')}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => alert("Funcionalidade de Solicitação de Correção em implementação.")}
                                                        className="text-[11px] text-blue-600 font-bold hover:underline"
                                                    >
                                                        Solicitar correção
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">RG</label>
                                        <input className="input" value={formData.rg} onChange={e => handleChange('rg', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('patients.form.cns')}</label>
                                        <input className="input" value={formData.cns} onChange={e => handleChange('cns', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Empresa */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase className="text-emerald-600" size={20} /> {t('patients.form.companyBenefit')}
                                </h3>
                                <div>
                                    <label className="label">{t('patients.form.companyName')}</label>
                                    <input className="input" placeholder="Ex: Google, Banco do Brasil..." value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} />
                                </div>
                            </div>

                            {/* Convênios (List) */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Heart className="text-rose-600" size={20} /> {t('patients.form.insurance')}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setInsurances([...insurances, { providerName: '', cardNumber: '', validUntil: '' }])}
                                        className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={16} /> {t('common.add')}
                                    </button>
                                </div>

                                {insurances.length === 0 && <p className="text-gray-400 text-sm italic">{t('patients.form.noInsurance')}</p>}

                                <div className="space-y-4">
                                    {insurances.map((ins, idx) => (
                                        <div key={idx} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500">{t('patients.form.insuranceProvider')}</label>
                                                <input className="input-sm w-full" value={ins.providerName} onChange={e => {
                                                    const list = [...insurances]; list[idx].providerName = e.target.value; setInsurances(list);
                                                }} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500">{t('patients.form.insuranceCard')}</label>
                                                <input className="input-sm w-full" value={ins.cardNumber} onChange={e => {
                                                    const list = [...insurances]; list[idx].cardNumber = e.target.value; setInsurances(list);
                                                }} />
                                            </div>
                                            <div className="w-32">
                                                <label className="text-xs font-bold text-gray-500">{t('patients.form.validUntil')}</label>
                                                <input type="date" className="input-sm w-full" value={ins.validUntil} onChange={e => {
                                                    const list = [...insurances]; list[idx].validUntil = e.target.value; setInsurances(list);
                                                }} />
                                            </div>
                                            <button type="button" onClick={() => setInsurances(insurances.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- CONTACTS TAB --- */}
                    {activeTab === 'contacts' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            {/* Address */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="text-blue-600" size={20} /> {t('patients.form.address')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="label">{t('patients.form.zip')}</label>
                                        <input className="input" value={address.postalCode} onChange={e => handleAddressChange('postalCode', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="label">{t('patients.form.street')}</label>
                                        <input className="input" value={address.street} onChange={e => handleAddressChange('street', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="label">{t('patients.form.number')}</label>
                                        <input className="input" value={address.number} onChange={e => handleAddressChange('number', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="label">{t('patients.form.complement')}</label>
                                        <input className="input" value={address.complement} onChange={e => handleAddressChange('complement', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">{t('patients.form.neighborhood')}</label>
                                        <input className="input" value={address.neighborhood} onChange={e => handleAddressChange('neighborhood', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="label">{t('patients.form.city')}</label>
                                        <input className="input" value={address.city} onChange={e => handleAddressChange('city', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="label">{t('patients.form.state')}</label>
                                        <input className="input" maxLength={2} value={address.state} onChange={e => handleAddressChange('state', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Contacts */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Phone className="text-emerald-600" size={20} /> {t('patients.form.contacts')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">{t('patients.form.mobile')}</label>
                                        <input className="input" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('patients.form.email')}</label>
                                        <input className="input" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                                    </div>
                                </div>

                                {/* Emergency */}
                                <div className="mt-6 border-t pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{t('patients.form.emergencyContacts')}</h4>
                                        <button
                                            type="button"
                                            onClick={() => setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '' }])}
                                            className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={16} /> {t('common.add')}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {emergencyContacts.map((ec, idx) => (
                                            <div key={idx} className="flex gap-3 items-end p-3 bg-red-50/50 rounded-lg border border-red-100">
                                                <div className="flex-1">
                                                    <label className="text-xs font-bold text-gray-500">{t('patients.form.name')}</label>
                                                    <input className="input-sm w-full" value={ec.name} onChange={e => {
                                                        const list = [...emergencyContacts]; list[idx].name = e.target.value; setEmergencyContacts(list);
                                                    }} />
                                                </div>
                                                <div className="w-32">
                                                    <label className="text-xs font-bold text-gray-500">{t('patients.form.relationship')}</label>
                                                    <input className="input-sm w-full" value={ec.relationship} onChange={e => {
                                                        const list = [...emergencyContacts]; list[idx].relationship = e.target.value; setEmergencyContacts(list);
                                                    }} />
                                                </div>
                                                <div className="w-40">
                                                    <label className="text-xs font-bold text-gray-500">{t('patients.form.phone')}</label>
                                                    <input className="input-sm w-full" value={ec.phone} onChange={e => {
                                                        const list = [...emergencyContacts]; list[idx].phone = e.target.value; setEmergencyContacts(list);
                                                    }} />
                                                </div>
                                                <button type="button" onClick={() => setEmergencyContacts(emergencyContacts.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Legal Guardian (Conditional) */}
                            {isMinor() && (
                                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                                    <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle size={20} /> {t('patients.form.legalGuardian')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="label text-amber-900">{t('patients.form.guardianName')}</label>
                                            <input className="input bg-white" value={formData.legalGuardianName} onChange={e => handleChange('legalGuardianName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label text-amber-900">{t('patients.form.relationship')}</label>
                                            <input className="input bg-white" value={formData.legalGuardianRelationship} onChange={e => handleChange('legalGuardianRelationship', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label text-amber-900">{t('patients.form.phone')}</label>
                                            <input className="input bg-white" value={formData.legalGuardianPhone} onChange={e => handleChange('legalGuardianPhone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-white flex justify-end gap-3 z-10">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 transition-all transform active:scale-95"
                >
                    {loading ? t('common.saving') : t('common.save')}
                </button>
            </div>

            <style>{`
                .label { display: block; font-size: 0.875rem; font-weight: 600; color: #4b5563; margin-bottom: 0.25rem; }
                .input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; outline: none; transition: all; }
                .input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1); }
                .input-sm { padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; font-size: 0.875rem; }
            `}</style>
        </form>
    );
};

export default PatientForm;
