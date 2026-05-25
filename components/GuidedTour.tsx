import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Compass, ChevronRight, ChevronLeft, X } from 'lucide-react';

export interface TourStep {
    targetId: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface GuidedTourProps {
    isOpen: boolean;
    onClose: () => void;
    steps: TourStep[];
    tourKey: string;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, steps }) => {
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Track active step
    const step = steps[currentStepIdx];

    useEffect(() => {
        if (!isOpen || !step) {
            setCoords(null);
            return;
        }

        const updatePosition = () => {
            const el = document.getElementById(step.targetId);
            if (el) {
                // Scroll the element gently into view
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Set coords of the targeted element relative to the viewport
                const rect = el.getBoundingClientRect();
                setCoords({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            } else {
                setCoords(null);
            }
        };

        // Run immediately
        updatePosition();

        // Run again after a brief timeout to guarantee it catches any rendering or scrolling settle down
        const timer = setTimeout(updatePosition, 300);

        // Listen to resize and scroll globally anywhere in the app (capturing phase)
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { capture: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, { capture: true });
        };
    }, [isOpen, currentStepIdx, step]);

    // Reset progress when tour opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStepIdx(0);
        }
    }, [isOpen]);

    if (!isOpen || !step || typeof document === 'undefined') return null;

    const handleNext = () => {
        if (currentStepIdx < steps.length - 1) {
            setCurrentStepIdx(currentStepIdx + 1);
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStepIdx > 0) {
            setCurrentStepIdx(currentStepIdx - 1);
        }
    };

    const isCenter = !coords;
    const position = step.position || 'bottom';

    // Calculate Popover coordinates relative to the highlighted element's viewport coords
    let popoverStyle: React.CSSProperties = {};
    if (coords) {
        const gap = 12;
        if (position === 'bottom') {
            popoverStyle = {
                top: coords.top + coords.height + gap,
                left: Math.max(16, Math.min(window.innerWidth - 340, coords.left + coords.width / 2 - 160)),
            };
        } else if (position === 'top') {
            popoverStyle = {
                top: Math.max(16, coords.top - gap - 200), // Adjusted height estimation
                left: Math.max(16, Math.min(window.innerWidth - 340, coords.left + coords.width / 2 - 160)),
            };
        } else if (position === 'left') {
            popoverStyle = {
                top: coords.top,
                left: Math.max(16, coords.left - 340),
            };
        } else if (position === 'right') {
            popoverStyle = {
                top: coords.top,
                left: Math.min(window.innerWidth - 350, coords.left + coords.width + gap),
            };
        }
    }

    const tourContent = (
        <div className="fixed inset-0 z-[99999] overflow-hidden font-sans text-right select-none pointer-events-none" dir="rtl">
            {/* Dark Backdrop with spotlight hole */}
            <div 
                className="fixed inset-0 bg-black/75 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-auto"
                onClick={onClose}
                style={coords ? {
                    // Spotlights the element using a radial path mask
                    clipPath: `path('M 0 0 L ${window.innerWidth} 0 L ${window.innerWidth} ${window.innerHeight} L 0 ${window.innerHeight} Z M ${coords.left - 4} ${coords.top - 4} L ${coords.left + coords.width + 4} ${coords.top - 4} L ${coords.left + coords.width + 4} ${coords.top + coords.height + 4} L ${coords.left - 4} ${coords.top + coords.height + 4} Z')`,
                } : undefined}
            />

            {/* Glowing Spotlight box surrounding the target directly */}
            {coords && (
                <div 
                    className="fixed border-2 border-amber-400 rounded-2xl pointer-events-none animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all duration-300 z-[99999]"
                    style={{
                        top: coords.top - 6,
                        left: coords.left - 6,
                        width: coords.width + 12,
                        height: coords.height + 12,
                    }}
                />
            )}

            {/* The Tour Card */}
            <div 
                ref={popoverRef}
                className={`fixed z-[100000] w-[calc(100vw-32px)] max-w-sm p-6 bg-[#0f172a]/95 border-2 border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-3xl transition-all duration-300 translate-y-0 pointer-events-auto
                    ${isCenter 
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-amber-400' 
                        : ''
                    }`}
                style={isCenter ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } : popoverStyle}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-400 animate-bounce">
                            <Compass className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-slate-100 font-serif">مرشد سبارك 🗺️</h4>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="إنهاء الجولة"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="space-y-3 mb-6">
                    <p className="text-amber-400 text-sm font-bold">{step.title}</p>
                    <p className="text-slate-300 text-xs leading-relaxed font-medium">
                        {step.description}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    {/* Page circles / Steps indicator */}
                    <div className="flex items-center gap-1">
                        {steps.map((_, idx) => (
                            <span 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentStepIdx ? 'w-4 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'w-1.5 bg-white/20'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStepIdx > 0 && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                                <span>السابق</span>
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all text-xs font-black shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95"
                        >
                            <span>{currentStepIdx === steps.length - 1 ? 'فهمت! 🚀' : 'التالي'}</span>
                            {currentStepIdx < steps.length - 1 && <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(tourContent, document.body);
};

export default GuidedTour;
