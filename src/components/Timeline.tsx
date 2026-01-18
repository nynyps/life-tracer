import React, { useMemo } from 'react';
import type { LifeEvent } from '../types';
import EventCard from './EventCard';
import { useLifeStore } from '../store/useLifeStore';

import { toHE } from '../utils/dateUtils';

interface TimelineProps {
    events: LifeEvent[];
    onEdit?: (event: LifeEvent) => void;
    onDelete?: (id: string) => void;
    onToggleImportant?: (event: LifeEvent) => void;
    pixelsPerYear: number;
    onOpenCategoryManager?: () => void;
}

const START_PADDING = 50;

const Timeline: React.FC<TimelineProps> = ({ events, onEdit, onDelete, onToggleImportant, pixelsPerYear, onOpenCategoryManager }) => {
    const categories = useLifeStore((state) => state.categories);

    // 1. Calculate Time Range
    const { minDate, years, hasVisibleEvents } = useMemo(() => {
        // Filter events to only those in valid categories
        const visibleEvents = events.filter(e => categories.some(c => c.id === e.categoryId));

        if (visibleEvents.length === 0) return { minDate: new Date(), years: [], hasVisibleEvents: false };

        const dates = visibleEvents.map(e => new Date(e.date).getTime());
        const minTime = Math.min(...dates);
        const maxTime = Math.max(...dates);

        const minYear = new Date(minTime).getFullYear();
        const maxYear = new Date(maxTime).getFullYear();

        // Add padding years before and after
        const startYear = minYear - 1;
        const endYear = maxYear + 2;

        const y = [];
        for (let i = startYear; i <= endYear; i++) {
            y.push(i);
        }

        return { minDate: new Date(startYear, 0, 1), years: y, hasVisibleEvents: true };
    }, [events, categories]);

    const getPosition = (dateStr: string) => {
        const date = new Date(dateStr);
        const diffTime = date.getTime() - minDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return START_PADDING + (diffDays * pixelsPerYear / 365);
    };

    // Categories to display as columns
    // If we have categories, we use them. If we have no categories yet, we show a default message.
    const displayCategories = categories;

    if (displayCategories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 opacity-50 px-4 text-center">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl max-w-md flex flex-col items-center">
                    <p className="text-xl font-medium mb-4 text-slate-200">Commencez par créer une catégorie</p>
                    <p className="text-sm text-slate-400 mb-6">Cliquez sur l'icône de paramètres dans la barre de navigation pour organiser vos souvenirs par colonnes.</p>
                    {onOpenCategoryManager && (
                        <button
                            onClick={onOpenCategoryManager}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            <span className="text-xl leading-none mb-0.5">+</span>
                            Créer une catégorie
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Show empty state when no events exist
    if (!hasVisibleEvents) {
        return (
            <div className="flex flex-col items-center justify-center py-40 px-4 text-center">
                <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-3xl max-w-md backdrop-blur-sm">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <p className="text-xl font-medium mb-3 text-slate-200">Aucun souvenir pour le moment</p>
                    <p className="text-sm text-slate-400">Cliquez sur <strong className="text-indigo-400">Ajouter</strong> pour créer votre premier souvenir et commencer à tracer votre vie.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="relative w-full min-h-screen overflow-x-auto pb-20">
            <div className="min-w-[900px] relative">

                {/* Headers */}
                <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800 pb-4 pt-4 px-4 shadow-xl">
                    <div
                        className="grid mt-0"
                        style={{ gridTemplateColumns: `80px repeat(${displayCategories.length}, 1fr)` }}
                    >
                        <div className="text-right pr-4 text-xs font-mono text-slate-500 pt-1">ANNÉE</div>
                        {displayCategories.map((cat) => (
                            <div key={cat.id} className="px-4 text-sm font-bold uppercase tracking-widest opacity-80 text-center border-l border-slate-800/50">
                                {cat.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Body */}
                <div
                    className="relative grid"
                    style={{
                        gridTemplateColumns: `80px repeat(${displayCategories.length}, 1fr)`,
                        height: years.length * pixelsPerYear + 200
                    }}
                >

                    {/* Time Ruler (Left Column) */}
                    <div className="border-r border-slate-800/30 relative">
                        {years.map((year: number) => (
                            <div
                                key={year}
                                className="absolute right-4 text-xs font-mono text-slate-600 border-b border-slate-800/50 w-full text-right pr-2"
                                style={{ top: START_PADDING + (year - minDate.getFullYear()) * pixelsPerYear }}
                            >
                                {toHE(year)}
                            </div>
                        ))}
                    </div>

                    {/* Category Columns */}
                    {displayCategories.map((cat) => (
                        <div key={cat.id} className="relative border-r border-slate-800/30">
                            {/* Background Year Lines */}
                            {years.map((year: number) => (
                                <div
                                    key={`line-${year}`}
                                    className="absolute w-full border-t border-slate-800/20"
                                    style={{ top: START_PADDING + (year - minDate.getFullYear()) * pixelsPerYear }}
                                />
                            ))}

                            {/* Events for this category */}
                            {events
                                .filter(e => e.categoryId === cat.id)
                                .map(event => (
                                    <div
                                        key={event.id}
                                        className="absolute left-2 right-2 z-10"
                                        style={{ top: getPosition(event.date) }}
                                    >
                                        <div className="transform scale-95 origin-top-left hover:scale-100 transition-all z-20 hover:z-30 hover:shadow-2xl">
                                            <EventCard
                                                event={event}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onToggleImportant={onToggleImportant}
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
