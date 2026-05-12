import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AgeGroup } from '../types';
import { LightBulbIcon, ImageIcon, TrashIcon, BookOpenIcon, UsersIcon, SparklesIcon } from './icons';
import SmartAutoComplete from './SmartAutoComplete';

interface FormData {
  lessonTitle: string;
  spiritualObjective: string;
  scriptureVerse: string;
  ageGroup: AgeGroup;
  lessonImages: Array<{ data: string; mimeType: string }>;
}

interface Step2DetailsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ageGroups: AgeGroup[] = ['ابتدائي', 'اعدادي', 'ثانوي', 'شباب', 'خريجين'];

const Step2Details: React.FC<Step2DetailsProps> = ({
  formData,
  setFormData,
  onBack,
  onSubmit,
  isLoading,
}) => {

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleAgeGroupChange = (group: AgeGroup) => {
    setFormData(prev => ({ ...prev, ageGroup: group }));
  };

  const fileToImageObject = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                const base64String = (reader.result as string).split(',')[1];
                resolve({ data: base64String, mimeType: file.type });
            } else {
                reject(new Error("Failed to read file"));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const fileList = [...files];
    try {
        const newImages = await Promise.all(fileList.map(fileToImageObject));
        setFormData(prev => ({ ...prev, lessonImages: [...prev.lessonImages, ...newImages] }));
    } catch (error) {
        console.error("Error reading files:", error);
    }
    event.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({ ...prev, lessonImages: prev.lessonImages.filter((_, index) => index !== indexToRemove)}));
  };

  return (
    <div className="w-full max-w-4xl mx-auto" dir="rtl">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-display italic tracking-tight">صقل التجربة</h2>
            <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-slate-400 font-spiritual italic">أضف التفاصيل النهائية ليصبح الدرس تحفة فنية روحية.</p>
        </motion.div>

      <form onSubmit={(e) => {e.preventDefault(); onSubmit();}} className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Scripture Verse Card */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/30 shadow-2xl relative overflow-hidden"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5">
                        <BookOpenIcon className="w-5 h-5" />
                    </div>
                    <label htmlFor="scriptureVerse" className="text-xl font-display font-black text-white italic">الشاهد الكتابي</label>
                </div>
                <SmartAutoComplete
                    id="scriptureVerse"
                    type="verse"
                    value={formData.scriptureVerse}
                    onChange={handleFieldChange}
                    placeholder="مثال: «أَمَّا أَنَا فَبِكَثْرَةِ رَحْمَتِكَ أَدْخُلُ بَيْتَكَ»"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-right font-spiritual italic text-lg px-6 py-4 placeholder-slate-600 text-white shadow-inner"
                />
            </motion.div>

            {/* Age Group Card */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/30 shadow-2xl"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sky-400 border border-white/5">
                        <UsersIcon className="w-5 h-5" />
                    </div>
                    <label className="text-xl font-display font-black text-white italic">الفئة المستهدفة</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {ageGroups.map((group) => (
                        <button
                            key={group}
                            type="button"
                            onClick={() => handleAgeGroupChange(group)}
                            className={`px-4 py-3 text-sm font-black rounded-xl transition-all duration-300 border font-display italic tracking-tight ${
                                formData.ageGroup === group
                                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
        
        {/* Image Upload Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 rounded-[3rem] border border-white/5 bg-slate-900/30 shadow-2xl"
        >
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5">
                    <ImageIcon className="w-5 h-5" />
                </div>
                <label className="text-xl font-display font-black text-white italic">تحليل الوسائل البصرية</label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                <AnimatePresence>
                    {formData.lessonImages.map((image, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative group aspect-square"
                        >
                            <img 
                                src={`data:${image.mimeType};base64,${image.data}`} 
                                alt="Preview" 
                                className="w-full h-full object-cover rounded-[1.5rem] border border-white/10 shadow-2xl transition-all group-hover:scale-105" 
                            />
                            <button 
                                onClick={() => handleRemoveImage(index)} 
                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 transition-all shadow-xl opacity-0 group-hover:opacity-100"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-950/40 rounded-[1.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center w-full aspect-square hover:border-amber-500/50 hover:bg-white/5 transition-all group">
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-amber-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">إضافة صورة</p>
                    </div>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} multiple />
                </label>
            </div>
            <p className="text-xs text-slate-500 font-spiritual italic mt-6">* ارفع صورة لأيقونة أو وسيلة إيضاح لدمجها في التحضير</p>
        </motion.div>

        <div className="flex justify-between items-center pt-8 gap-6">
          <button
            type="button"
            onClick={onBack}
            className="px-10 py-5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all text-sm font-black border border-white/5 font-display italic tracking-widest uppercase"
          >
            رجوع
          </button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex-grow flex items-center justify-center gap-4 bg-white text-black font-black py-5 px-8 rounded-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 font-display italic text-xl">توليد المحتوى الذكي</span>
            <SparklesIcon className="w-6 h-6 relative z-10 animate-pulse" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default Step2Details;
