
import React from 'react';
import type { AgeGroup } from '../types';
import { LightBulbIcon, ImageIcon, TrashIcon, BookOpenIcon, UsersIcon } from './icons';
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        onSubmit();
    }
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

    for (const file of fileList) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert(`حجم الصورة "${file.name}" كبير جداً. من فضلك اختر صورة أصغر من 10MB.`);
            return;
        }
    }

    try {
        const newImages = await Promise.all(fileList.map(fileToImageObject));
        setFormData(prev => ({ ...prev, lessonImages: [...prev.lessonImages, ...newImages] }));
    } catch (error) {
        console.error("Error reading files:", error);
        alert("حدث خطأ أثناء قراءة الصور.");
    }
    
    event.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({ ...prev, lessonImages: prev.lessonImages.filter((_, index) => index !== indexToRemove)}));
  };

  return (
    <div className="animate-fade-in">
        <div className="text-center mb-8">
            <h2 className="spark-h1 text-white drop-shadow-md">الخطوة 2: تفاصيل إضافية</h2>
            <p className="spark-body text-slate-300 mt-2">أضف بعض التفاصيل الاختيارية لنتائج أكثر تخصيصًا.</p>
        </div>
      <form onSubmit={(e) => {e.preventDefault(); onSubmit();}} className="space-y-6 mt-8">
        
        {/* Scripture Verse Card */}
        <div className="glass-card p-6 rounded-2xl shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <BookOpenIcon className="w-5 h-5 text-white" />
                <label htmlFor="scriptureVerse" className="spark-h3 text-white">
                    آية الدرس (اختياري)
                </label>
            </div>
            <div>
                <SmartAutoComplete
                    id="scriptureVerse"
                    type="verse"
                    value={formData.scriptureVerse}
                    onChange={handleFieldChange}
                    onKeyDown={handleKeyDown}
                    placeholder="مثال: «أَمَّا أَنَا فَبِكَثْرَةِ رَحْمَتِكَ أَدْخُلُ بَيْتَكَ» (مز 5: 7)"
                    className="w-full bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--accent-gold)] focus:border-[var(--accent-gold)] transition text-right spark-body px-4 py-3 text-white placeholder-slate-500"
                />
                <p className="spark-caption text-slate-400 text-right mt-2">إذا قمت بإضافة آية، سيتم توليد أفكار ألعاب خاصة بها.</p>
            </div>
        </div>

        {/* Age Group Card */}
        <div id="age-group-selector" className="glass-card p-6 rounded-2xl shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <UsersIcon className="w-5 h-5 text-white" />
                <label className="spark-h3 text-white">
                    المرحلة العمرية
                </label>
            </div>
            <div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {ageGroups.map((group) => (
                        <button
                            key={group}
                            type="button"
                            onClick={() => handleAgeGroupChange(group)}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border ${
                                formData.ageGroup === group
                                    ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold-hover)] shadow-sm'
                                    : 'bg-transparent text-slate-300 border-white/10 hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]'
                            }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Image Upload Card */}
        <div id="image-upload-container" className="glass-card p-6 rounded-2xl shadow-sm transition-colors">
             <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-5 h-5 text-white" />
                <label className="spark-h3 text-white">
                    شرح الدرس (اختياري)
                </label>
            </div>
            <div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {formData.lessonImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img 
                                src={`data:${image.mimeType};base64,${image.data}`} 
                                alt={`معاينة الشرح ${index + 1}`} 
                                className="w-full h-full object-cover rounded-lg border border-white/10" 
                            />
                            <button 
                                onClick={() => handleRemoveImage(index)} 
                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
                                aria-label="Remove image"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center w-full aspect-square hover:border-[var(--accent-gold)] transition-colors">
                        <div className="text-center p-2">
                            <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
                            <p className="mt-2 spark-caption text-slate-400">
                                <span className="font-semibold text-[var(--accent-gold)]">ارفع صورة</span>
                            </p>
                        </div>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} multiple />
                    </label>
                </div>
                <p className="spark-caption text-slate-400 text-right mt-2">يمكنك رفع عدة صور لشرح الدرس. (PNG, JPG, WEBP)</p>
            </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold border border-white/10"
          >
            السابق
          </button>
          <button
            id="generate-ideas-button"
            type="submit"
            disabled={isLoading}
            className="w-1/2 flex items-center justify-center gap-3 bg-[var(--accent-gold)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--accent-gold-hover)] transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <LightBulbIcon className="w-6 h-6" />
            <span className="spark-body font-bold">ولّد أفكار</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2Details;
