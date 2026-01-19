import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Heart, Star, Layers } from 'lucide-react';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TutorialStep {
    title: string;
    content: React.ReactNode;
    icon: React.ReactNode;
    targetId: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: "1. Créez vos catégories",
        icon: <Layers className="w-5 h-5" />,
        targetId: 'tutorial-categories',
        content: (
            <div className="space-y-3">
                <p>
                    Commencez par créer vos <strong className="text-indigo-300">catégories de vie</strong>.
                    Essayez de les garder les plus <strong className="text-indigo-300">larges possibles</strong>.
                </p>
                <p className="text-slate-400 text-sm">
                    Idéalement, ne dépassez pas <strong className="text-white">4 catégories</strong>.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full text-xs border border-rose-500/30">
                        <Heart className="w-3 h-3 inline mr-1" /> Amour
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs border border-emerald-500/30">
                        Vie
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                        Travail
                    </span>
                </div>
            </div>
        )
    },
    {
        title: "2. Ajoutez vos souvenirs",
        icon: <Sparkles className="w-5 h-5" />,
        targetId: 'tutorial-add-event',
        content: (
            <div className="space-y-3">
                <p className="text-sm">
                    Ensuite, créez un <strong className="text-indigo-300">maximum de souvenirs</strong> !
                    L'objectif est de saisir les <strong className="text-indigo-300"> étapes importantes</strong> de votre vie.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mt-2">
                    <div className="flex items-center gap-2 text-amber-300 font-medium text-xs mb-1">
                        <Star className="w-3 h-3" />
                        Les Super-Souvenirs
                    </div>
                    <p className="text-slate-400 text-[11px] leading-tight">
                        Marquez les <strong className="text-amber-200">grandes étapes</strong> (mariage, diplôme) pour les mettre en évidence.
                    </p>
                </div>
            </div>
        )
    },
    {
        title: "3. Découvrez la Vue Globale",
        icon: <Sparkles className="w-5 h-5" />,
        targetId: 'tutorial-global-view',
        content: (
            <div className="space-y-3">
                <p>
                    C'est ici que <strong className="text-indigo-300">la magie opère</strong> !
                    Visualisez les interactions entre vos catégories et prenez conscience de votre parcours.
                </p>
                <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-lg p-2 mt-2">
                    <p className="text-indigo-200 text-xs text-center">
                        ✨ Plus vous ajoutez de souvenirs, plus la vue devient révélatrice !
                    </p>
                </div>
            </div>
        )
    }
];

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial check (and periodically) for target element
    useEffect(() => {
        if (!isOpen) {
            setTargetRect(null);
            return;
        }

        const updatePosition = () => {
            const step = TUTORIAL_STEPS[currentStep];
            const element = document.getElementById(step.targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                // Also scroll into view smoothly if needed (though navbar items usually visible)
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                setTargetRect(null);
            }
        };

        // Update immediately
        updatePosition();

        // Update on resize
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        // Small timeout to handle layout shifts or animation frames
        const interval = setInterval(updatePosition, 100);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
            clearInterval(interval);
        };
    }, [isOpen, currentStep]);


    if (!isOpen) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === TUTORIAL_STEPS.length - 1;

    const handleNext = () => {
        if (isLast) {
            onClose();
            setCurrentStep(0);
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        onClose();
        setCurrentStep(0);
    };

    // Calculate Popover Position
    let popoverStyle: React.CSSProperties = { opacity: 0 };
    if (targetRect) {
        // Default to showing below, centered-ish on target
        // But adjust based on alignment preference or screen edge
        const top = targetRect.bottom + 20;
        let left = targetRect.left + (targetRect.width / 2) - 200; // Center (width 400px / 2)

        // Adjust for screen edges
        if (left < 10) left = 10;
        if (left + 400 > window.innerWidth - 10) left = window.innerWidth - 410;

        popoverStyle = {
            top: `${top}px`,
            left: `${left}px`,
            width: '380px',
            opacity: 1,
            position: 'absolute' // Since we are in a fixed full-screen container
        };
    }

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Spotlight / Target Highlighter */}
            {targetRect && (
                <>
                    {/* Glowing ring around target */}
                    <div
                        className="fixed transition-all duration-300 rounded-lg pointer-events-none z-[101]"
                        style={{
                            top: targetRect.top - 4,
                            left: targetRect.left - 4,
                            width: targetRect.width + 8,
                            height: targetRect.height + 8,
                            boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 0 10000px rgba(15, 23, 42, 0.4)', // Spotlight effect
                            borderRadius: '9999px' // Since buttons are full rounded
                        }}
                    >
                        {/* Animated pulse ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-pulse"></div>
                    </div>
                </>
            )}

            {/* Popover Card */}
            {targetRect && (
                <div
                    ref={containerRef}
                    className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 pointer-events-auto z-[102]"
                    style={popoverStyle}
                >
                    {/* Arrow / Pointer (visual only, simplified) */}
                    <div
                        className="absolute w-4 h-4 bg-slate-900 border-t border-l border-slate-700 transform rotate-45 -top-2 left-1/2 -translate-x-1/2"
                        aria-hidden="true"
                    />

                    {/* Header */}
                    <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                                {step.icon}
                            </div>
                            <h2 className="text-base font-semibold text-slate-100">
                                {step.title}
                            </h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 text-slate-300 text-sm">
                        {step.content}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
                        {/* Step Indicators */}
                        <div className="flex items-center gap-1.5">
                            {TUTORIAL_STEPS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                        ? 'bg-indigo-500 scale-125'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-2">
                            {!isFirst && (
                                <button
                                    onClick={handlePrev}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                >
                                    <ChevronLeft className="w-3 h-3" />
                                    Précédent
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                            >
                                {isLast ? 'Terminer' : 'Suivant'}
                                {!isLast && <ChevronRight className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorialModal;
