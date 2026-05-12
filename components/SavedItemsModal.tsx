import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSavedLessons, deleteSavedLesson } from '../services/supabase';
import { XMarkIcon, TrashIcon, ArchiveIcon, SpinnerIcon, BookmarkIcon, ChevronDownIcon } from './icons';
import { formatTextToHtml } from '../services/exportService';

interface SavedItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

const SavedItemsModal: React.FC<SavedItemsModalProps> = ({ isOpen, onClose, userId }) => {
    const [savedItems, setSavedItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchSavedItems();
            setSelectedItem(null);
        }
    }, [isOpen, userId]);

    const fetchSavedItems = async () => {
        setIsLoading(true);
        try {
            const data = await getSavedLessons(userId);
            setSavedItems(data || []);
        } catch (error) {
            console.error("Error fetching saved lessons:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
            setDeleteLoading(id);
            try {
                await deleteSavedLesson(id);
                setSavedItems(prev => prev.filter(item => item.id !== id));
                if (selectedItem?.id === id) setSelectedItem(null);
            } catch (error) {
                console.error("Error deleting item:", error);
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    const renderItemContent = (item: any) => {
        const content = item.content;
        
        if (content && (content.type === 'simple-explanation' || content.type === 'interpretation')) {
             return (
                <div 
                    className="formatted-content font-spiritual italic text-slate-300 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: formatTextToHtml(content.body) }} 
                />
             );
        }

        if (content && (content.lessonBody || content.lessonExplanation)) {
            const body = content.lessonBody || content.lessonExplanation;
            return (
                <div 
                    className="formatted-content font-spiritual italic text-slate-300 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: formatTextToHtml(body) }} 
                />
            );
        }

        return <p className="text-slate-500 font-spiritual italic">لا يمكن عرض محتوى هذا العنصر فنيّاً.</p>;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-10 no-print"
                    dir="rtl"
                >
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={onClose}></div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 50 }}
                        className="glass-card w-full max-w-5xl h-[85vh] relative border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[4rem] overflow-hidden bg-slate-950/60 z-10 flex flex-col" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-10 pb-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                                    <ArchiveIcon className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-black text-white font-display italic tracking-tight uppercase">خزانة السحاب</h2>
                                    <p className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase mt-1">Archived Spiritual Lessons</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 rounded-2xl text-slate-600 hover:text-white hover:bg-white/5 transition-all">
                                <XMarkIcon className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-slate-950/20 shadow-inner">
                            {selectedItem ? (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="h-full flex flex-col"
                                >
                                    <button 
                                        onClick={() => setSelectedItem(null)}
                                        className="flex items-center gap-3 text-slate-500 hover:text-amber-500 mb-8 font-black font-display italic uppercase tracking-widest text-xs transition-all group"
                                    >
                                        <ChevronDownIcon className="w-5 h-5 rotate-90 group-hover:-translate-x-1 transition-transform" />
                                        العودة لأرشفة الدروس
                                    </button>
                                    
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                        <h3 className="text-4xl font-black text-amber-400 font-display italic tracking-tight">{selectedItem.title}</h3>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                                            {new Date(selectedItem.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    <div className="glass-card bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                                        {renderItemContent(selectedItem)}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center h-80 gap-6">
                                            <div className="w-16 h-16 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin"></div>
                                            <p className="text-slate-600 font-display italic uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Cloud Archive...</p>
                                        </div>
                                    ) : savedItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-80 text-center gap-6 opacity-40">
                                            <BookmarkIcon className="w-20 h-20 text-slate-700" />
                                            <p className="text-xl text-slate-500 font-spiritual italic">لم تكتمل أرشفة أي دروس بعد..</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                            {savedItems.map((item, idx) => (
                                                <motion.div 
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => setSelectedItem(item)}
                                                    className="glass-card bg-slate-900/60 border border-white/5 hover:border-amber-500/30 rounded-[2rem] p-8 transition-all duration-500 hover:bg-slate-900/90 group flex justify-between items-center cursor-pointer shadow-xl hover:-translate-y-2"
                                                >
                                                    <div className="flex-grow">
                                                        <h3 className="text-xl font-black text-white mb-2 font-display italic tracking-tight group-hover:text-amber-400 transition-colors uppercase">{item.title}</h3>
                                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] font-spiritual">
                                                            {new Date(item.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button 
                                                            onClick={(e) => handleDelete(item.id, e)}
                                                            disabled={deleteLoading === item.id}
                                                            className="w-12 h-12 rounded-xl text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                        >
                                                            {deleteLoading === item.id ? (
                                                                <SpinnerIcon className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <TrashIcon className="w-6 h-6" />
                                                            )}
                                                        </button>
                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                                            <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        {!selectedItem && (
                            <div className="p-10 border-t border-white/5 bg-slate-950/40 text-center">
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Every archived lesson is a seed of eternity stored in your digital cloud</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SavedItemsModal;
