import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, FileText, MapPin, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LifeEvent } from '../types';
import { useLifeStore } from '../store/useLifeStore';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: LifeEvent | null;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, initialData }) => {
    const addEvent = useLifeStore((state) => state.addEvent);
    const updateEvent = useLifeStore((state) => state.updateEvent);

    const categories = useLifeStore((state) => state.categories);

    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: categories[0]?.id || '',
        description: '',
        location: '',
        people: '',
        isImportant: false,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title,
                    date: initialData.date,
                    categoryId: initialData.categoryId,
                    description: initialData.description || '',
                    location: initialData.location || '',
                    people: initialData.people ? initialData.people.join(', ') : '',
                    isImportant: initialData.isImportant || false,
                });
            } else {
                setFormData({
                    title: '',
                    date: new Date().toISOString().split('T')[0],
                    categoryId: categories[0]?.id || '',
                    description: '',
                    location: '',
                    people: '',
                    isImportant: false,
                });
            }
        }
    }, [isOpen, initialData, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const eventData = {
            ...formData,
            people: formData.people ? formData.people.split(',').map(p => p.trim()) : undefined,
            location: formData.location || undefined,
            description: formData.description || undefined,
        };

        if (initialData) {
            updateEvent(initialData.id, eventData);
        } else {
            addEvent(eventData);
        }

        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? 'Modifier le souvenir' : 'Ajouter un souvenir'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">

                            {/* Title Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Titre</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Rencontre avec Julie"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Date Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                {/* Category Select */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Catégorie</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.categoryId}
                                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                        >
                                            {categories.length === 0 && (
                                                <option value="" disabled>Créez d'abord une catégorie</option>
                                            )}
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Description</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Racontez ce moment..."
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Location */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Lieu (Optionnel)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Paris, France"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>

                                {/* People */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Personnes key (Opt)</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.people}
                                            onChange={e => setFormData({ ...formData, people: e.target.value })}
                                            placeholder="Jean, Marie..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Super Souvenir Checkbox - Centered and Sober */}
                            <div className="flex flex-col items-center justify-center pt-2 pb-1">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={!!formData.isImportant}
                                            onChange={e => setFormData({ ...formData, isImportant: e.target.checked })}
                                            className="peer sr-only"
                                        />
                                        <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-950 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all"></div>
                                        <svg className="absolute w-3.5 h-3.5 text-slate-950 left-1 top-1 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                        Définir comme Super-Souvenir
                                    </span>
                                </label>
                                {formData.isImportant && (
                                    <p className="text-xs text-slate-500 mt-2 text-center max-w-sm animate-in fade-in slide-in-from-top-1">
                                        Ce souvenir sera mis en avant visuellement dans la vue globale.
                                    </p>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                                >
                                    {initialData ? 'Enregistrer les modifications' : 'Enregistrer ce moment'}
                                </button>
                            </div>

                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateEventModal;
