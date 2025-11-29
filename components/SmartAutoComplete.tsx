
import React, { useState, useEffect, useRef } from 'react';
import { getSmartSuggestions, SuggestionType } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface SmartAutoCompleteProps {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type: SuggestionType;
    placeholder?: string;
    className?: string;
    isTextarea?: boolean;
    rows?: number;
    context?: string; // e.g. lesson title for objective suggestions
    required?: boolean;
    minLength?: number;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

const SmartAutoComplete: React.FC<SmartAutoCompleteProps> = ({
    id,
    value,
    onChange,
    type,
    placeholder,
    className,
    isTextarea = false,
    rows = 3,
    context = '',
    required,
    minLength,
    onKeyDown
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (value.trim().length >= 3 && showSuggestions) {
                setIsLoading(true);
                const results = await getSmartSuggestions(type, value, context);
                setSuggestions(results);
                setIsLoading(false);
            }
        }, 800); // 800ms delay

        return () => clearTimeout(timer);
    }, [value, type, context, showSuggestions]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectSuggestion = (suggestion: string) => {
        // Create a synthetic event to pass to parent onChange
        const event = {
            target: {
                id,
                value: suggestion,
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(event);
        setShowSuggestions(false);
        setSuggestions([]);
    };
    
    const handleInputFocus = () => {
        if (value.trim().length >= 3 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e);
        if (e.target.value.trim().length >= 3) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {isTextarea ? (
                <textarea
                    id={id}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    rows={rows}
                    placeholder={placeholder}
                    className={className}
                    required={required}
                    minLength={minLength}
                />
            ) : (
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className={className}
                    required={required}
                    minLength={minLength}
                    autoComplete="off"
                />
            )}
            
            {/* Loading Indicator inside input */}
            {isLoading && (
                <div className="absolute left-3 top-3 animate-pulse">
                    <SparklesIcon className="w-4 h-4 text-[var(--accent-gold)]" />
                </div>
            )}

            {/* Suggestions Dropdown - Compact and Floating */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 mx-2 bg-[#0f172a]/90 backdrop-blur-md border border-[var(--accent-gold)]/30 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up origin-top">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-[var(--accent-gold)]/20 to-transparent flex items-center gap-2 border-b border-white/5">
                        <SparklesIcon className="w-3 h-3 text-[var(--accent-gold)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">اقتراحات ذكية</span>
                    </div>
                    <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                        {suggestions.map((suggestion, index) => (
                            <li 
                                key={index}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="px-4 py-2.5 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors text-sm text-slate-200 hover:text-white spark-body leading-relaxed"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SmartAutoComplete;
