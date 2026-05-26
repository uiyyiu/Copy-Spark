
import { GoogleGenAI, Type } from "@google/genai";
import type { LessonPlan, Idea, IdeaSection, AgeGroup, ChatMessage, ConcordanceResult } from '../types';

// Keep track of the active user key index
let activeUserKeyIndex = 0;

// Helper to get all stored user keys
export const getUserKeys = (): string[] => {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem('user_gemini_key') || '';
    return stored
        .split(/[,\s;\n]+/)
        .map(k => k.trim())
        .filter(k => k.length > 10 && k.startsWith('AIzaSy'));
};

// Helper to get the AI client dynamically.
// This allows switching between the system key and the user's custom key(s).
const getGenAI = (useSystemKeyOnly = false): { client: GoogleGenAI | null, isUserKey: boolean, keysCount: number } => {
    const keys = useSystemKeyOnly ? [] : getUserKeys();
    if (keys.length > 0) {
        const index = activeUserKeyIndex % keys.length;
        const keyToUse = keys[index];
        return {
            client: new GoogleGenAI({ apiKey: keyToUse }),
            isUserKey: true,
            keysCount: keys.length
        };
    }
    
    const keyToUse = process.env.API_KEY;
    if (!keyToUse) {
        return { client: null, isUserKey: false, keysCount: 0 };
    }
    return {
        client: new GoogleGenAI({ apiKey: keyToUse }),
        isUserKey: false,
        keysCount: 0
    };
};

// --- Retry Logic Helper ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// RESTORED & ENHANCED: Robust logic with auto-rotation.
// Fast retries (1s) cause immediate fail on Rate Limits. 
// We wait longer (2000ms) for standard quota resets, but can rotate keys instantly.
async function generateWithRetry(model: string, params: any, retries = 3, delay = 2000, keysTried = 0, useSystemKeyOnly = false): Promise<any> {
    const aiConfig = getGenAI(useSystemKeyOnly);
    if (!aiConfig.client) {
        throw new Error("مفتاح API غير موجود. يرجى إضافته في الإعدادات.");
    }

    try {
        const callParams = { model, ...params };
        return await aiConfig.client.models.generateContent(callParams);
    } catch (error: any) {
        const status = error.status || error.response?.status;
        const message = error.message || '';

        const isRateLimit = status === 429 || message.toLowerCase().includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('exhausted') || message.toLowerCase().includes('rate limit');
        const isApiKeyError = 
            status === 403 || 
            (status === 400 && message.toLowerCase().includes('api key')) || 
            message.toLowerCase().includes('api key not valid') ||
            message.toLowerCase().includes('api_key_invalid') ||
            message.toLowerCase().includes('key not valid') ||
            message.toLowerCase().includes('api key is invalid');
        const isServerOverloaded = status === 503;
        const isInternalError = status >= 500;
        const isNetworkError = message.includes('fetch failed') || message.includes('network') || message.includes('Load failed');

        // Check if we can rotate the user's keys automatically
        if (aiConfig.isUserKey && aiConfig.keysCount > 1 && keysTried < aiConfig.keysCount - 1) {
            console.warn(`[API Rotation] Key index ${activeUserKeyIndex % aiConfig.keysCount} got error (${status || message}). Rotating to next key...`);
            activeUserKeyIndex = (activeUserKeyIndex + 1) % aiConfig.keysCount;
            // Immediate retry with the next key, indexing the keys tried
            return generateWithRetry(model, params, retries, delay, keysTried + 1, useSystemKeyOnly);
        }

        // Permanent Errors (No Retry)
        if (isApiKeyError) {
            if (aiConfig.isUserKey) {
                 // Try falling back to system key if available
                 const systemConfig = getGenAI(true);
                 if (systemConfig.client) {
                     console.warn("[API Fallback] User key is invalid or expired. Falling back to system key...");
                     return generateWithRetry(model, params, retries, delay, keysTried, true);
                 }
                 throw new Error("مفتاح API الشخصي الذي أدخلته غير صالح أو منتهي الصلاحية. يرجى التحقق منه في الإعدادات.");
            }
            throw new Error("مفتاح API غير صالح.");
        }

        // Retryable Errors with delay:
        if (retries > 0 && (isRateLimit || isServerOverloaded || isInternalError || isNetworkError)) {
            const waitTime = (isRateLimit || isServerOverloaded) ? delay * 2 : delay;
            
            console.warn(`Gemini API Warning: ${status || 'Network'}. Retrying in ${waitTime}ms... (Attempts left: ${retries})`);
            await sleep(waitTime);
            
            // Exponential backoff
            return generateWithRetry(model, params, retries - 1, waitTime, keysTried, useSystemKeyOnly);
        }
        
        // Final Friendly Error Messages
        if (isRateLimit) {
            if (aiConfig.isUserKey) {
                if (aiConfig.keysCount > 1) {
                    throw new Error("لقد نفذت حدود الاستخدام (Rate Limit) لجميع مفاتيح API المضافة. يرجى المحاولة بعد دقيقة حتى يعاد تعيين الحصص المتاحة.");
                } else {
                    // Try falling back to the system key on rate limits too as a final resort
                    const systemConfig = getGenAI(true);
                    if (systemConfig.client) {
                        console.warn("[API Fallback] User key rate limited. Trying system key...");
                        return generateWithRetry(model, params, retries, delay, keysTried, true);
                    }
                    throw new Error("لقد تجاوزت حركة المرور المسموح بها لمفتاح API الشخصي الخاص بك (Rate Limit). يرجى المحاولة بعد دقيقة، أو إضافة عدة مفاتيح مفصولة بفاصلة لتدويرها تلقائياً.");
                }
            } else {
                throw new Error("API_LIMIT_REACHED: عفواً، لقد نفذ حد الاستخدام للخدمة المجانية المدمجة اليوم بسبب الضغط العالي. يرجى إضافة مفتاح API خاص بك (يمكنك إضافة عدة مفاتيح مفصولة بفاصلة لتدويرها تلقائياً) لتفادي أي انقطاع ولتكملة العمل فوراً وبدون قيود.");
            }
        }
        if (isServerOverloaded) {
            throw new Error("سيرفرات جوجل مشغولة حالياً (503). الخدمة تواجه ضغطاً عالياً.");
        }
        if (isNetworkError) {
            throw new Error("فشل الاتصال بالإنترنت. يرجى التحقق من الشبكة.");
        }
        
        throw error;
    }
}

export type SuggestionType = 'title' | 'objective' | 'verse';

const structureIdeas = (ideaSection: { title: string; ideas: string[] }): IdeaSection => {
    return {
        title: ideaSection.title,
        ideas: ideaSection.ideas.map((ideaText: string): Idea => ({
            id: crypto.randomUUID(),
            text: ideaText,
            selected: false,
        }))
    };
};

