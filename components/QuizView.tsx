import React, { useEffect, useState } from 'react';
import { QuizQuestion } from '../types';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { QuizHistoryEntry, saveQuizAttempt, getHistoryForBook } from '../utils/quizHistory';

interface QuizViewProps {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  selectedOption: string | null;
  hasAnswered: boolean;
  onAnswer: (option: string) => void;
  onNext: () => void;
  onRetry: () => void;
  onBackToFlashcards: () => void;
  bookId: string;
  onReviewIncorrect: () => void;
  incorrectCount: number;
}


const QuizView: React.FC<QuizViewProps> = ({
  questions,
  currentIndex,
  score,
  selectedOption,
  hasAnswered,
  onAnswer,
  onNext,
  onRetry,
  onBackToFlashcards,
  bookId,
  onReviewIncorrect,
  incorrectCount,
}) => {
  const isFinished = currentIndex >= questions.length;

  // 📊 lịch sử các lần làm quiz của đúng cuốn sách này
  const [historyForBook, setHistoryForBook] = useState<QuizHistoryEntry[]>([]);

  // 🧠 khi quiz kết thúc lần đầu → lưu 1 bản ghi + load lịch sử
  useEffect(() => {
    if (!isFinished || questions.length === 0) return;

    const entry: QuizHistoryEntry = {
      id: String(Date.now()),
      bookId,
      timestamp: Date.now(),
      score,
      total: questions.length,
    };

    saveQuizAttempt(entry);
    const history = getHistoryForBook(bookId);
    setHistoryForBook(history);
  }, [isFinished, bookId, questions.length, score]);

  // Summary View (End of Quiz)
  if (isFinished) {
    const percentage = questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

    let message = "Keep practicing!";
    if (percentage >= 100) message = "Perfect Score!";
    else if (percentage >= 80) message = "Great Job!";
    else if (percentage >= 60) message = "Good Effort!";

    // chuẩn bị dữ liệu vẽ biểu đồ cột
    const recent = historyForBook.slice(-8); // tối đa 8 lần gần nhất
    const maxHeight = 140; // px
  
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-yellow-100 rounded-full text-yellow-600">
              <Trophy size={48} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{message}</h2>
          <p className="text-gray-500 mb-4">
            You scored {score} out of {questions.length}
          </p>

          <div className="text-5xl font-black text-indigo-600 mb-6">
            {percentage}%
          </div>

          {/* 📊 Chart lịch sử các lần làm quiz trước đó */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Previous quiz attempts for this book
            </h3>

            {recent.length === 0 ? (
              <p className="text-xs text-gray-400">
                No previous attempts yet.
              </p>
            ) : (
              <div className="flex items-end justify-between gap-2 border-t border-gray-100 pt-4">
                {recent.map((run, index) => {
                  const percent = run.total > 0 ? (run.score / run.total) * 100 : 0;
                  const height = (percent / 100) * maxHeight;
                  const label = `${Math.round(percent)}%`;
                  const attemptIndex = historyForBook.length - recent.length + index + 1;

                  return (
                    <div
                      key={run.id}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full rounded-t-md bg-indigo-400 transition-all"
                        style={{ height: `${height}px` }}
                        title={label}
                      />
                      <div className="mt-1 text-[10px] text-gray-700">
                        {label}
                      </div>
                      <div className="text-[9px] text-gray-400">
                        #{attemptIndex}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {incorrectCount > 0 && (
              <button
                onClick={onReviewIncorrect}
                className="w-full py-4 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Review Incorrect Only ({incorrectCount})
              </button>
            )}
            
            <button
              onClick={onRetry}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Retry Quiz
            </button>
            <button
              onClick={onBackToFlashcards}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Back to Flashcards
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm h-16 flex items-center px-4 justify-between">
        <button 
          onClick={onBackToFlashcards}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-1" /> Exit
        </button>
        <div className="font-bold text-gray-800">
          Question {currentIndex + 1} <span className="text-gray-400 font-normal">/ {questions.length}</span>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
          Score: {score}
        </div>
      </header>

      {/* Main Quiz Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
        
        {/* Question Card */}
        <div className="w-full bg-white rounded-3xl shadow-lg p-8 mb-6 text-center min-h-[200px] flex items-center justify-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 jp-font">
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="w-full grid grid-cols-1 gap-3 mb-8">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedOption;
            
            // Determine Button Style
            let btnClass =
              "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"; // Default
            
            if (hasAnswered) {
              if (isCorrect) {
                btnClass =
                  "bg-green-100 border-2 border-green-500 text-green-800 font-bold ring-1 ring-green-500";
              } else if (isSelected && !isCorrect) {
                btnClass =
                  "bg-red-100 border-2 border-red-500 text-red-800 opacity-75";
              } else {
                btnClass = "bg-gray-50 border-gray-100 text-gray-400";
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => onAnswer(option)}
                className={`
                  p-4 rounded-xl text-lg font-medium transition-all duration-200 text-left relative
                  ${btnClass}
                `}
              >
                {option}
                {hasAnswered && isCorrect && (
                  <CheckCircle
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600"
                    size={24}
                  />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-600"
                    size={24}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button (Only visible after answering) */}
        <div className="h-16 w-full">
          {hasAnswered && (
            <button
              onClick={onNext}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-transform active:scale-95"
            >
              {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizView;
