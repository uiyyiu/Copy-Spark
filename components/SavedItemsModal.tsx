
import React, { useState, useEffect } from 'react';
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
        
        // Handle generic text content types from BibleReader
        if (content && (content.type === 'simple-explanation' || content.type === 'interpretation')) {
             return (
                <div 
                    className="formatted-content spark-body-serif text-slate-200"
                    dangerouslySetInnerHTML={{ __html: formatTextToHtml(content.body) }} 
                />
             );
        }

        // Handle Lesson Plans (assuming structure from generateLessonIdeas)
        if (content && (content.lessonBody || content.lessonExplanation)) {
            const body = content.lessonBody || content.lessonExplanation;
            return (
                <div 
                    className="formatted-content spark-body-serif text-slate-200"
                    dangerouslySetInnerHTML={{ __html: formatTextToHtml(body) }} 
                />
            );
        }

        return <p className="text-slate-400">لا يمكن عرض محتوى هذا العنصر.</p>;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-3xl p-6 relative border border-white/20 shadow-2xl rounded-3xl bg-[#0f172a]/95 flex flex-col max-h-[85vh] h-[85vh]" onClick={e => e.stopPropagation()}>
                
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <ArchiveIcon className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-white font-serif">المحفوظات</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {selectedItem ? (
                        <div className="animate-fade-in h-full flex flex-col">
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm font-bold w-fit"
                            >
                                <ChevronDownIcon className="w-4 h-4 rotate-90" />
                                عودة للقائمة
                            </button>
                            <h3 className="text-xl font-bold text-amber-400 mb-4 font-serif">{selectedItem.title}</h3>
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                {renderItemContent(selectedItem)}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <SpinnerIcon className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                                    <p className="text-slate-400">جاري تحميل محفوظاتك...</p>
                                </div>
                            ) : savedItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-center">
                                    <BookmarkIcon className="w-12 h-12 text-slate-600 mb-4" />
                                    <p className="text-slate-400 text-lg">لم تقم بحفظ أي دروس بعد.</p>
                                </div>
                            ) : (
                                savedItems.map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => setSelectedItem(item)}
                                        className="bg-white/5 border border-white/5 hover:border-amber-500/30 rounded-xl p-4 transition-all hover:bg-white/10 group flex justify-between items-center cursor-pointer"
                                    >
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{item.title}</h3>
                                            <p className="text-xs text-slate-400">
                                                {new Date(item.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => handleDelete(item.id, e)}
                                                disabled={deleteLoading === item.id}
                                                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="حذف"
                                            >
                                                {deleteLoading === item.id ? (
                                                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <TrashIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedItemsModal;