const referencesContext = `
المصادر المعتمدة للبحث والتحضير:
1. تفاسير: القمص تادرس يعقوب ملطي، القمص أنطونيوس فكري، Catena Aurea (أقوال الآباء).
2. آباء: مجموعة نيقية (NPNF) (أثناسيوس، كيرلس الكبير، ذهبي الفم)، بستان الرهبان.
3. ليتورجيا: الخولاجي، السنكسار، التسبحة.
4. عقيدة: تجسد الكلمة (أثناسيوس)، كتب البابا شنودة الثالث، كتاب المسيح واحد (القديس كيرلس).
5. مخطوطات وأصول: Codex Sinaiticus, Center for the Study of New Testament Manuscripts (CSNTM), Old Testament Textual Criticism.
`;

const systemInstruction = `
أنت خادم كنيسة قبطية أرثوذكسية مخضرم وباحث لاهوتي دقيق، متخصص في خدمة مدارس الأحد.
مهمتك هي إعداد دروس مشبعة ووافية جداً.
`;

export async function generateLessonIdeas(
    lessonTitle: string, 
    spiritualObjective: string, 
    ageGroup: AgeGroup, 
    lessonImages: Array<{ data: string; mimeType: string }>,
    scriptureVerse: string
): Promise<LessonPlan> {
    try {
        const hasVerse = scriptureVerse.trim() !== '';
        
        const lessonPlanSchema: any = {
            type: Type.OBJECT,
            properties: {
                lessonElements: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of 5-7 main detailed points/elements of the lesson story and spiritual meaning." 
                },
                lessonBody: { 
                    type: Type.STRING, 
                    description: "A VERY DETAILED, comprehensive explanation of the lesson. MUST be at least 800 words. Tell the full story with all details, not just a summary. If the Age Group is 'ابتدائي' (Elementary), you MUST use a very simple, engaging, childish storytelling style (كان يا ما كان...) suitable for young children, simplified but detailed. If older, use theological depth." 
                },
                references: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of specific references used (e.g., 'Interpretation of St. John by Fr. Tadros Malaty', 'Synaxarium', etc)." 
                },
                warmUp: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, ideas: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "ideas"] },
                illustration: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, ideas: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "ideas"] },
                application: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, ideas: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "ideas"] },
                practice: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, ideas: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "ideas"] }
            },
            required: ["lessonElements", "lessonBody", "references", "warmUp", "illustration", "application", "practice"]
        };
        
        if (hasVerse) {
            lessonPlanSchema.properties.verseExplanation = { type: Type.STRING, description: "Detailed interpretation of the verse." };
            lessonPlanSchema.properties.verseGame = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, ideas: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "ideas"] };
            lessonPlanSchema.required.push("verseExplanation", "verseGame");
        }

        const prompt = `
        Role: Expert Coptic Orthodox Sunday School Teacher.
        Age Group: "${ageGroup}"
        Lesson Title: "${lessonTitle}"
        Objective: "${spiritualObjective}"
        ${scriptureVerse ? `Verse: "${scriptureVerse}"` : ''}

        Generate a comprehensive lesson plan in Arabic.

        CRITICAL INSTRUCTION FOR LESSON EXPLANATION (شرح الدرس):
        1. **Tone & Style**: 
           - If Age Group is "ابتدائي" (Elementary): You MUST write the explanation as a story for children. Use very simple words, engaging phrases ("يا أصحابي", "تخيلوا معانا"). Act out the scenes in text. BE VERY CHILDISH AND SIMPLE but tell the FULL story in detail.
           - If Age Group is older: Use deep theological language, citations from Church Fathers, and spiritual depth.
        2. **Content**: 
           - Do NOT provide a summary. Provide the FULL teaching script.
           - Break it down into "Elements" (العناصر) and "Body" (الشرح التفصيلي).
           - The body must be long and cover the introduction, the story/content, and the conclusion.
        3. **References**:
           - You MUST list the specific Orthodox references used to prepare this lesson (e.g. Fr. Tadros Malaty, St. Athanasius, etc.).

        Required Output Sections:
        1. lessonElements: The main outline points.
        2. lessonBody: The detailed content/explanation (Childish for kids, Deep for youth).
        3. references: Specific books/commentaries used.
        4. Warm Up: 10 creative ideas.
        5. Illustration: 10 object lessons.
        6. Application: 10 practical life applications.
        7. Practice: 10 spiritual exercises.
        ${hasVerse ? '8. Verse Explanation & Verse Game (10 ideas).' : ''}
        `;

        let requestContents: any;
        if (lessonImages.length > 0) {
            const imageParts = lessonImages.map(image => ({
                inlineData: { data: image.data, mimeType: image.mimeType }
            }));
            requestContents = { parts: [...imageParts, { text: prompt }] };
        } else {
            requestContents = prompt;
        }

        // Lesson generation is heavy, so we use max retries (3) and long delay (2000ms)
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: requestContents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: lessonPlanSchema,
                temperature: 0.85, 
            },
        }, 3, 2000); 

        const responseText = response.text;
        const jsonText = (responseText || "").trim();
        const parsedData = JSON.parse(jsonText || "{}");
        
        const combinedExplanation = `
        **اولا العناصر:**
        ${parsedData.lessonElements?.map((e: string) => `- ${e}`).join('\n') || ''}
        
        **ثانيا الدرس:**
        ${parsedData.lessonBody || ''}
        
        **ثالثا المراجع:**
        ${parsedData.references?.map((r: string) => `- ${r}`).join('\n') || ''}
        `;

        const lessonPlan: LessonPlan = {
            lessonExplanation: combinedExplanation,
            lessonElements: parsedData.lessonElements,
            lessonBody: parsedData.lessonBody,
            references: parsedData.references,
            warmUp: structureIdeas(parsedData.warmUp || { title: "التمهيد", ideas: [] }),
            illustration: structureIdeas(parsedData.illustration || { title: "وسيلة الإيضاح", ideas: [] }),
            application: structureIdeas(parsedData.application || { title: "التطبيق", ideas: [] }),
            practice: structureIdeas(parsedData.practice || { title: "التدريب", ideas: [] }),
        };

        if (parsedData.verseExplanation) lessonPlan.verseExplanation = parsedData.verseExplanation;
        if (parsedData.verseGame) lessonPlan.verseGame = structureIdeas(parsedData.verseGame);

        return lessonPlan;

    } catch (error: any) {
        console.error("Error generating lesson ideas:", error);
        throw new Error(error.message || "فشل في توليد خطة الدرس. قد يكون الضغط عالياً، يرجى المحاولة بعد قليل.");
    }
}

export async function generateGameIdeas(count: string, place: string, tools: string, goal: string): Promise<any[]> {
    try {
        const schema = {
            type: Type.OBJECT,
            properties: {
                games: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, rules: { type: Type.STRING } },
                        required: ["title", "description", "rules"]
                    }
                }
            }
        };

        const prompt = `Generate 5 church games in Arabic for: ${count} people, Place: ${place}, Tools: ${tools}, Goal: ${goal}.`;

        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.9 }
        });

        const responseText = response.text;
        const json = JSON.parse(responseText || "{}");
        return json.games || [];
    } catch (e: any) {
        throw new Error(e.message || "فشل في توليد الألعاب. حاول مرة أخرى.");
    }
}

