import React from 'react';
import type { LifeEvent } from '../types';
import { getCategoryStyles } from '../types';
import { Calendar, MapPin, Users, Edit2, Trash2, Star, Tag } from 'lucide-react';
import { useLifeStore } from '../store/useLifeStore';
import { formatHEDate } from '../utils/dateUtils';
import { motion } from 'framer-motion';

interface EventCardProps {
    event: LifeEvent;
    isRightAligned?: boolean;
    onEdit?: (event: LifeEvent) => void;
    onDelete?: (id: string) => void;
    onToggleImportant?: (event: LifeEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete, onToggleImportant }) => {
    const categories = useLifeStore((state) => state.categories);
    const category = categories.find(c => c.id === event.categoryId);
    const colorClass = getCategoryStyles(category?.color || 'indigo');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative p-6 rounded-2xl border backdrop-blur-sm bg-opacity-40 transition-all duration-300 hover:-translate-y-1 ${colorClass} bg-slate-900/50 group/card`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                        {category?.name || 'Sans catégorie'}
                    </span>
                </div>
                <span className="text-sm font-mono opacity-60 flex items-center gap-1 text-right">
                    <Calendar className="w-3 h-3" />
                    {formatHEDate(event.date, 'd MMM')}
                </span>
            </div>

            <h3 className="text-xl font-bold mb-2 text-white/90">{event.title}</h3>

            {event.description && (
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {event.description}
                </p>
            )}

            <div className="flex flex-wrap gap-3 mt-auto">
                {event.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                    </div>
                )}
                {event.people && event.people.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3 h-3" />
                        {event.people.join(', ')}
                    </div>
                )}
                {event.isCurrent && (
                    <div className="w-full mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                            Toujours en cours
                        </span>
                    </div>
                )}
            </div>

            {(event.emotionalValence !== undefined && event.emotionalValence !== 0) && (
                <div className={`absolute top-1/2 -translate-y-1/2 right-6 px-2 py-1 rounded-md text-[10px] font-bold border ${event.emotionalValence > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {event.emotionalValence > 0 ? '+' : ''}{event.emotionalValence}
                </div>
            )}

            {/* Actions */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                {onToggleImportant && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleImportant(event); }}
                        className={`p-1.5 rounded-lg transition-colors shadow-sm ${event.isImportant
                            ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-500'
                            }`}
                        title={event.isImportant ? "Retirer des super souvenirs" : "Définir comme super souvenir"}
                    >
                        <Star className={`w-4 h-4 ${event.isImportant ? 'fill-current' : ''}`} />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(event); }}
                    className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors shadow-sm"
                    title="Modifier"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(event.id); }}
                    className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors shadow-sm"
                    title="Supprimer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default EventCard;
