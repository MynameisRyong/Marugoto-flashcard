import React, { useState } from 'react';
import { BookDefinition, LessonRange } from '../types';
import { ArrowLeft, Book } from 'lucide-react';

interface LessonSelectorProps {
  book: BookDefinition;
  onStartLearning: (range: LessonRange) => void;
  onBack: () => void;
}

const LessonSelector: React.FC<LessonSelectorProps> = ({ book, onStartLearning, onBack }) => {
  // Calculate min and max lessons available in the book
  const lessons = book.vocabulary.map(v => v.lesson);
  const minLesson = Math.min(...lessons);
  const maxLesson = Math.max(...lessons);

  // dùng string để cho phép xóa sạch input
  const [startLesson, setStartLesson] = useState<string>(String(minLesson));
  const [endLesson, setEndLesson] = useState<string>(String(maxLesson));
  const [error, setError] = useState<string>('');

  const handleStart = () => {
    const start = parseInt(startLesson, 10);
    const end = parseInt(endLesson, 10);

    if (isNaN(start) || isNaN(end)) {
      setError('Please enter valid lesson numbers.');
      return;
    }

    if (start < minLesson || end > maxLesson) {
      setError(`Lessons must be between ${minLesson} and ${maxLesson}.`);
      return;
    }

    if (start > end) {
      setError('Start lesson cannot be greater than end lesson.');
      return;
    }

    setError('');
    onStartLearning({ start, end });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className={`p-8 ${book.accentColor}`}>
          <button 
            onClick={onBack}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" /> Back
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <Book className={book.accentTextColor} />
            <h2 className="text-xl font-bold text-gray-800">{book.title}</h2>
          </div>
          <p className="text-gray-600 text-sm">Select lesson range to study</p>
        </div>

        {/* Form Section */}
        <div className="p-8 space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-2">From Lesson</label>
              <input
                type="number"
                min={minLesson}
                max={maxLesson}
                value={startLesson}
                onChange={(e) => setStartLesson(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:outline-none text-center text-lg font-bold text-white-800"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-2">To Lesson</label>
              <input
                type="number"
                min={minLesson}
                max={maxLesson}
                value={endLesson}
                onChange={(e) => setEndLesson(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:outline-none text-center text-lg font-bold text-white-800"
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            Available: Lesson {minLesson} - {maxLesson}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95
              text-white bg-gray-900 hover:bg-gray-800
            `}
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonSelector;
