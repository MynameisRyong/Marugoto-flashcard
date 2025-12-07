
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

  const [startLesson, setStartLesson] = useState<number>(minLesson);
  const [endLesson, setEndLesson] = useState<number>(maxLesson);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    setStartLesson(newVal);
    // Enforce start <= end
    if (newVal > endLesson) {
      setEndLesson(newVal);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    setEndLesson(newVal);
    // Enforce end >= start
    if (newVal < startLesson) {
      setStartLesson(newVal);
    }
  };

  const handleStart = () => {
    onStartLearning({ start: startLesson, end: endLesson });
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
        <div className="p-8 space-y-8">
          
          <div className="space-y-6">
            {/* Start Lesson Slider */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-gray-500">From Lesson</label>
                <span className="text-2xl font-bold text-gray-800 tabular-nums">{startLesson}</span>
              </div>
              <input
                type="range"
                min={minLesson}
                max={maxLesson}
                value={startLesson}
                onChange={handleStartChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>{minLesson}</span>
                <span>{maxLesson}</span>
              </div>
            </div>

            {/* End Lesson Slider */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-gray-500">To Lesson</label>
                <span className="text-2xl font-bold text-gray-800 tabular-nums">{endLesson}</span>
              </div>
              <input
                type="range"
                min={minLesson}
                max={maxLesson}
                value={endLesson}
                onChange={handleEndChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>{minLesson}</span>
                <span>{maxLesson}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            Total range: {endLesson - startLesson + 1} lesson(s)
          </div>

          <button
            onClick={handleStart}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95
              text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
            `}
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

<style>
{`
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 5px;
    background-color: #e5e7eb; /* Tailwind gray-300 */
    outline: none;
    transition: background-color 0.2s ease;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px; /* tăng kích thước nút */
    height: 24px;
    background-color: #6366f1; /* indigo-500 */
    border-radius: 9999px;
    cursor: pointer;
    transition: transform 0.15s ease, background-color 0.15s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    background-color: #4f46e5; /* darker indigo */
  }

  input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(1.2);
    background-color: #4338ca;
  }
`}
</style>


export default LessonSelector;
