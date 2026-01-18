import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Palette, AlertTriangle } from 'lucide-react';
import { useLifeStore } from '../store/useLifeStore';
import { AVAILABLE_COLORS } from '../types';
import type { Category } from '../types';

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose }) => {
    const categories = useLifeStore((state) => state.categories);
    const addCategory = useLifeStore((state) => state.addCategory);
    const updateCategory = useLifeStore((state) => state.updateCategory);
    const deleteCategory = useLifeStore((state) => state.deleteCategory);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState('indigo');
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleAdd = async () => {
        if (!name.trim()) return;
        await addCategory({ name: name.trim(), color: selectedColor });
        setName('');
        setSelectedColor('indigo');
        setIsAdding(false);
    };

    const handleUpdate = async (id: string) => {
        if (!name.trim()) return;
        await updateCategory(id, { name: name.trim(), color: selectedColor });
        setEditingId(null);
        setName('');
    };

    const startEditing = (cat: Category) => {
        setEditingId(cat.id);
        setName(cat.name);
        setSelectedColor(cat.color);
        setIsAdding(false);
    };

    const cancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setName('');
        setSelectedColor('indigo');
    };

    const handleConfirmDelete = async () => {
        if (!deletingCategory) return;
        setIsDeleting(true);
        await deleteCategory(deletingCategory.id);
        setIsDeleting(false);
        setDeletingCategory(null);
    };

    return (
        <>
            {/* Delete Confirmation Modal */}
            {deletingCategory && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-100">
                                Supprimer la catégorie ?
                            </h3>
                        </div>
                        <p className="text-slate-400 mb-6">
                            Vous êtes sur le point de supprimer <strong className="text-slate-200">"{deletingCategory.name}"</strong>. Les événements liés n'auront plus de catégorie.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                            >
                                {isDeleting ? 'Suppression...' : 'Supprimer'}
                            </button>
                            <button
                                onClick={() => setDeletingCategory(null)}
                                disabled={isDeleting}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium py-2.5 rounded-xl transition-all active:scale-[0.98]"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="px-4 md:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-indigo-400" />
                            Gérer les catégories
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Add New Button */}
                        {!isAdding && !editingId && (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-3 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-400 transition-all font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Nouvelle catégorie
                            </button>
                        )}

                        {/* Add/Edit Form */}
                        {(isAdding || editingId) && (
                            <div className="p-5 bg-slate-800/50 rounded-2xl border border-indigo-500/30 space-y-4 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Nom de la catégorie
                                    </label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Voyages, Études..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Couleur
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {AVAILABLE_COLORS.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => setSelectedColor(color.name)}
                                                className={`w-8 h-8 rounded-full ${color.class} transition-all flex items-center justify-center ${selectedColor === color.name
                                                    ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-900 scale-110'
                                                    : 'opacity-50 hover:opacity-100 hover:scale-110'
                                                    }`}
                                                title={color.label}
                                            >
                                                {selectedColor === color.name && <Check className="w-4 h-4 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                                    >
                                        {editingId ? 'Enregistrer' : 'Créer'}
                                    </button>
                                    <button
                                        onClick={cancel}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Categories List */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Vos catégories ({categories.length})
                            </label>
                            {categories.length === 0 && !isAdding && (
                                <div className="text-center py-8 text-slate-600 italic">
                                    Aucune catégorie personnalisée
                                </div>
                            )}
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="group flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-2xl border border-slate-800 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${AVAILABLE_COLORS.find(c => c.name === cat.color)?.class || 'bg-indigo-500'
                                            }`} />
                                        <span className="font-medium text-slate-200">{cat.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(cat)}
                                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingCategory(cat)}
                                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-500">
                            Chaque catégorie s'affichera comme une colonne distincte sur votre frise.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoryManagerModal;