export interface CurriculumLesson {
    week: number;
    title: string;
    scripture: string;
    summary: string;
    linkToObjective: string;
    activityIdea: string;
}

export async function generateCurriculum(
    objective: string,
    duration: number,
    ageGroup: string,
    notes: string
): Promise<CurriculumLesson[]> {
    try {
        const schema = {
            type: Type.OBJECT,
            properties: {
                lessons: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            week: { type: Type.INTEGER },
                            title: { type: Type.STRING },
                            scripture: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            linkToObjective: { type: Type.STRING },
                            activityIdea: { type: Type.STRING }
                        },
                        required: ["week", "title", "scripture", "summary", "linkToObjective", "activityIdea"]
                    }
                }
            }
        };

        const prompt = `
        Role: Expert Coptic Orthodox Sunday School Coordinator.
        Task: Create a cohesive ${duration}-week lesson series (curriculum) for Age Group: "${ageGroup}".
        Main Spiritual Objective: "${objective}".
        Additional Notes: "${notes}".

        Constraint: 
        1. Every lesson MUST be based on a Bible Story or Passage (Old or New Testament).
        2. All lessons must be interconnected and serve the Main Spiritual Objective.
        3. Language: Arabic.

        Output JSON structure:
        - week: Lesson number.
        - title: Attractive Title.
        - scripture: Bible Reference (e.g., Luke 15:11-32).
        - summary: Brief summary of the story/content.
        - linkToObjective: How this specific story teaches the main objective.
        - activityIdea: A simple activity or interaction for this lesson.
        `;

        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.8 }
        });

        const responseText = response.text;
        const json = JSON.parse(responseText || "{}");
        return json.lessons || [];

    } catch (e: any) {
        throw new Error(e.message || "فشل في إعداد المنهج. حاول مرة أخرى.");
    }
}

export async function chatWithPatristicAI(chatHistory: ChatMessage[], newUserQuery: string, depth?: 'kids' | 'father' | 'apologetics'): Promise<string> {
    try {
        const historyForApi = chatHistory.map(message => ({ 
            role: message.role, 
            parts: [{ text: message.content }] 
        }));

        let depthGuideline = "";
        if (depth === 'kids') {
            depthGuideline = `

⚠️ توجيه هام للغاية بخصوص أسلوب الشرح (مستوى التعليم المبسط للأطفال والخدام):
يجب أن تكون الإجابة وافية، كاملة وشاملة للغاية، دون اختصار مخل. صغ الرد بأسلوب تربوي، ممتع، وجذاب للغاية يناسب الأطفال والمبتدئين، مع الالتزام بالمعايير التالية:
1. **توفير تشبيهات محسوسة مبتكرة**: صياغة تشبيهات قريبة لذهن الطفل لتوضيح المفاهيم اللاهوتية العميقة.
2. **سرد قصصي لاهوتي**: دمج قصة مشوقة أو حكاية آبائية من التاريخ لتوضيح المفهوم الروحي.
3. **مراجع كتابية مبسطة**: الاستشهاد بآيات واضحة ومباشرة من القديم والجديد لتأصيل الإيمان وشرحها بلغة الطفل.
4. **تأصيل آبائي لطيف**: ذكر آباء الكنيسة وقصصهم بصورة محببة تزرع في الطفل عشق التقليد والطقس الأرثوذكسي، مع عرض الرد كاملاً وشاملاً وبمنتهى الوضوح والدقة دون تبسيط يضيع عمق العقيدة الأرثوذكسية.`;
        } else if (depth === 'father') {
            depthGuideline = `

⚠️ توجيه هام للغاية بخصوص أسلوب الشرح (مستوى البحث الآبائي واللاهوتي العميق):
يجب أن تكون الإجابة أكاديمية، شديدة العمق، رصينة، وافية وخالية من الاختصار السطحي. يتعين صياغة الرد ليدعم الخادم والباحث لاهوتياً بالكامل من خلال:
1. **اقتباسات نصية محددة ومدروسة**: إدراج نصوص صريحة ومباشرة من كبار آباء الكنيسة الأقمار الثلاثة (القديس أثناسيوس الرسولي، يوحنا ذهبي الفم، كيرلس الكبير) أو القديس باسيليوس وغريغوريوس النزينزي وغيرهم.
2. **ذكر اسم المرجع والكتب بدقة**: مثل (كتاب تجسد الكلمة، الرسائل ضد الآريوسيين، ضد نسطور، إلخ).
3. **الدلالات الليتورجية والطقسية**: ربط الموضوع بصلوات القداس الإلهي (الباسيلي، الكيرلسي، الغريغوري)، صلوات التسبحة، الأبصلمودية، أو القراءات الكنسية والمخطوطات العتيقة.
4. **تحليل روحي وعقيدي متكامل**: تقديم تفصيل لغوي ويوناني واصطلاحي للمصطلحات اللاهوتية الرئيسية لتمكين الخادم من إلقاء درس لاهوتي متكامل وفائق القوة لصفوف إعداد الخدام والشباب.`;
        } else if (depth === 'apologetics') {
            depthGuideline = `

⚠️ توجيه هام للغاية بخصوص أسلوب الشرح (مستوى علم اللاهوت الدفاعي والأبولوجيتكس):
يجب صياغة الرد بطريقة عقلانية فكرية، في غاية الرصانة والإقناع العلمي والتاريخي للرد على أصعب الشكوك والتساؤلات المعاصرة لدعم الشباب وصغار النفوس، باتباع ما يلي:
1. **التشريح المنطقي المتزن**: تفكيك الشبهة أو السؤال الصعب خطوة بخطوة بطرق الاستنتاج العقلي والمنطقي السليم، وصياغة حجج مرتبة ومنمقة بنقاط واضحة.
2. **الأدلة والقرائن الشاملة**: دمج الأدلة العلمية، التاريخية، الفلسفية، المخطوطات الأثرية، وعلم الآثار إلى جانب النصوص الروحية لتوفير إجابة لا تدع مجالاً للشك.
3. **النبرة المحبة والرحبة**: تجنب أي لهجة هجومية أو اتهامية، بل التركيز الكامل على بناء الجسور الفكرية بهدوء روحي، ومحبة مسيحية عميقة تجذب النفوس وتشفي التساؤلات والشكوك بسلام وقوة.
4. **الربط الآبائي العقلي**: إظهار كيف واجه آباء الكنيسة الأوائل الصراعات الفكرية والهرطقات بذات النضج الفكري والمنطقي، وتوفير إجابة كاملة شاملة لا تحتاج للبحث الفردي الإضافي بعدها بالوصول لليقين المريح.`;
        }

        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: [...historyForApi, { role: 'user', parts: [{ text: newUserQuery }] }],
            config: { systemInstruction: systemInstruction + "\nContext: You are a helpful assistant answering questions about Coptic Orthodox theology and history in Arabic. Use the provided references context." + referencesContext + depthGuideline, temperature: 0.3 },
        });

        const responseText = response.text;
        return (responseText || "").trim();
    } catch (error: any) {
        throw new Error(error.message || "فشل الاتصال. تأكد من الإنترنت.");
    }
}

