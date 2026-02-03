import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X, Upload, Package, DollarSign, Link as LinkIcon, Tag, Ruler, Loader, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StockItem } from '../types';

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: StockItem | null;
}

const EditInventoryModal: React.FC<EditInventoryModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const { getToken } = useAuth();

    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || '',
        unit: item?.unit || 'un',
        price: item?.price || 0,
        supplier: item?.supplier || '',
        link: item?.link || '',
        minStock: item?.minStock || 0,
        currentStock: item?.currentStock || 0,
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(item?.photoUrl || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Update form when item changes
    React.useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                category: item.category,
                unit: item.unit || 'un',
                price: item.price || 0,
                supplier: item.supplier || '',
                link: item.link || '',
                minStock: item.minStock || 0,
                currentStock: item.currentStock || 0,
            });
            setPhotoPreview(item.photoUrl || null);
        }
    }, [item]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        if (!item) return;

        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`/api/inventory/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update item');
            }

            onSuccess();
            handleClose();

        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar item');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!item) return;

        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`/api/inventory/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete item');
            }

            onSuccess();
            handleClose();

        } catch (err: any) {
            setError(err.message || 'Erro ao deletar item');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen || !item) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-lux-border flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div>
                            <h2 className="text-2xl font-black text-lux-text">Editar Item</h2>
                            <p className="text-sm text-lux-text-secondary mt-1">
                                Atualize as informações do item de estoque
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-white hover:bg-lux-subtle transition flex items-center justify-center shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        <div className="space-y-5">
                            {/* Photo Upload */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl bg-lux-subtle border-2 border-dashed border-lux-border overflow-hidden flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={36} className="text-lux-text-secondary" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-xl cursor-pointer hover:bg-blue-700 transition shadow-lg"
                                    >
                                        <Upload size={14} />
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-lux-text mb-2">
                                    Nome do Item <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                    placeholder="Ex: Luva de Procedimento"
                                    required
                                />
                            </div>

                            {/* Category and Unit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Categoria</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="Ex: Descartáveis"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Unidade</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                    >
                                        <option value="un">Unidade</option>
                                        <option value="cx">Caixa</option>
                                        <option value="pct">Pacote</option>
                                        <option value="kg">Quilograma</option>
                                        <option value="l">Litro</option>
                                        <option value="ml">Mililitro</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price and Supplier */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Preço Unitário</label>
                                    <div className="relative">
                                        <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Fornecedor</label>
                                    <input
                                        type="text"
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="Nome do fornecedor"
                                    />
                                </div>
                            </div>

                            {/* Stock Levels */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Estoque Atual</label>
                                    <input
                                        type="number"
                                        value={formData.currentStock}
                                        onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-lux-text mb-2">Estoque Mínimo</label>
                                    <input
                                        type="number"
                                        value={formData.minStock}
                                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-bold text-lux-text mb-2">Link do Produto</label>
                                <div className="relative">
                                    <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-lux-border focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                        placeholder="https://fornecedor.com/produto"
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm font-bold text-red-900">{error}</p>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-lux-border flex gap-3 justify-between bg-lux-subtle">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Deletar
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-3 rounded-xl font-bold text-lux-text hover:bg-lux-border transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.name.trim()}
                                className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                                <h3 className="text-xl font-black text-lux-text mb-2">Confirmar Exclusão</h3>
                                <p className="text-sm text-lux-text-secondary mb-6">
                                    Tem certeza que deseja deletar "{item.name}"? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-4 py-2 rounded-xl font-bold text-lux-text hover:bg-lux-subtle transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Deletando...' : 'Deletar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditInventoryModal;
