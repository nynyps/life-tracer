import React, { useState, useEffect } from 'react';
import { X, Calendar, Type, FileText, MapPin, Users, Info } from 'lucide-react';
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
        endDate: '',
        categoryId: categories[0]?.id || '',
        description: '',
        location: '',
        people: '',
        isImportant: false,
        emotionalValence: 0,
        isCurrent: false,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title,
                    date: initialData.date,
                    endDate: initialData.endDate || '',
                    categoryId: initialData.categoryId,
                    description: initialData.description || '',
                    location: initialData.location || '',
                    people: initialData.people ? initialData.people.join(', ') : '',
                    isImportant: initialData.isImportant || false,
                    emotionalValence: initialData.emotionalValence ?? 0,
                    isCurrent: initialData.isCurrent || false,
                });
            } else {
                setFormData({
                    title: '',
                    date: new Date().toISOString().split('T')[0],
                    endDate: '',
                    categoryId: categories[0]?.id || '',
                    description: '',
                    location: '',
                    people: '',
                    isImportant: false,
                    emotionalValence: 0,
                    isCurrent: false,
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
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
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
                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">

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
                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Date de début</label>
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

                            {/* Until Today Checkbox - Below Start Date */}
                            <div className="flex items-center -mt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isCurrent}
                                            onChange={e => setFormData({ ...formData, isCurrent: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })}
                                            className="peer sr-only"
                                        />
                                        <div className="w-4 h-4 border border-slate-600 rounded bg-slate-950 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-400 transition-colors">Jusqu'à aujourd'hui</span>
                                </label>
                            </div>

                            {/* End Date - Optional */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Date de fin (Optionnel)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="date"
                                        value={formData.endDate || ''}
                                        disabled={formData.isCurrent}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark] disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
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

                            {/* Emotional Valence */}
                            <div className="space-y-3 pb-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    Ressenti
                                    <div className="group relative">
                                        <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                            <p className="font-semibold text-white mb-1">Impact sur vous</p>
                                            Évaluez ce souvenir de <span className="text-red-400">-5</span> (négatif) à <span className="text-emerald-400">+5</span> (positif).
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-b border-r border-slate-700 transform rotate-45"></div>
                                        </div>
                                    </div>
                                </label>
                                <div className="flex items-center justify-between gap-1 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                    <span className="text-xs font-bold text-red-400 w-6 text-center">-5</span>
                                    <input
                                        type="range"
                                        min="-5"
                                        max="5"
                                        step="1"
                                        value={formData.emotionalValence}
                                        onChange={e => setFormData({ ...formData, emotionalValence: parseInt(e.target.value) })}
                                        className="w-full h-1.5 bg-gradient-to-r from-red-500 via-slate-700 to-emerald-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                                    />
                                    <span className="text-xs font-bold text-emerald-400 w-6 text-center">+5</span>
                                </div>
                                <div className="text-center text-xs font-medium text-slate-400">
                                    {formData.emotionalValence === 0 ? "Neutre" :
                                        formData.emotionalValence > 0 ? `Positif (+${formData.emotionalValence})` :
                                            `Négatif (${formData.emotionalValence})`}
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
