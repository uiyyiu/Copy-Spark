
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
