export type VocabularyEntry = {
  hiragana: string;
  kanji: string | null;
  meaning: string;
  lesson: number;
};

export type BookDefinition = {
  id: string;
  title: string;
  description: string;
  vocabulary: VocabularyEntry[];
  accentColor: string; // Background gradient classes
  accentTextColor: string; // Text color classes
  badgeColor: string; // Solid pastel color for badges/buttons
  pinned?: boolean;
};

export type ViewState = 'bookSelect' | 'lessonSelect' | 'learning' | 'quiz';
export type SortMode = 'cyclic' | 'random';

export interface LessonRange {
  start: number;
  end: number;
}

export type QuizQuestion = {
  id: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
};