export async function chatWithExplanation(lessonContext: string, chatHistory: ChatMessage[], userMessage: string): Promise<string> {
    try {
        const systemPrompt = systemInstruction + `
        Context: You are helping a user understand a specific Sunday School lesson plan in Arabic.
        Lesson Explanation:
        """${lessonContext}"""
        
        Answer questions based on the lesson explanation provided.
        `;

         const historyForApi = chatHistory.map(message => ({ 
            role: message.role, 
            parts: [{ text: message.content }] 
        }));

        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: [...historyForApi, { role: 'user', parts: [{ text: userMessage }] }],
            config: { systemInstruction: systemPrompt, temperature: 0.5 },
        });

        const responseText = response.text;
        return (responseText || "").trim();
    } catch (error: any) {
        console.error("Error in chatWithExplanation:", error);
        throw new Error(error.message || "فشل في الرد. حاول مرة أخرى.");
    }
}

export async function generateAlternativeIdea(
  lessonTitle: string, spiritualObjective: string, categoryTitle: string, ideaToReplace: string, existingIdeas: string[], ageGroup: AgeGroup, lessonImages: any[], scriptureVerse: string
): Promise<string> {
    try {
        const prompt = `Replace idea: "${ideaToReplace}" in category "${categoryTitle}" for lesson "${lessonTitle}". Avoid: ${existingIdeas.join(', ')}. Language: Arabic.`;
        
        let requestContents: any = prompt;
        if (lessonImages.length > 0) {
             const imageParts = lessonImages.map(image => ({ inlineData: { data: image.data, mimeType: image.mimeType } }));
            requestContents = { parts: [...imageParts, { text: prompt }] };
        }

        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: requestContents,
            config: { temperature: 0.95 }
        });
        const responseText = response.text;
        return (responseText || "").trim();
    } catch (error: any) {
        throw new Error(error.message || "فشل في توليد بديل.");
    }
}

export async function explainIdea(ideaText: string, ageGroup: AgeGroup): Promise<string> {
    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: `Explain how to implement this idea in Arabic: "${ideaText}" for age group "${ageGroup}".`,
            config: { temperature: 0.6 }
        });
        const responseText = response.text;
        return (responseText || "").trim();
    } catch (error: any) {
        throw new Error(error.message || "فشل في شرح الفكرة.");
    }
}

export async function generateSuggestedQuestions(lessonExplanation: string): Promise<string[]> {
    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: `Based on this explanation, generate 3 short follow-up questions in Arabic. Explanation: ${lessonExplanation}`,
            config: { responseMimeType: "application/json", responseSchema: {type: Type.OBJECT, properties: {questions: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ["questions"]} }
        });
        const responseText = response.text;
        const json = JSON.parse(responseText || "{}");
        return json.questions || [];
    } catch (error) { return []; }
}

export async function getSmartSuggestions(type: SuggestionType, currentInput: string, context: string = ''): Promise<string[]> {
    try {
        let prompt = "";
        if (type === 'title') {
             prompt = `Generate 5 short, creative, and engaging Sunday School lesson titles (in Arabic) related to or completing: "${currentInput}". Return a JSON object with a "suggestions" array of strings.`;
        } else if (type === 'objective') {
             prompt = `Generate 3 concise spiritual objectives (in Arabic) for a Sunday School lesson titled "${context}". The objectives should start with or relate to: "${currentInput}". Return a JSON object with a "suggestions" array of strings.`;
        } else if (type === 'verse') {
             prompt = `Suggest 3 Bible verses (in Arabic, Van Dyck translation) that contain or relate to: "${currentInput}". Return a JSON object with a "suggestions" array of strings.`;
        } else {
            return [];
        }

        // Suggestions should be fast, so less retry/delay, but retry once just in case
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        }, 1, 1500); 
        
        const responseText = response.text;
        const json = JSON.parse(responseText || "{}");
        return json.suggestions || [];
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
}

export interface BibleVerse {
    number: number;
    text: string;
}

export interface LinguisticAnalysisItem {
    verseNumber: number;
    arabicWord: string;
    originalWord: string;
    explanation: string;
}

// Simple in-memory cache
const bibleCache = new Map<string, BibleVerse[]>();
const linguisticAnalysisCache = new Map<string, LinguisticAnalysisItem[]>();
const interpretationCache = new Map<string, string>();
const simplifiedExplanationCache = new Map<string, string>();
const bookIntroCache = new Map<string, string>();

export async function getBibleChapterText(bookName: string, chapter: number): Promise<BibleVerse[]> {
    const cacheKey = `${bookName}:${chapter}`;
    
    if (bibleCache.has(cacheKey)) {
        return bibleCache.get(cacheKey)!;
    }

    const prompt = `
        Provide the complete Arabic text for: **${bookName} - Chapter ${chapter}**
        Version: **Van Dyck** (فاندايك).
        
        Format requirements:
        - Output ONLY the verses.
        - Start each verse with its number followed by a period or space.
        - Do not use Markdown bolding (like **1**) for numbers.
        - Do not add titles, introductions, or headers.
        
        Example format:
        1 في البدء خلق الله السماوات والارض
        2 وكانت الارض خربة وخالية
    `;

    try {
        // Retries set to 3 and delay to 2000ms for robustness against Rate Limits
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        }, 3, 2000); 

        const responseText = response.text;
        
        if (!responseText || !responseText.trim()) {
             throw new Error("لم يتم استلام أي نص من الخادم. يرجى المحاولة مرة أخرى.");
        }

        const verses: BibleVerse[] = [];
        const lines = responseText.split('\n');
        
        let currentVerseNumber = 0;
        let currentVerseText = "";

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            const cleanLine = line.replace(/^\*\*(\d+)\*\*/, '$1');
            const match = cleanLine.match(/^(\d+)[\s.:|/-]+(.*)/);
            
            if (match) {
                if (currentVerseNumber > 0) {
                    verses.push({ number: currentVerseNumber, text: currentVerseText.trim() });
                }
                currentVerseNumber = parseInt(match[1]);
                currentVerseText = match[2];
            } else {
                if (currentVerseNumber > 0) {
                    currentVerseText += " " + cleanLine;
                }
            }
        }

        if (currentVerseNumber > 0) {
            verses.push({ number: currentVerseNumber, text: currentVerseText.trim() });
        }

        if (verses.length === 0 && responseText.length > 50) {
             verses.push({ number: 1, text: responseText.trim() });
        }

        bibleCache.set(cacheKey, verses);
        return verses;

    } catch (error: any) {
        console.error("Bible text fetch failed:", error);
        throw new Error(error.message || "فشل في تحميل نص الكتاب المقدس.");
    }
}

