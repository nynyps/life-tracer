import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LifeEvent } from '../types';
import { Calendar, Tag, Check, Filter } from 'lucide-react';
import { useLifeStore } from '../store/useLifeStore';
import { AVAILABLE_COLORS } from '../types';
import { toHE, formatHEDate } from '../utils/dateUtils';

interface GlobalTimelineProps {
    events: LifeEvent[];
}

const GlobalTimeline: React.FC<GlobalTimelineProps> = ({ events }) => {
    const categories = useLifeStore((state) => state.categories);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const navigate = useNavigate();

    // Initialize selection if categories exist
    React.useEffect(() => {
        if (selectedCategoryIds.length === 0 && categories.length > 0) {
            setSelectedCategoryIds(categories.map(c => c.id));
        }
    }, [categories]);

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds((prev: string[]) =>
            prev.includes(id)
                ? prev.filter((c: string) => c !== id)
                : [...prev, id]
        );
    };

    // 1. Calculate Range and Rows
    const YEARS_PER_ROW = 25;

    const { rows } = useMemo(() => {
        if (events.length === 0) return { minYear: 0, maxYear: 0, rows: [] };

        const dates = events.map(e => new Date(e.date).getTime());
        const minVal = Math.min(...dates);
        const maxVal = Math.max(...dates);

        const startYear = new Date(minVal).getFullYear();
        const endYear = new Date(maxVal).getFullYear();

        // Ensure we cover enough years
        const totalYearSpan = (endYear + 1) - startYear;
        const rowCount = Math.ceil(totalYearSpan / YEARS_PER_ROW);

        const calculatedRows = [];
        for (let i = 0; i < rowCount; i++) {
            calculatedRows.push({
                index: i,
                startYear: startYear + (i * YEARS_PER_ROW),
                endYear: startYear + ((i + 1) * YEARS_PER_ROW)
            });
        }

        return { minYear: startYear, maxYear: endYear, rows: calculatedRows };
    }, [events]);

    const getPositionPercent = (dateStr: string, rowStartYear: number, isReverse: boolean) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const startOfYear = new Date(year, 0, 1).getTime();
        const endOfYear = new Date(year + 1, 0, 1).getTime();
        const eventTime = date.getTime();

        // Exact fraction within the year
        const yearFraction = (eventTime - startOfYear) / (endOfYear - startOfYear);
        const preciseYear = year + yearFraction;

        // Percent within the 25-year row
        const widthPerYear = 100 / YEARS_PER_ROW;
        const relativeYear = preciseYear - rowStartYear;
        let percent = relativeYear * widthPerYear;

        // Determine direction
        if (isReverse) {
            percent = 100 - percent;
        }

        return Math.max(0, Math.min(100, percent));
    };


    // Filter events to only those in valid categories
    const visibleEvents = events.filter(e => categories.some(c => c.id === e.categoryId));

    if (visibleEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <p>Ajoutez des souvenirs pour voir la vue globale.</p>
            </div>
        );
    }


    return (
        <div className="w-full min-h-[50vh] flex flex-col justify-start py-10 items-center overflow-x-hidden">

            {/* Category Filter */}
            <div className="flex flex-wrap gap-4 mb-8 z-20">
                <div className="flex items-center gap-2 px-3 py-2 text-slate-500 text-sm font-medium">
                    <Filter className="w-4 h-4" />
                    Filtrer :
                </div>
                {categories.map(cat => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    const colorData = AVAILABLE_COLORS.find(c => c.name === cat.color);
                    let colorClass = 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600';

                    if (isSelected) {
                        colorClass = `${colorData?.class || 'bg-indigo-500'}/20 border-${cat.color}-500 text-${cat.color}-200 shadow-lg`;
                        // Fallback for custom colors if tailwind classes don't exist
                        if (cat.color === 'rose') colorClass = 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-lg shadow-rose-900/20';
                        if (cat.color === 'emerald') colorClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-900/20';
                        if (cat.color === 'blue') colorClass = 'bg-blue-500/20 border-blue-500 text-blue-200 shadow-lg shadow-blue-900/20';
                        if (cat.color === 'amber') colorClass = 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-lg shadow-amber-900/20';
                        if (cat.color === 'violet') colorClass = 'bg-violet-500/20 border-violet-500 text-violet-200 shadow-lg shadow-violet-900/20';
                        if (cat.color === 'cyan') colorClass = 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-900/20';
                        if (cat.color === 'indigo') colorClass = 'bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-900/20';
                    }

                    return (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 text-sm font-medium ${colorClass}`}
                        >
                            {isSelected && <Check className="w-3 h-3" />}
                            {cat.name}
                        </button>
                    )
                })}
            </div >

            <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[1200px] max-w-[1400px] flex flex-col gap-20 px-4 md:px-12 pb-24 pt-8 relative mx-auto">
                    {rows.map((row: any, rowIndex: number) => {
                        const isReverse = rowIndex % 2 !== 0;

                        // Filter events for this row
                        const rowEvents = events.filter(e => {
                            const y = new Date(e.date).getFullYear();
                            return y >= row.startYear && y < row.endYear;
                        }).filter(e => selectedCategoryIds.includes(e.categoryId));

                        return (
                            <div key={row.index} className="relative w-full h-40">
                                {/* Connector Lines */}
                                {/* Right Connector (Row 0 -> 1, 2 -> 3) */}
                                {!isReverse && rowIndex < rows.length - 1 && (
                                    <div className="absolute right-[-24px] top-1/2 w-16 h-[calc(100%+80px)] border-r-4 border-slate-700/30 rounded-r-[50px] border-t-4 border-b-4 border-t-transparent border-b-transparent pointer-events-none" />
                                )}
                                {/* Left Connector (Row 1 -> 2, 3 -> 4) */}
                                {isReverse && rowIndex < rows.length - 1 && (
                                    <div className="absolute left-[-24px] top-1/2 w-16 h-[calc(100%+80px)] border-l-4 border-slate-700/30 rounded-l-[50px] border-t-4 border-b-4 border-t-transparent border-b-transparent pointer-events-none" />
                                )}

                                {/* Main Axis Line */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-slate-700/60 rounded-full" />

                                {/* Year Markers */}
                                {Array.from({ length: YEARS_PER_ROW + 1 }).map((_, i) => {
                                    const year = row.startYear + i;
                                    const percent = (i / YEARS_PER_ROW) * 100;
                                    const displayPercent = isReverse ? 100 - percent : percent;

                                    // Determine marker prominence
                                    const isFirstOrLast = i === 0 || i === YEARS_PER_ROW;
                                    const isFiveYear = i % 5 === 0;

                                    // Styling tiers
                                    let markerHeight = 'h-3';
                                    let textClass = 'text-[10px] text-slate-500';

                                    if (isFirstOrLast) {
                                        markerHeight = 'h-8';
                                        textClass = 'text-sm text-slate-200 font-bold';
                                    } else if (isFiveYear) {
                                        markerHeight = 'h-5';
                                        textClass = 'text-xs text-slate-400';
                                    }

                                    return (
                                        <div
                                            key={year}
                                            className="absolute top-1/2 -translate-y-1/2 group"
                                            style={{ left: `${displayPercent}%` }}
                                        >
                                            <div className={`${markerHeight} w-1 bg-slate-600/60`} />
                                            <div className={`absolute top-8 left-1/2 -translate-x-1/2 font-mono ${textClass} group-hover:text-slate-200 transition-colors`}>
                                                {toHE(year)}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Events */}
                                {rowEvents.map((event) => {
                                    const category = categories.find(c => c.id === event.categoryId);
                                    const colorData = AVAILABLE_COLORS.find(c => c.name === category?.color);
                                    const dotColor = colorData?.class || 'bg-indigo-500';
                                    const shadowColor = category?.color === 'rose' ? 'shadow-rose-500/50' :
                                        category?.color === 'emerald' ? 'shadow-emerald-500/50' :
                                            category?.color === 'blue' ? 'shadow-blue-500/50' :
                                                category?.color === 'amber' ? 'shadow-amber-500/50' :
                                                    category?.color === 'violet' ? 'shadow-violet-500/50' :
                                                        category?.color === 'cyan' ? 'shadow-cyan-500/50' : 'shadow-indigo-500/50';

                                    const left = getPositionPercent(event.date, row.startYear, isReverse);

                                    // Tooltip positioning logic
                                    let tooltipAlignClass = "left-1/2 -translate-x-1/2 origin-bottom";
                                    let arrowAlignClass = "left-1/2 -translate-x-1/2";
                                    if (left < 10) {
                                        tooltipAlignClass = "left-0 origin-bottom-left";
                                        arrowAlignClass = "left-4";
                                    } else if (left > 90) {
                                        tooltipAlignClass = "right-0 left-auto origin-bottom-right";
                                        arrowAlignClass = "right-4 left-auto";
                                    }

                                    return (
                                        <div
                                            key={event.id}
                                            className="absolute top-1/2 -translate-y-1/2 group z-10"
                                            style={{ left: `${left}%` }}
                                        >
                                            {/* Super Souvenir Title */}
                                            {event.isImportant && (
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/category/${category?.id}#event-${event.id}`); }}
                                                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-slate-200 bg-slate-900/90 px-2 py-1 rounded-md border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                                                    {event.title}
                                                </div>
                                            )}

                                            {/* Trigger Area */}
                                            <div
                                                onClick={() => navigate(`/category/${category?.id}#event-${event.id}`)}
                                                className={`${event.isImportant
                                                    ? `w-1.5 h-14 -mt-5 ${dotColor} ${shadowColor} shadow-xl border border-white/30`
                                                    : `w-5 h-5 rounded-full ${dotColor} ${shadowColor} border-2 border-slate-900 shadow-lg`
                                                    } cursor-pointer transform transition-all group-hover:scale-150 group-hover:z-50`}
                                            />

                                            {/* Tooltip */}
                                            <div
                                                onClick={() => navigate(`/category/${category?.id}#event-${event.id}`)}
                                                className={`absolute bottom-full mb-4 hidden group-hover:block z-50 w-64 ${tooltipAlignClass} cursor-pointer`}>
                                                <div className="bg-slate-800/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200">
                                                    <div className={`h-1 w-full mb-2 rounded-full ${dotColor.split(' ')[0]}`} />
                                                    <h3 className="font-bold text-slate-100 text-sm mb-1">{event.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formatHEDate(event.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <Tag className="w-3 h-3" />
                                                        <span className="uppercase">{category?.name || 'Sans catégorie'}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800 absolute -bottom-1.5 opacity-90 ${arrowAlignClass}`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
};

export default GlobalTimeline;
