import React, { useState, useEffect, useMemo } from 'react';
import { SparklesIcon } from './icons';

// 1. قائمة النصوص الملهمة مع تحديد المدة الزمنية لكل نوع
const shortMessages = [
    "أنا بساعدك في ترتيب الأفكار… لكن قلبك هو اللي يصنع الدرس.",
    "بكتب معاك… مش مكانك.",
    "اعتمد عليا في المساعدة… مش في كل حاجة.",
    "شرارة الإلهام تبدأ هنا… وتنتهي بصلاتك.",
    "أنا أُعِدّ لك الأدوات… وأنت تبني الدرس.",
    "الأفكار مني… والروح منك.",
    "فكر فيّ كخادم مساعد… تحت إيدك.",
    "كل فكرة تحتاج لمسة خادم أمين.",
    "أنا أُنظّم… وأنت تُلهِم.",
    "مهمتي أوفّر وقتك… لتركز في الأهم.",
];

const mediumMessages = [
    "أنا بقدّم لك أفكار، لكن عمق الخدمة بييجي من تحضيرك الشخصي.",
    "لو ساعدتك في الشرح… دورك إنك تراجع، تفكّر وتضيف بصمتك.",
    "استخدمني كنقطة بداية قوية، ثم انطلق بإبداعك الخاص.",
    "أفضل الدروس هي التي تمزج بين فكرة جيدة وقلب خادم مُصَلِّي.",
    "أنا أُعِدّ لك الهيكل، لكنك أنت من يملأه بالروح والحياة.",
    "تذكر دائمًا: التكنولوجيا أداة، والمحبة هي الرسالة.",
    "التحضير الجيد هو صلاة… وأنا أساعدك في جزء منها.",
];

const longMessages = [
    "أنا بساعدك تولّد أفكار وتنظيم الدرس… لكن خادم فاهم بيكمّل الرحلة بالتحضير، والصلاة، والتأمل الشخصي.",
    "المحتوى اللي هطلعه لك مجرد بداية… أنت اللي بتحوله لتجربة حقيقية تناسب أولادك وشخصياتهم.",
    "حتى لو ساعدتك بالأفكار، تحضيرك الشخصي وتأملك في الكلمة أهم من أي كتابة جاهزة.",
    "أنا أُسرّع لك عملية البحث والتنظيم، لكي يتسع وقتك للتأمل والصلاة من أجل كل طفل في فصلك.",
    "لا تنسَ أن أفضل وسيلة إيضاح هي حياتك، وأقوى تطبيق هو محبتك... وهذه أشياء لا يمكنني كتابتها لك.",
];

const allMessages = [
    ...shortMessages.map(text => ({ text, duration: 1200 })),
    ...mediumMessages.map(text => ({ text, duration: 1600 })),
    ...longMessages.map(text => ({ text, duration: 2400 })),
];

// دالة لخلط الرسائل بشكل عشوائي
const shuffleArray = (array: typeof allMessages) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const LoadingSpinner: React.FC = () => {
  // خلط الرسائل مرة واحدة فقط عند تحميل المكون
  const shuffledMessages = useMemo(() => shuffleArray([...allMessages]), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true); // Fade in the new message
    const currentMessage = shuffledMessages[currentIndex];

    // 2. تعيين مؤقت لبدء حركة الإخفاء (Fade-out)
    const timer = setTimeout(() => {
        setIsVisible(false);
        
        // بعد انتهاء حركة الإخفاء، يتم تغيير المؤشر لبدء الدورة التالية
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledMessages.length);
        }, 400); // يجب أن يتطابق هذا الوقت مع مدة الـ transition

    }, currentMessage.duration);

    return () => clearTimeout(timer);

  }, [currentIndex, shuffledMessages]);

  return (
    // 3. تحديث التصميم ليكون أبسط وأكثر أناقة مع تعديل الموضع
    <div className="flex flex-col items-center justify-center gap-6 text-center py-20 min-h-[50vh]">
      <div className="relative">
        <SparklesIcon className="w-16 h-16 text-[var(--accent-gold)] animate-pulse" />
      </div>
      <p className={`spark-body font-medium text-amber-600 dark:text-amber-400 transition-opacity duration-300 h-12 flex items-center justify-center px-4 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {shuffledMessages[currentIndex].text}
      </p>
    </div>
  );
};

export default LoadingSpinner;
