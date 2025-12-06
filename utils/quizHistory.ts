export type QuizHistoryEntry = {
  id: string;
  bookId: string;
  timestamp: number;
  score: number;
  total: number;
};

const STORAGE_KEY = 'quizHistory_v1';

export function loadQuizHistory(): QuizHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QuizHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveQuizAttempt(entry: QuizHistoryEntry): void {
  if (typeof window === 'undefined') return;
  const all = loadQuizHistory();
  all.push(entry);
  // keep only last 50 entries
  const trimmed = all.slice(-50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getHistoryForBook(bookId: string): QuizHistoryEntry[] {
  return loadQuizHistory().filter(h => h.bookId === bookId);
}