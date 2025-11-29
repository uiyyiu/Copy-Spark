import React, { useState, useEffect } from 'react';
import { CloseIcon, CopyIcon, CheckCircleIcon } from './icons';

interface ModalProps {
    isOpen: boolean;
    title: string;
    content: string;
    isShare: boolean;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, content, isShare, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsCopied(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--card-bg-light)] rounded-2xl shadow-xl w-full max-w-lg animate-fade-in-up border border-[var(--border-light)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-[var(--border-light)]">
                    <h3 className="spark-h2 text-[var(--text-light-primary)]" style={{ margin: 0 }}>{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--text-light-secondary)] hover:bg-gray-500/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto whitespace-pre-wrap spark-body text-[var(--text-light-secondary)]">
                    {content}
                </div>
                {isShare && (
                    <div className="p-4 border-t border-[var(--border-light)] text-right">
                        <button 
                            onClick={handleCopy}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)] text-white rounded-lg hover:bg-[var(--accent-gold-hover)] transition-colors text-sm font-semibold"
                        >
                            {isCopied ? <CheckCircleIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                            {isCopied ? 'تم النسخ!' : 'انسخ النص'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;