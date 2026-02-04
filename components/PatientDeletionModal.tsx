import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Archive, X, CheckCircle2 } from 'lucide-react';
import { LuxButton } from './Shared';
import { Patient } from '../types';

interface PatientDeletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    onConfirm: (action: 'delete' | 'archive') => void;
}

const PatientDeletionModal: React.FC<PatientDeletionModalProps> = ({ isOpen, onClose, patient, onConfirm }) => {
    const hasLegalHold = !!patient.cpf; // Simple check: If CPF exists, we assume legal hold is safer.
    const [acknowledged, setAcknowledged] = useState(false);

    // If patient is already archived, maybe we shouldn't be here or show different text?
    // Assuming this modal is triggered from Active patients list.

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-full ${hasLegalHold ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                    {hasLegalHold ? <Archive size={24} /> : <Trash2 size={24} />}
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                {hasLegalHold ? 'Arquivamento Necessário' : 'Excluir Paciente?'}
                            </h2>

                            <div className="space-y-4">
                                {hasLegalHold ? (
                                    <>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Este paciente possui <strong>CPF registrado</strong> ({patient.cpf}).
                                        </p>

                                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                                                <p className="text-amber-800 text-xs font-medium text-justify">
                                                    <strong>Aviso Legal (Brasil):</strong> Pela Lei 13.787/2018, prontuários eletrônicos devem ser mantidos por no mínimo <strong>20 anos</strong>.
                                                </p>
                                            </div>
                                            <p className="text-amber-700 text-xs pl-6">
                                                Para conformidade legal, este paciente será <strong>ARQUIVADO</strong> (tornado inativo), mas seus dados permanecerão no banco de dados da clínica caso precisem ser recuperados judicialmente.
                                            </p>
                                        </div>

                                        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${acknowledged ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                {acknowledged && <CheckCircle2 size={14} />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={acknowledged}
                                                onChange={e => setAcknowledged(e.target.checked)}
                                            />
                                            <span className="text-xs text-slate-600 font-medium">
                                                Estou ciente da lei e desejo mover este paciente para a lista de "Inativos".
                                            </span>
                                        </label>
                                    </>
                                ) : (
                                    <p className="text-slate-600">
                                        Tem certeza que deseja excluir <strong>{patient.name}</strong>? Esta ação é irreversível e removerá todos os dados associados.
                                    </p>
                                )}
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <LuxButton variant="ghost" onClick={onClose}>Cancelar</LuxButton>
                                {hasLegalHold ? (
                                    <LuxButton
                                        onClick={() => onConfirm('archive')}
                                        disabled={!acknowledged}
                                        className={!acknowledged ? 'opacity-50 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'}
                                    >
                                        Arquivar Paciente
                                    </LuxButton>
                                ) : (
                                    <LuxButton
                                        onClick={() => onConfirm('delete')}
                                        className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                    >
                                        Excluir Definitivamente
                                    </LuxButton>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PatientDeletionModal;
