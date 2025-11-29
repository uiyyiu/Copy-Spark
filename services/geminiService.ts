
import { GoogleGenAI, Type } from "@google/genai";
import type { LessonPlan, Idea, IdeaSection, AgeGroup, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: requestContents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: lessonPlanSchema,
                temperature: 0.85, 
            },
        });

        const jsonText = (response.text || "").trim();
        const parsedData = JSON.parse(jsonText || "{}");
        
        // Construct legacy explanation for backward compatibility
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

    } catch (error) {
        console.error("Error generating lesson ideas:", error);
        throw new Error("فشل في توليد خطة الدرس. حاول مرة أخرى.");
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

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.9 }
        });

        const json = JSON.parse(response.text || "{}");
        return json.games || [];
    } catch (e) {
        throw new Error("فشل في توليد الألعاب");
    }
}

export async function chatWithPatristicAI(chatHistory: ChatMessage[], newUserQuery: string): Promise<string> {
    try {
        const historyForApi = chatHistory.map(message => ({ 
            role: message.role, 
            parts: [{ text: message.content }] 
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [...historyForApi, { role: 'user', parts: [{ text: newUserQuery }] }],
            config: { systemInstruction: systemInstruction + "\nContext: You are a helpful assistant answering questions about Coptic Orthodox theology and history in Arabic. Use the provided references context." + referencesContext, temperature: 0.3 },
        });

        return (response.text || "").trim();
    } catch (error) {
        throw new Error("Connection failed.");
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

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [...historyForApi, { role: 'user', parts: [{ text: userMessage }] }],
            config: { systemInstruction: systemPrompt, temperature: 0.5 },
        });

        return (response.text || "").trim();
    } catch (error) {
        console.error("Error in chatWithExplanation:", error);
        throw new Error("Failed to generate response.");
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

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: requestContents,
            config: { temperature: 0.95 }
        });
        return (response.text || "").trim();
    } catch (error) {
        throw new Error("Failed to generate alternative.");
    }
}

export async function explainIdea(ideaText: string, ageGroup: AgeGroup): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Explain how to implement this idea in Arabic: "${ideaText}" for age group "${ageGroup}".`,
            config: { temperature: 0.6 }
        });
        return (response.text || "").trim();
    } catch (error) {
        throw new Error("Failed to explain idea.");
    }
}

export async function generateSuggestedQuestions(lessonExplanation: string): Promise<string[]> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on this explanation, generate 3 short follow-up questions in Arabic. Explanation: ${lessonExplanation}`,
            config: { responseMimeType: "application/json", responseSchema: {type: Type.OBJECT, properties: {questions: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ["questions"]} }
        });
        const json = JSON.parse(response.text || "{}");
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

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
        });
        
        const json = JSON.parse(response.text || "{}");
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

