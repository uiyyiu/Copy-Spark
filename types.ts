
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
