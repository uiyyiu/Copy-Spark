
export interface Idea {
  id: string;
  text: string;
  selected: boolean;
}

export interface IdeaSection {
  title: string;
  ideas: Idea[];
}

export type AgeGroup = 'ابتدائي' | 'اعدادي' | 'ثانوي' | 'شباب' | 'خريجين';

export type IdeaSectionKey = 'warmUp' | 'illustration' | 'application' | 'practice' | 'verseGame';

export interface LessonPlan {
  lessonExplanation: string; // Fallback/Combined string
  lessonElements?: string[]; // Structured elements
  lessonBody?: string;       // Structured detailed body
  references?: string[];     // Structured references
  verseExplanation?: string;
  warmUp: IdeaSection;
  illustration: IdeaSection;
  application: IdeaSection;
  practice: IdeaSection;
  verseGame?: IdeaSection;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ConcordanceResult {
  term: string;
  originalRoot: {
    word: string;
    language: string;
    transliteration: string;
    phoneticPronunciation: string;
    literalTranslation: string;
  };
  semanticWeb: {
    oldTestamentSeptuagint: string;
    newTestamentDevelopment: string;
    theologicalEvolution: string;
  };
  patristicDogma: {
    fatherName: string;
    goldenQuote: string;
    analyticalExplanation: string;
  };
  liturgicalEcho: {
    liturgyMentions: string;
    copticPraiseMentions: string;
    spiritualReflection: string;
  };
  bentoCards: Array<{
    title: string;
    content: string;
    iconType: string;
  }>;
  keyVerses: Array<{
    reference: string;
    verseText: string;
    briefTheologicalNote: string;
  }>;
}

export interface TypologyResult {
  symbolName: string;
  otContext: {
    symbolTitle: string;
    passage: string;
    description: string;
    theologicalMeaning: string;
  };
  ntFulfillment: {
    realityTitle: string;
    passage: string;
    verseText: string;
    theologicalLink: string;
  };
  patristicInsight: {
    fatherName: string;
    quote: string;
    explanation: string;
  };
  spiritualApplication: {
    classActivity: string;
    servantTip: string;
    summaryMessage: string;
  };
  timelineSteps: Array<{
    stage: string; // e.g. "١. الظل والرمز القديم", "٢. العبور الفطري", "٣. التحقيق والجسد المصلوب", "٤. الممارسة والسر"
    title: string;
    details: string;
  }>;
  bentoInsights: Array<{
    title: string;
    content: string;
    category: string; // e.g., "رمزية عقيدية", "تفصيل لاهوتي", "أثر طقسي"
  }>;
}

