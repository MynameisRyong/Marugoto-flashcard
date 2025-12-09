import { VocabularyEntry, QuizQuestion } from '../types';

// Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const generateQuizQuestions = (
  vocab: VocabularyEntry[]
): QuizQuestion[] => {
  if (vocab.length < 4) {
    console.warn("Not enough vocabulary to generate multiple choice questions");
    return [];
  }

  // Shuffle the entire vocabulary list (NO LIMIT)
  const shuffledVocab = shuffleArray(vocab);

  return shuffledVocab.map((entry, index) => {
    // 1. Determine Prompt
    const prompt = entry.kanji 
      ? `${entry.kanji} (${entry.hiragana})` 
      : entry.hiragana;

    // 2. Get Correct Answer
    const correctAnswer = entry.meaning;

    // 3. Pick Distractors
    // Filter out the current entry to avoid duplicate answers
    const potentialDistractors = vocab.filter(v => v.meaning !== correctAnswer);
    
    // Shuffle potential distractors and pick 3
    const distractors = shuffleArray(potentialDistractors)
      .slice(0, 3)
      .map(d => d.meaning);

    // 4. Combine and Shuffle Options
    const options = shuffleArray([correctAnswer, ...distractors]);

    return {
      id: `q-${index}-${Date.now()}`,
      prompt,
      correctAnswer,
      options
    };
  });
};