export async function getLinguisticAnalysis(bookName: string, chapter: number, testament: 'old' | 'new', selectedVerses?: number[]): Promise<LinguisticAnalysisItem[]> {
    const versesKey = selectedVerses && selectedVerses.length > 0 ? `:${selectedVerses.sort().join(',')}` : ':ALL';
    const cacheKey = `LINGUISTIC:${bookName}:${chapter}${versesKey}`;
    
    if (linguisticAnalysisCache.has(cacheKey)) {
        return linguisticAnalysisCache.get(cacheKey)!;
    }

    const originalLanguage = testament === 'old' ? 'Hebrew (Masoretic Text)' : 'Greek (Textus Receptus/Koiné)';
    
    const focusInstruction = selectedVerses && selectedVerses.length > 0 
        ? `**IMPORTANT: FOCUS ONLY ON VERSES: ${selectedVerses.join(', ')}**` 
        : 'Identify 4-6 verses in this chapter where there is a SIGNIFICANT linguistic nuance.';

    const prompt = `
        Act as a biblical scholar using Bible Hub linguistic resources (Interlinear, Lexicon).
        Analyze: ${bookName}, Chapter ${chapter}.
        
        Compare the **Arabic Van Dyck** translation with the **Original Text** (${originalLanguage}).
        
        ${focusInstruction}
        
        Return a JSON object with a list of "analysis".
        Each item must have:
        - verseNumber: (number)
        - arabicWord: (string) The word/phrase in Arabic Van Dyck.
        - originalWord: (string) The original ${testament === 'old' ? 'Hebrew' : 'Greek'} word.
        - explanation: (string) A concise explanation (in Arabic) of the difference or the deeper meaning (e.g., "The Hebrew word 'Hesed' implies...").
        
        Schema:
        {
            "analysis": [
                { "verseNumber": 1, "arabicWord": "...", "originalWord": "...", "explanation": "..." }
            ]
        }
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    verseNumber: { type: Type.INTEGER },
                                    arabicWord: { type: Type.STRING },
                                    originalWord: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["verseNumber", "arabicWord", "originalWord", "explanation"]
                            }
                        }
                    }
                },
                temperature: 0.3
            }
        });

        const responseText = response.text;
        const json = JSON.parse(responseText || "{}");
        const results = json.analysis || [];
        linguisticAnalysisCache.set(cacheKey, results);
        return results;

    } catch (error: any) {
        console.error("Linguistic analysis failed:", error);
        throw new Error(error.message || "فشل في تحليل الأصول اللغوية.");
    }
}

export async function getChapterInterpretation(bookName: string, chapter: number, testament: 'old' | 'new', selectedVerses?: number[]): Promise<string> {
    const versesKey = selectedVerses && selectedVerses.length > 0 ? `:${selectedVerses.sort().join(',')}` : ':ALL';
    const cacheKey = `INTERPRETATION:${bookName}:${chapter}${versesKey}`;
    
    if (interpretationCache.has(cacheKey)) {
        return interpretationCache.get(cacheKey)!;
    }

    const originalLanguage = testament === 'old' ? 'Hebrew' : 'Greek';
    
    const scopeInstruction = selectedVerses && selectedVerses.length > 0
        ? `**Provide a DEEP interpretation SPECIFICALLY for Verses: ${selectedVerses.join(', ')} in ${bookName} Chapter ${chapter}.** Do NOT summarize the whole chapter.`
        : `Provide a **DEEP, Comprehensive Interpretation** for: **${bookName} Chapter ${chapter}**.`;

    const prompt = `
        Act as an expert Coptic Orthodox theologian and biblical scholar.
        ${scopeInstruction}

        **MANDATORY REFERENCES (المراجع الأساسية):**
        1.  **Patristic Interpretations (أقوال الآباء):** St. John Chrysostom, St. Athanasius, St. Cyril of Alexandria (MUST reference his book "One Christ" / "المسيح واحد" if the text touches on Christology/Incarnation).
        2.  **Contemporary Coptic Commentaries (تفاسير معاصرة):** Fr. Tadros Yacoub Malaty (القمص تادرس يعقوب ملطي), Fr. Antonios Fikry (القمص أنطونيوس فكري).
        3.  **Theological Works:** Writings of Pope Shenouda III (كتب البابا شنودة الثالث).
        4.  **Linguistic Depth:** Analyze specific ${originalLanguage} terms if they clarify the meaning (from Bible Hub/Interlinear).
        5.  **Original Text & Manuscripts**: Use Codex Sinaiticus or CSNTM if relevant to textual variants.

        **Structure:**
        - **General Introduction (مقدمة عامة):** Context and theme.
        - **Detailed Exegesis (التفسير التفصيلي):** Verse-by-verse deep analysis.
        - **Patristic Gems (أقوال الآباء):** Direct quotes or paraphrased wisdom.
        - **Theological Highlights (إضاءات عقائدية):** Links to Orthodox dogma.
        - **Spiritual Application (تطبيق روحي):** For the servant/teacher.

        **Format:**
        - Language: Arabic.
        - Style: Rich, educational, spiritual.
        - Formatting: Use clean Markdown with headings (##, ###), bullet points, and bold text for key terms.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: {
                temperature: 0.4, 
            }
        });

        const responseText = response.text;
        const text = (responseText || "").trim();
        interpretationCache.set(cacheKey, text);
        return text;

    } catch (error: any) {
        console.error("Interpretation failed:", error);
        throw new Error(error.message || "فشل في تحميل التفسير.");
    }
}