export async function getBibleChapterText(bookName: string, chapter: number): Promise<BibleVerse[]> {
    const cacheKey = `${bookName}:${chapter}`;
    
    if (bibleCache.has(cacheKey)) {
        return bibleCache.get(cacheKey)!;
    }

    // Simplified prompt, instructing simple numbering
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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.1,
                // Increase token limit for long chapters like Matt 6, Luke 6, Psalm 119
                maxOutputTokens: 8192, 
            }
        });

        const text = response.text || "";
        const verses: BibleVerse[] = [];
        const lines = text.split('\n');
        
        // Robust State Machine Parser
        // Handles: 
        // 1. "1. Text"
        // 2. "1 Text"
        // 3. "**1** Text"
        // 4. "Text continues on next line" (for poetry/long verses)
        
        let currentVerseNumber = 0;
        let currentVerseText = "";

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // Remove potential markdown bolding on numbers (e.g. **1**)
            const cleanLine = line.replace(/^\*\*(\d+)\*\*/, '$1');

            // Check if line starts with a number
            const match = cleanLine.match(/^(\d+)[\s.:|/-]+(.*)/);
            
            if (match) {
                // Save previous verse if exists
                if (currentVerseNumber > 0) {
                    verses.push({ number: currentVerseNumber, text: currentVerseText.trim() });
                }
                
                // Start new verse
                currentVerseNumber = parseInt(match[1]);
                currentVerseText = match[2];
            } else {
                // If it doesn't start with a number, it's likely a continuation of the previous verse
                // (Common in Psalms, Prophecy, or Sermon on the Mount)
                if (currentVerseNumber > 0) {
                    currentVerseText += " " + cleanLine;
                } else {
                    // Edge case: Text before verse 1 (titles), usually ignore or treat as verse 0
                    // For now, ignore to keep strict numbering
                }
            }
        }

        // Push the last verse
        if (currentVerseNumber > 0) {
            verses.push({ number: currentVerseNumber, text: currentVerseText.trim() });
        }

        // Fallback: If regex failed completely (verses is empty but text exists), 
        // it might be a block of text without numbers.
        if (verses.length === 0 && text.length > 50) {
             // Split by periods or reasonable chunks? Or just return as Verse 1?
             // Better to return as Verse 1 than nothing.
             verses.push({ number: 1, text: text.trim() });
        }

        bibleCache.set(cacheKey, verses);
        return verses;

    } catch (error) {
        console.error("Bible text fetch failed:", error);
        throw new Error("فشل في تحميل نص الكتاب المقدس. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.");
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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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

        const json = JSON.parse(response.text || "{}");
        const results = json.analysis || [];
        linguisticAnalysisCache.set(cacheKey, results);
        return results;

    } catch (error) {
        console.error("Linguistic analysis failed:", error);
        throw new Error("فشل في تحليل الأصول اللغوية.");
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
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", // Using Pro for deeper reasoning and better handling of large context/references
            contents: prompt,
            config: {
                temperature: 0.4, // Lower temperature for factual/theological accuracy
            }
        });

        const text = (response.text || "").trim();
        interpretationCache.set(cacheKey, text);
        return text;

    } catch (error) {
        console.error("Interpretation failed:", error);
        throw new Error("فشل في تحميل التفسير العميق.");
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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Switched to flash for better stability on this creative task
            contents: prompt,
            config: {
                temperature: 0.7, // Higher temperature for creative/storytelling style
            }
        });

        const text = (response.text || "").trim();
        simplifiedExplanationCache.set(cacheKey, text);
        return text;

    } catch (error) {
        console.error("Simplified explanation failed:", error);
        throw new Error("فشل في تحميل الشرح المبسط.");
    }
}

// Manuscript types
export interface ManuscriptInfo {
    imageUrl: string; // Static representative image
    viewerUrl: string; // Link to Codex Sinaiticus
    title: string;
    description: string;
}

export async function getManuscriptImage(bookName: string, chapter: number): Promise<ManuscriptInfo> {
    // Note: Codex Sinaiticus contains the whole NT and part of OT.
    // We will simulate a search or provide a direct deep link logic if possible, 
    // but usually search grounding is best for specific pages.
    
    // For now, we will return a static high-quality image of the Codex and search for the specific link.
    
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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });
        
        const json = JSON.parse(response.text || "{}");
        
        return {
            imageUrl: "https://www.codexsinaiticus.org/images/home_slider/Codex_Sinaiticus_01.jpg", // Static representative
            viewerUrl: json.viewerUrl || "https://codexsinaiticus.org/en/manuscript.aspx",
            title: json.title || "المخطوطة السينائية (Codex Sinaiticus)",
            description: json.description || "واحدة من أهم المخطوطات اليونانية للعهد الجديد، تعود للقرن الرابع الميلادي."
        };

    } catch (e) {
        // Fallback
        return {
            imageUrl: "https://www.codexsinaiticus.org/images/home_slider/Codex_Sinaiticus_01.jpg",
            viewerUrl: "https://codexsinaiticus.org/en/manuscript.aspx",
            title: "المخطوطة السينائية",
            description: "تعذر تحميل التفاصيل. المخطوطة السينائية هي من أقدم النسخ للكتاب المقدس (القرن الرابع)."
        };
    }
}
