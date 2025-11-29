
export interface BibleBook {
    id: string;
    name: string;
    chapters: number;
    testament: 'old' | 'new';
    group: string; // e.g., Pentateuch, Gospels, etc.
}

export const bibleBooks: BibleBook[] = [
    // --- Old Testament ---
    // Pentateuch
    { id: 'Gen', name: 'سفر التكوين', chapters: 50, testament: 'old', group: 'الشريعة' },
    { id: 'Exod', name: 'سفر الخروج', chapters: 40, testament: 'old', group: 'الشريعة' },
    { id: 'Lev', name: 'سفر اللاويين', chapters: 27, testament: 'old', group: 'الشريعة' },
    { id: 'Num', name: 'سفر العدد', chapters: 36, testament: 'old', group: 'الشريعة' },
    { id: 'Deut', name: 'سفر التثنية', chapters: 34, testament: 'old', group: 'الشريعة' },
    // Historical
    { id: 'Josh', name: 'سفر يشوع', chapters: 24, testament: 'old', group: 'التاريخية' },
    { id: 'Judg', name: 'سفر القضاة', chapters: 21, testament: 'old', group: 'التاريخية' },
    { id: 'Ruth', name: 'سفر راعوث', chapters: 4, testament: 'old', group: 'التاريخية' },
    { id: '1Sam', name: 'سفر صموئيل الأول', chapters: 31, testament: 'old', group: 'التاريخية' },
    { id: '2Sam', name: 'سفر صموئيل الثاني', chapters: 24, testament: 'old', group: 'التاريخية' },
    { id: '1Kgs', name: 'سفر الملوك الأول', chapters: 22, testament: 'old', group: 'التاريخية' },
    { id: '2Kgs', name: 'سفر الملوك الثاني', chapters: 25, testament: 'old', group: 'التاريخية' },
    { id: '1Chr', name: 'سفر أخبار الأيام الأول', chapters: 29, testament: 'old', group: 'التاريخية' },
    { id: '2Chr', name: 'سفر أخبار الأيام الثاني', chapters: 36, testament: 'old', group: 'التاريخية' },
    { id: 'Ezra', name: 'سفر عزرا', chapters: 10, testament: 'old', group: 'التاريخية' },
    { id: 'Neh', name: 'سفر نحميا', chapters: 13, testament: 'old', group: 'التاريخية' },
    { id: 'Esth', name: 'سفر أستير', chapters: 10, testament: 'old', group: 'التاريخية' },
    // Poetic
    { id: 'Job', name: 'سفر أيوب', chapters: 42, testament: 'old', group: 'الشعرية' },
    { id: 'Ps', name: 'سفر المزامير', chapters: 151, testament: 'old', group: 'الشعرية' }, // Coptic/Septuagint numbering usually includes 151
    { id: 'Prov', name: 'سفر الأمثال', chapters: 31, testament: 'old', group: 'الشعرية' },
    { id: 'Eccl', name: 'سفر الجامعة', chapters: 12, testament: 'old', group: 'الشعرية' },
    { id: 'Song', name: 'سفر نشيد الأنشاد', chapters: 8, testament: 'old', group: 'الشعرية' },
    // Major Prophets
    { id: 'Isa', name: 'سفر إشعياء', chapters: 66, testament: 'old', group: 'الأنبياء الكبار' },
    { id: 'Jer', name: 'سفر إرميا', chapters: 52, testament: 'old', group: 'الأنبياء الكبار' },
    { id: 'Lam', name: 'سفر مراثي إرميا', chapters: 5, testament: 'old', group: 'الأنبياء الكبار' },
    { id: 'Ezek', name: 'سفر حزقيال', chapters: 48, testament: 'old', group: 'الأنبياء الكبار' },
    { id: 'Dan', name: 'سفر دانيال', chapters: 12, testament: 'old', group: 'الأنبياء الكبار' },
    // Minor Prophets
    { id: 'Hos', name: 'سفر هوشع', chapters: 14, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Joel', name: 'سفر يوئيل', chapters: 3, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Amos', name: 'سفر عاموس', chapters: 9, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Obad', name: 'سفر عوبديا', chapters: 1, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Jonah', name: 'سفر يونان', chapters: 4, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Mic', name: 'سفر ميخا', chapters: 7, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Nah', name: 'سفر ناحوم', chapters: 3, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Hab', name: 'سفر حبقوق', chapters: 3, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Zeph', name: 'سفر صفنيا', chapters: 3, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Hag', name: 'سفر حجي', chapters: 2, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Zech', name: 'سفر زكريا', chapters: 14, testament: 'old', group: 'الأنبياء الصغار' },
    { id: 'Mal', name: 'سفر ملاخي', chapters: 4, testament: 'old', group: 'الأنبياء الصغار' },

    // --- New Testament ---
    // Gospels
    { id: 'Matt', name: 'إنجيل متى', chapters: 28, testament: 'new', group: 'الأناجيل' },
    { id: 'Mark', name: 'إنجيل مرقس', chapters: 16, testament: 'new', group: 'الأناجيل' },
    { id: 'Luke', name: 'إنجيل لوقا', chapters: 24, testament: 'new', group: 'الأناجيل' },
    { id: 'John', name: 'إنجيل يوحنا', chapters: 21, testament: 'new', group: 'الأناجيل' },
    // History
    { id: 'Acts', name: 'سفر أعمال الرسل', chapters: 28, testament: 'new', group: 'التاريخية' },
    // Pauline Epistles
    { id: 'Rom', name: 'الرسالة إلى رومية', chapters: 16, testament: 'new', group: 'رسائل بولس' },
    { id: '1Cor', name: 'الرسالة الأولى إلى كورنثوس', chapters: 16, testament: 'new', group: 'رسائل بولس' },
    { id: '2Cor', name: 'الرسالة الثانية إلى كورنثوس', chapters: 13, testament: 'new', group: 'رسائل بولس' },
    { id: 'Gal', name: 'الرسالة إلى غلاطية', chapters: 6, testament: 'new', group: 'رسائل بولس' },
    { id: 'Eph', name: 'الرسالة إلى أفسس', chapters: 6, testament: 'new', group: 'رسائل بولس' },
    { id: 'Phil', name: 'الرسالة إلى فيلبي', chapters: 4, testament: 'new', group: 'رسائل بولس' },
    { id: 'Col', name: 'الرسالة إلى كولوسي', chapters: 4, testament: 'new', group: 'رسائل بولس' },
    { id: '1Thess', name: 'الرسالة الأولى إلى تسالونيكي', chapters: 5, testament: 'new', group: 'رسائل بولس' },
    { id: '2Thess', name: 'الرسالة الثانية إلى تسالونيكي', chapters: 3, testament: 'new', group: 'رسائل بولس' },
    { id: '1Tim', name: 'الرسالة الأولى إلى تيموثاوس', chapters: 6, testament: 'new', group: 'رسائل بولس' },
    { id: '2Tim', name: 'الرسالة الثانية إلى تيموثاوس', chapters: 4, testament: 'new', group: 'رسائل بولس' },
    { id: 'Titus', name: 'الرسالة إلى تيطس', chapters: 3, testament: 'new', group: 'رسائل بولس' },
    { id: 'Phlm', name: 'الرسالة إلى فليمون', chapters: 1, testament: 'new', group: 'رسائل بولس' },
    { id: 'Heb', name: 'الرسالة إلى العبرانيين', chapters: 13, testament: 'new', group: 'رسائل بولس' },
    // Catholic Epistles
    { id: 'Jas', name: 'رسالة يعقوب', chapters: 5, testament: 'new', group: 'الرسائل الجامعة' },
    { id: '1Pet', name: 'رسالة بطرس الأولى', chapters: 5, testament: 'new', group: 'الرسائل الجامعة' },
    { id: '2Pet', name: 'رسالة بطرس الثانية', chapters: 3, testament: 'new', group: 'الرسائل الجامعة' },
    { id: '1John', name: 'رسالة يوحنا الأولى', chapters: 5, testament: 'new', group: 'الرسائل الجامعة' },
    { id: '2John', name: 'رسالة يوحنا الثانية', chapters: 1, testament: 'new', group: 'الرسائل الجامعة' },
    { id: '3John', name: 'رسالة يوحنا الثالثة', chapters: 1, testament: 'new', group: 'الرسائل الجامعة' },
    { id: 'Jude', name: 'رسالة يهوذا', chapters: 1, testament: 'new', group: 'الرسائل الجامعة' },
    // Prophecy
    { id: 'Rev', name: 'سفر رؤيا يوحنا اللاهوتي', chapters: 22, testament: 'new', group: 'النبوية' },
];