export async function getSimplifiedExplanation(bookName: string, chapter: number, selectedVerses?: number[]): Promise<string> {
    const versesKey = selectedVerses && selectedVerses.length > 0 ? `:${selectedVerses.sort().join(',')}` : ':ALL';
    const cacheKey = `SIMPLE:${bookName}:${chapter}${versesKey}`;
    
    if (simplifiedExplanationCache.has(cacheKey)) {
        return simplifiedExplanationCache.get(cacheKey)!;
    }

    const scopeInstruction = selectedVerses && selectedVerses.length > 0
        ? `الشرح يركز **فقط** على الآيات: ${selectedVerses.join(', ')} من ${bookName} أصحاح ${chapter}.`
        : `الشرح يكون شامل لـ: **${bookName} أصحاح ${chapter}** بالكامل.`;

    const prompt = `
        **الدور:** أنت خادم مدارس أحد شاطر جداً ومرح (Storyteller).
        **المهمة:** تقديم شرح مبسط جداً للكتاب المقدس **باللهجة المصرية العامية**.
        
        ${scopeInstruction}

        **شروط الشرح (Important Guidelines):**
        1.  **اللغة:** عامية مصرية بسيطة ومفهومة للأطفال (ابتدائي).
        2.  **الأسلوب:** 
            - احكيها كأنها حدوتة أو قصة شيقة.
            - استخدم عبارات زي "يا أصحابي"، "تخيلوا"، "عشان كدة".
            - بسط المعاني الصعبة بس ماتقللش من عمق الكلام.
            - خلي الأسلوب شيق ومرح.
        3.  **المحتوى:**
            - ركز على الأحداث والمعنى الروحي البسيط.
            - لا تدخل في تفاصيل عميقة تشتت الطفل.
            - **ممنوع السطحية:** بسط المعلومة لكن حافظ على دقتها وصحتها الكتابية. ماتغيرش الحقائق، بس قولها بطريقة سهلة.
            - طلع "درس مستفاد" صغير في الآخر نقدر نطبقه في حياتنا.

        **الشكل المطلوب:**
        - استخدم Markdown لتنظيم الكلام (نقط، عناوين صغيرة).
        - خلي الفقرات قصيرة وسهلة القراءة.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: {
                temperature: 0.7, 
            }
        });

        const responseText = response.text;
        const text = (responseText || "").trim();
        simplifiedExplanationCache.set(cacheKey, text);
        return text;

    } catch (error: any) {
        console.error("Simplified explanation failed:", error);
        throw new Error(error.message || "فشل في تحميل الشرح المبسط.");
    }
}

export async function getBookIntroduction(bookName: string): Promise<string> {
    if (bookIntroCache.has(bookName)) {
        return bookIntroCache.get(bookName)!;
    }

    const prompt = `
        Act as an expert Coptic Orthodox theologian and biblical scholar.
        Provide a **Comprehensive Introduction** for the Bible Book: **${bookName}**.

        Include the following sections in detail:
        1. **Author (كاتب السفر):** Who wrote it? Historical and traditional evidence.
        2. **Date (تاريخ الكتابة):** When was it written?
        3. **Context & Audience (سياق الكتابة):** How and why was it written? Who was the intended audience?
        4. **Main Characters (شخصيات السفر):** Key figures mentioned in the book.
        5. **Purpose & Key Themes (الغرض من السفر والسمات الرئيسية):** What are the spiritual and theological goals?
        6. **Additional Info (معلومات إضافية):** Any unique features, Coptic traditions, or linguistic notes.

        Use clean Markdown with clear headings and bullet points. Language: Arabic. Rich, educational, and spiritual style.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: { temperature: 0.4 }
        });

        const text = (response.text || "").trim();
        bookIntroCache.set(bookName, text);
        return text;
    } catch (error: any) {
        console.error("Book introduction failed:", error);
        throw new Error(error.message || "فشل في تحميل مقدمة السفر.");
    }
}

// Manuscript types
export interface ManuscriptInfo {
    imageUrl: string; 
    viewerUrl: string; 
    title: string;
    description: string;
}

export async function getManuscriptImage(bookName: string, chapter: number): Promise<ManuscriptInfo> {
    const prompt = `
        Search for the specific URL on codexsinaiticus.org for: ${bookName} Chapter ${chapter}.
        Also provide a detailed historical summary (in Arabic) about Codex Sinaiticus:
        - Discovery date and story (Tischendorf).
        - Location now (British Library, etc.).
        - Significance of this manuscript.
        
        Return JSON:
        {
            "viewerUrl": "url_string",
            "title": "Arabic Title",
            "description": "Detailed Arabic HTML description"
        }
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });
        
        const responseText = response.text;
        const json = JSON.parse(responseText || "{}");
        
        return {
            imageUrl: "https://www.codexsinaiticus.org/images/home_slider/Codex_Sinaiticus_01.jpg", 
            viewerUrl: json.viewerUrl || "https://codexsinaiticus.org/en/manuscript.aspx",
            title: json.title || "المخطوطة السينائية (Codex Sinaiticus)",
            description: json.description || "واحدة من أهم المخطوطات اليونانية للعهد الجديد، تعود للقرن الرابع الميلادي."
        };

    } catch (e) {
        return {
            imageUrl: "https://www.codexsinaiticus.org/images/home_slider/Codex_Sinaiticus_01.jpg",
            viewerUrl: "https://codexsinaiticus.org/en/manuscript.aspx",
            title: "المخطوطة السينائية",
            description: "تعذر تحميل التفاصيل. المخطوطة السينائية هي من أقدم النسخ للكتاب المقدس (القرن الرابع)."
        };
    }
}

// === ALL NEW FUNCTIONS ACCORDING TO USER'S SPECIFICATIONS ===

export interface AnnualCurriculumMonth {
    monthName: string;
    season: string;
    theme: string;
    lessons: {
        week: number;
        title: string;
        scripture: string;
        summary: string;
        activityIdea: string;
    }[];
}

export async function generateCraftActivities(
    lessonTitle: string,
    spiritualObjective: string,
    ageGroup: AgeGroup
): Promise<string> {
    const prompt = `
    Role: Creative Sunday School Art and Craft Specialist for Coptic Orthodox Church Sunday Schools.
    Task: Design 2 creative, lovely, highly engaging, low-cost and interactive craft/manual activities (أنشطة يدوية وأعمال فنية) for the children.
    
    Lesson Details:
    - Title: "${lessonTitle}"
    - Spiritual Objective: "${spiritualObjective}"
    - Age Group (المرحلة العمرية): "${ageGroup}"
    
    Format of the output:
    Write a beautifully formatted Markdown response in Arabic.
    For each of the 2 crafts, include:
    1. **اسم النشاط (Craft Name)**: Creative title starting with scissors emoji (✂️).
    2. **فكرة النشاط والهدف منه (Concept & Goal)**: How it connects to the lesson and spiritual meaning.
    3. **الخامات المطلوبة (Materials needed)**: List low-cost, safe, accessible items (paper cups, cardboard, wooden sticks, paper plates, etc.).
    4. **خطوات التحضير والتنفيذ خطوة بخطوة (Step-by-step instructions)**.
    5. **رسالة روحية أثناء العمل (Spiritual message/Discussion during assembly)**: What the teacher can discuss with children as they work.
    6. **أشكال وتحديثات بديلة (Alternative/Simple variants)**.
    
    Make the layout elegant, easy to read, with bold text and step-by-step numbers, specifically tailored for the "${ageGroup}" category.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", { 
            contents: prompt,
            config: { temperature: 0.85 }
        });
        return (response.text || "").trim();
    } catch (e: any) {
        throw new Error(e.message || "فشل في توليد الأنشطة اليدوية. يرجى المحاولة مرة أخرى.");
    }
}

