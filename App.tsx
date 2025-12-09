import React, { useState, useMemo } from 'react';
import { BOOKS, HIRAGANA_ORDER } from './constants';
import { ViewState, VocabularyEntry, SortMode, LessonRange, QuizQuestion } from './types';
import BookSelector from './components/BookSelector';
import LessonSelector from './components/LessonSelector';
import Flashcard from './components/Flashcard';
import QuizView from './components/QuizView';
import { generateQuizQuestions } from './utils/quiz';
import { getCyclicSortedVocabulary } from './utils/sorter';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Shuffle, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<ViewState>('bookSelect');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [lessonRange, setLessonRange] = useState<LessonRange>({ start: 1, end: 1 });
  
  // Learning Session State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('cyclic');
  const [rotationCount, setRotationCount] = useState(0); // For cyclic
  const [shuffleTrigger, setShuffleTrigger] = useState(0); // For random (increment to reshuffle)

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizHasAnswered, setQuizHasAnswered] = useState(false);
  const [quizIncorrectQuestions, setQuizIncorrectQuestions] = useState<QuizQuestion[]>([]);
  
  // --- DERIVED DATA ---
  
  const selectedBook = useMemo(() => 
    BOOKS.find(b => b.id === selectedBookId), 
  [selectedBookId]);

  // 1. Filter raw vocabulary based on lesson range
  const filteredVocabulary = useMemo(() => {
    if (!selectedBook) return [];
    return selectedBook.vocabulary.filter(
      v => v.lesson >= lessonRange.start && v.lesson <= lessonRange.end
    );
  }, [selectedBook, lessonRange]);

  // 2. Sort/Shuffle the deck for display
  const displayDeck = useMemo(() => {
    if (filteredVocabulary.length === 0) return [];
    
    if (sortMode === 'random') {
      // Fisher-Yates Shuffle
      // Note: We depend on shuffleTrigger to re-run this when button is clicked
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = shuffleTrigger; 
      
      let deck = [...filteredVocabulary];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    } else {
      // Cyclic Sort using the new utility
      return getCyclicSortedVocabulary(filteredVocabulary, rotationCount);
    }
  }, [filteredVocabulary, sortMode, rotationCount, shuffleTrigger]);

  const currentCard = displayDeck[currentIndex];

  // Determine start char for display label based on the actual sorted deck
  const currentCyclicStartChar = useMemo(() => {
    if (displayDeck.length === 0) return '';
    const firstChar = displayDeck[0].hiragana.charAt(0);
    // If it's a known kana, use it. If not (e.g. symbol), maybe show it or show '?'
    return HIRAGANA_ORDER.includes(firstChar) ? firstChar : firstChar; 
  }, [displayDeck]);

  // --- HANDLERS ---

  const handleBookSelect = (id: string) => {
    setSelectedBookId(id);
    setView('lessonSelect');
  };

  const handleStartLearning = (range: LessonRange) => {
    setLessonRange(range);
    // Reset session state
    setCurrentIndex(0);
    setIsFlipped(false);
    setSortMode('cyclic');
    setRotationCount(0);
    setView('learning');
  };

  const handleBackToBooks = () => {
    setSelectedBookId(null);
    setView('bookSelect');
  };

  const handleBackToLessons = () => {
    setView('lessonSelect');
  };

  const handleNext = () => {
    if (currentIndex < displayDeck.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150); // slight delay for better feel if mid-flip
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c - 1), 150);
    }
  };

  const toggleSortMode = (mode: SortMode) => {
    setSortMode(mode);
    setCurrentIndex(0);
    setIsFlipped(false);
    if (mode === 'random') {
        // Trigger initial shuffle
        setShuffleTrigger(s => s + 1);
    } else {
        // Reset rotation when going back to cyclic
        setRotationCount(0);
    }
  };

  const handleCyclicRotate = () => {
    if (sortMode !== 'cyclic') {
        toggleSortMode('cyclic');
        return;
    }
    // Increment rotation count. The sorter utility handles the modulo logic based on active groups.
    setRotationCount(c => c + 1);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRandomShuffle = () => {
      if (sortMode !== 'random') {
          toggleSortMode('random');
          return;
      }
      setShuffleTrigger(s => s + 1);
      setCurrentIndex(0);
      setIsFlipped(false);
  };

  // --- QUIZ HANDLERS ---

  const handleStartQuiz = () => {
    // Generate quiz based on current filtered vocabulary
    const questions = generateQuizQuestions(filteredVocabulary);
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizSelectedOption(null);
    setQuizHasAnswered(false);
    setQuizIncorrectQuestions([]); // reset incorrect list
    setView('quiz');
  };

  const handleQuizAnswer = (option: string) => {
    if (quizHasAnswered) return;

    setQuizSelectedOption(option);
    setQuizHasAnswered(true);
    
    const currentQ = quizQuestions[currentQuizIndex];
    if (option === currentQ.correctAnswer) {
      setQuizScore(s => s + 1);
    } else {
      // Collect this question as an incorrect one
      setQuizIncorrectQuestions(prev => {
        // Avoid accidental duplicates if any
        if (prev.some(q => q.id === currentQ.id)) return prev;
        return [...prev, currentQ];
      });
    }
  };

  const handleQuizReviewIncorrect = () => {
    if (quizIncorrectQuestions.length === 0) {
      return;
    }

    setQuizQuestions([...quizIncorrectQuestions]);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizSelectedOption(null);
    setQuizHasAnswered(false);
    // Reset incorrect list for the new session to track which ones are STILL wrong
    setQuizIncorrectQuestions([]);
  };

  const handleQuizNext = () => {
    setCurrentQuizIndex(i => i + 1);
    setQuizSelectedOption(null);
    setQuizHasAnswered(false);
  };

  const handleQuizRetry = () => {
    handleStartQuiz();
  };

  const handleBackToFlashcards = () => {
    setView('learning');
  };


  // --- RENDER ---

  if (view === 'bookSelect') {
    return <BookSelector books={BOOKS} onSelectBook={handleBookSelect} />;
  }

  if (view === 'lessonSelect' && selectedBook) {
    return (
      <LessonSelector 
        book={selectedBook} 
        onStartLearning={handleStartLearning} 
        onBack={handleBackToBooks}
      />
    );
  }

  if (view === 'quiz') {
    return (
      <QuizView
        questions={quizQuestions}
        currentIndex={currentQuizIndex}
        score={quizScore}
        selectedOption={quizSelectedOption}
        hasAnswered={quizHasAnswered}
        onAnswer={handleQuizAnswer}
        onNext={handleQuizNext}
        onRetry={handleQuizRetry}
        onBackToFlashcards={handleBackToFlashcards}
        bookId={selectedBook.id}
        onReviewIncorrect={handleQuizReviewIncorrect}
        incorrectCount={quizIncorrectQuestions.length}
      />
    );
  }

  if (view === 'learning' && selectedBook && currentCard) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Sticky Toolbar */}
        <header className="sticky top-0 z-50 bg-white shadow-md h-24 flex items-center px-4 md:px-8 justify-between">
          <div className="flex-1 flex items-center">
            <button 
                onClick={handleBackToLessons}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
             <span className="text-xl font-bold text-gray-800 tabular-nums">
               {currentIndex + 1} / {displayDeck.length}
             </span>
          </div>

          <div className="flex-1 flex justify-end items-center gap-2">
            <button
              onClick={handleStartQuiz}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all bg-indigo-600 text-white hover:bg-indigo-700 mr-2"
              title="Start Quiz (All vocabulary in range)"
            >
              <BrainCircuit size={18} />
              <span className="hidden md:inline">Quiz</span>
            </button>

            <button
              onClick={handleCyclicRotate}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
                ${sortMode === 'cyclic' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
              `}
            >
              <RefreshCw size={18} />
              <span className="hidden md:inline">Cyclic {sortMode === 'cyclic' && `(${currentCyclicStartChar}...)`}</span>
            </button>

            <button
              onClick={handleRandomShuffle}
              className={`
                 flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
                ${sortMode === 'random' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
              `}
            >
              <Shuffle size={18} />
              <span className="hidden md:inline">Random</span>
            </button>
          </div>
        </header>

        {/* Main Flashcard Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-4">
            
            <Flashcard 
                entry={currentCard} 
                isFlipped={isFlipped} 
                onFlip={() => setIsFlipped(!isFlipped)} 
            />

            {/* Navigation Buttons */}
            <div className="flex items-center gap-8 mt-12">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-4 rounded-full bg-white shadow-lg text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft size={32} />
                </button>

                <div className="text-sm font-medium text-gray-400">
                    {selectedBook.title}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === displayDeck.length - 1}
                    className="p-4 rounded-full bg-white shadow-lg text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </main>
      </div>
    );
  }

  // Fallback for empty deck
  if (view === 'learning' && displayDeck.length === 0) {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col p-8">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">No vocabulary found</h2>
              <p className="text-gray-500 mb-6">Try selecting a different lesson range.</p>
              <button onClick={handleBackToLessons} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Go Back</button>
          </div>
      )
  }

  return <div>Loading...</div>;
};

export default App;