export async function generateWorksheetsAndColoring(
    lessonTitle: string,
    spiritualObjective: string,
    ageGroup: AgeGroup
): Promise<string> {
    const prompt = `
    Role: Sunday School Educational Specialist, Worksheet & Printable Designer.
    Task: Design a complete printable worksheet layout and coloring page design (أوراق عمل، تلوين، وألغاز تفاعلية) for the lesson.
    
    Lesson Details:
    - Title: "${lessonTitle}"
    - Spiritual Objective: "${spiritualObjective}"
    - Age Group (المرحلة العمرية): "${ageGroup}"
    
    Format of the output:
    Write a beautifully formatted Markdown response in Arabic. Include:
    1. **تصميم ورقة التلوين المقترحة (🎨 Coloring Page Design Concept)**: Detailed prompt/idea of the drawing (e.g. tracing outlines), and state the exact scripture Bible Verse (آية الدرس) printed in a gorgeous frame at the bottom for children to color and memorize.
    2. **ورقة العمل الذهنية والتفاعلية (📃 Classroom Worksheet)** featuring:
       - **لغز المتاهة أو التشفير (🧩 Maze / Word Decoder Puzzle)**: Complete description of a thematic puzzle with its solution.
       - **كلمات متقاطعة مبسطة أو كلمة السر (🔍 Word Search / Crossword)**: Clues and answers related to the Sunday School lesson.
       - **أسئلة ذكاء وفهم للقصة (❓ Sunday School Quiz)**: 3 engaging queries testing comprehension with spiritual insight, suitable for "${ageGroup}".
       - **تحدي السلوك الروحي الأسبوعي (🏆 Weekly Spiritual Goal Box)**: A 7-day checklist (e.g., praying, doing a good deed) to encourage real-world practice.
       
    Keep the font style structured, neat, and highly readable, specifically optimized for Sunday School printables.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", { 
            contents: prompt,
            config: { temperature: 0.85 }
        });
        return (response.text || "").trim();
    } catch (e: any) {
        throw new Error(e.message || "فشل في توليد أوراق العمل والتلوين. يرجى المحاولة مرة أخرى.");
    }
}

export async function generateAnnualCurriculum(
    objective: string,
    ageGroup: string,
    notes: string
): Promise<AnnualCurriculumMonth[]> {
    try {
        const schema = {
            type: Type.OBJECT,
            properties: {
                months: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            monthName: { type: Type.STRING },
                            season: { type: Type.STRING },
                            theme: { type: Type.STRING },
                            lessons: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        week: { type: Type.INTEGER },
                                        title: { type: Type.STRING },
                                        scripture: { type: Type.STRING },
                                        summary: { type: Type.STRING },
                                        activityIdea: { type: Type.STRING }
                                    },
                                    required: ["week", "title", "scripture", "summary", "activityIdea"]
                                }
                            }
                        },
                        required: ["monthName", "season", "theme", "lessons"]
                    }
                }
            },
            required: ["months"]
        };

        const prompt = `
        Role: Expert Sunday School Curriculum Coordinator for the Coptic Orthodox Church.
        Task: Create a highly customized, beautiful ANNUAL Curriculum Plan & Distribution (مخطط وموزع المنهج السنوي) divided into 12 themes/months for Sunday School.
        
        Target Age Group: "${ageGroup}"
        Spiritual/Thematic Objective: "${objective}"
        Special Requests or Notes: "${notes}"
        
        Guidelines:
        1. Distribute Sunday school lessons across 12 periods/months. Use traditional Coptic months or standard months aligned with liturgical seasons (e.g. Great Lent, Pentecost, Apostle's Fast, Kiahk/Nativity, etc.) if possible.
        2. Format each month with 4 integrated lessons (week 1 to week 4) with Bible scriptures and short interactive activity ideas.
        3. Make the language in elegant and descriptive Arabic.
        
        Output must strictly match the JSON Schema.
        `;

        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.8 }
        });

        const responseText = response.text;
        const json = JSON.parse(responseText || "{}");
        return json.months || [];

    } catch (e: any) {
        throw new Error(e.message || "فشل في إعداد وتوزيع المنهج السنوي. حاول مرة أخرى.");
    }
}

// Semantic Theme Search Interface & Service
export interface ThematicSearchResult {
    reference: string;
    versesText: string;
    relevanceExplanation: string;
    suggestedMemoryVerse: string;
    lessonApplication: string;
    biblicalExamples: string;
}

export async function searchThematicBible(theme: string): Promise<ThematicSearchResult[]> {
    const schema = {
        type: Type.OBJECT,
        properties: {
            results: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        reference: { type: Type.STRING, description: "Scripture reference in Arabic (e.g. مزمور ٣٤: ١)" },
                        versesText: { type: Type.STRING, description: "The Arabic Bible verse text from Van Dyck translation" },
                        relevanceExplanation: { type: Type.STRING, description: "Explanation in Arabic of why this scripture relates to the theme with spiritual depth" },
                        suggestedMemoryVerse: { type: Type.STRING, description: "A simple, lovely memory verse for children selected from this passage" },
                        lessonApplication: { type: Type.STRING, description: "Practical Sunday School application idea for children based on this selection" },
                        biblicalExamples: { type: Type.STRING, description: "Detailed Arabic description of specific Biblical events, stories, and characters who practically lived and illustrated this goal. (قصص ومواقف عملية لشخصيات من الكتاب المقدس عاشت هذا المبدأ والهدف)" }
                    },
                    required: ["reference", "versesText", "relevanceExplanation", "suggestedMemoryVerse", "lessonApplication", "biblicalExamples"]
                }
            }
        },
        required: ["results"]
    };

    const prompt = `
    Role: Biblical Orthodoxy Scholar and Creative Sunday School Advisor.
    Task: Perform a deep Semantic Theme Search on the entire Holy Bible for the following Sunday School Lesson Theme / Topic / Goal.
    
    Theme / Goal: "${theme}"
    
    Extract the top 3 most relevant, rich, and inspiring Bible passages (Old Testament or New Testament) that perfectly serve this theme/goal with deep spiritual nuances.
    
    Important:
    - Retrive the actual real verses text in standard Arabic Van Dyck translation.
    - For each search result, extract and write down rich and inspiring Biblical stories, events, characters, or actionable examples showing how this target or theme was lived out by someone in the Holy Bible (e.g., how David prayed, Daniel in the lion's den, how Joseph forgave, etc.). This must be detailed and highly engaging for children under 'biblicalExamples'.
    - Provide a profound explanation of the relevance, a custom-designed short memory verse for children, and a creative, interactive Sunday School application.
    - Language must be elegant, encouraging, and clear Arabic.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.7 }
        });

        const json = JSON.parse(response.text || "{}");
        return json.results || [];
    } catch (e: any) {
        throw new Error(e.message || "فشل البحث الموضوعي الذكي. يرجى المحاولة مرة أخرى.");
    }
}

// Lesson Hook Generator Interface & Service
export interface LessonHookResult {
    type: 'story' | 'science' | 'question';
    title: string;
    description: string;
    connectionToVerse: string;
}

export async function generateLessonHooks(
    bookName: string,
    chapter: number,
    chapterText: string
): Promise<LessonHookResult[]> {
    const schema = {
        type: Type.OBJECT,
        properties: {
            hooks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, description: "Must be one of: 'story' (قصة تفاعلية), 'science' (تجربة علمية ملفتة أو وسيلة إيضاح عملية), 'question' (سؤال محير ومثير للتفكير)" },
                        title: { type: Type.STRING, description: "Attractive Arabic Title with an appropriate emoji" },
                        description: { type: Type.STRING, description: "Detailed guide on how the servant executes this hook to excite children" },
                        connectionToVerse: { type: Type.STRING, description: "How this specific opening connects beautifully to a verse/theme in Chapter " + chapter }
                    },
                    required: ["type", "title", "description", "connectionToVerse"]
                }
            }
        },
        required: ["hooks"]
    };

    const prompt = `
    Role: Master Sunday School Creative Hook Designer (متخصص فهارس ومقدمات تشويقية مشوقة للأطفال).
    Task: Analyze the context of **${bookName} - Chapter ${chapter}** and create 3 innovative introductory hooks (أفكار تشويقية ومقدمات للدرس) suitable for kids.
    
    Context of Chapter ${chapter}:
    """
    ${chapterText}
    """
    
    Generate exactly 3 hooks, one of each type:
    1. 'story' (قصة تشويقية أو موقف درامي تفاعلي): A short dramatic intro scenario.
    2. 'science' (تجربة علمية بسيطة أو وسيلة إيضاح عملية مجسمة): Using easily accessible safety objects to display a concrete spiritual truth.
    3. 'question' (سؤال محير أو لغز ذهني): An intriguing question or a funny puzzle that redirects minds toward the chapter's deep focus.
    
    Language: Friendly, highly motivating Egyptian General Arabic or clear standard Arabic tailored for children.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.85 }
        });

        const json = JSON.parse(response.text || "{}");
        return json.hooks || [];
    } catch (e: any) {
        throw new Error(e.message || "تعذر استخراج الأفكار التشويقية حالياً. حاول ثانية.");
    }
}

export async function generateTheologicalConcordance(term: string): Promise<ConcordanceResult> {
    const schema = {
        type: Type.OBJECT,
        properties: {
            term: { type: Type.STRING },
            originalRoot: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING, description: "الكلمة باللغة الأصلية اليونانية أو العبرية (e.g. ἀγάπη)" },
                    language: { type: Type.STRING, description: "اللغة الأصلية (يونانية أو عبرية)" },
                    transliteration: { type: Type.STRING, description: "النطق بالحروف اللاتينية (e.g. Agape)" },
                    phoneticPronunciation: { type: Type.STRING, description: "النطق الصوتي التقريبي باللغة العربية (e.g. أغابي)" },
                    literalTranslation: { type: Type.STRING, description: "الترجمة الحرفية الدقيقة والعميقة للمصطلح بالعربية" }
                },
                required: ["word", "language", "transliteration", "phoneticPronunciation", "literalTranslation"]
            },
            semanticWeb: {
                type: Type.OBJECT,
                properties: {
                    oldTestamentSeptuagint: { type: Type.STRING, description: "كيف استُخدمت الكلمة وجذورها في العهد القديم والترجمة السبعينية وتطور المفهوم" },
                    newTestamentDevelopment: { type: Type.STRING, description: "تطور واستخدام المصطلح في العهد الجديد وكيف شحنه الإنجيل بمعانٍ إلهية فائقة" },
                    theologicalEvolution: { type: Type.STRING, description: "ملخص المسار اللاهوتي واللغوي للعبارة وتطورها التاريخي باختصار مبسط" }
                },
                required: ["oldTestamentSeptuagint", "newTestamentDevelopment", "theologicalEvolution"]
            },
            patristicDogma: {
                type: Type.OBJECT,
                properties: {
                    fatherName: { type: Type.STRING, description: "اسم القديس/الأب المبادر بالتفسير والعقيدة اللاهوتية (e.g. القديس أثناسيوس الرسولي)" },
                    goldenQuote: { type: Type.STRING, description: "مقولة آبائية ذهبية شهيرة متصلة مباشرة بهذا المصطلح" },
                    analyticalExplanation: { type: Type.STRING, description: "شرح لاهوتي آبائي مبسط كيف ساهمت هذه اللفظة وصياغة الآباء لها في تأسيس العقيدة وتوضيح الإيمان الأرثوذكسي العريق" }
                },
                required: ["fatherName", "goldenQuote", "analyticalExplanation"]
            },
            liturgicalEcho: {
                type: Type.OBJECT,
                properties: {
                    liturgyMentions: { type: Type.STRING, description: "أين تظهر هذه اللفظة أو مفهومها في صلوات القداس الإلهي (مثل القداس الباسيلي أو الغريغوري) وصياغتها الدقيقة" },
                    copticPraiseMentions: { type: Type.STRING, description: "صلتها بالتسبحة والإبصالمودية السنوية أو الكيهكية والصلوات الطقسية الأخرى" },
                    spiritualReflection: { type: Type.STRING, description: "تأمل روحي تطبيقي للخادم يعكس كيف يمكن ربط هذا العمق الليتورجي واللغوي بوجدان الأطفال/الشباب وعلاقتهم الفردية بالله اليوم" }
                },
                required: ["liturgyMentions", "copticPraiseMentions", "spiritualReflection"]
            },
            bentoCards: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "عنوان جذاب للبطاقة (Bento Card) يناسب محتواها القصير بأسلوب بليغ" },
                        content: { type: Type.STRING, description: "محتوى البطاقة المكثف والمفيد جداً" },
                        iconType: { type: Type.STRING, description: "أحد الرموز المناسبة للتصميم: root, semantic, patristic, liturgy, spiritual" }
                    },
                    required: ["title", "content", "iconType"]
                }
            },
            keyVerses: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        reference: { type: Type.STRING, description: "شاهد الآية باللغة العربية بوضوح (e.g. يوحنا ١٥: ١٣)" },
                        verseText: { type: Type.STRING, description: "نص الآية الكامل باللغة العربية (ترجمة فاندايك)" },
                        briefTheologicalNote: { type: Type.STRING, description: "تعليق أو وقفة لاهوتية لغوية قصيرة تربط الآية بالطرح الاصطلاحي" }
                    },
                    required: ["reference", "verseText", "briefTheologicalNote"]
                }
            }
        },
        required: ["term", "originalRoot", "semanticWeb", "patristicDogma", "liturgicalEcho", "bentoCards", "keyVerses"]
    };

    const prompt = `
    Role: Senior Biblical Orthodoxy Scholar & Original Languages Lexicographer.
    Task: Conduct an incredibly deep, rich, and inspiring theological analysis of the target term. Translate its nuance, origins, historical shift, and modern liturgical beauty.

    Target Term/Concept: "${term}"

    Output EXACTLY a validated JSON matching the provided schema in elegant, high-standard, encouraging theological Arabic.
    `;

    try {
        const response = await generateWithRetry("gemini-2.5-flash", {
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.75
            }
        });

        const json = JSON.parse(response.text || "{}");
        return json as ConcordanceResult;
    } catch (e: any) {
        throw new Error(e.message || "فشلت عملية تحليل المصطلح لاهوتياً ولغوياً. يرجى المحاولة مرة أخرى.");
    }
}


