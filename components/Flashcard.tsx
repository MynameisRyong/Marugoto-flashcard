import React from 'react';
import { VocabularyEntry } from '../types';

interface FlashcardProps {
  entry: VocabularyEntry;
  isFlipped: boolean;
  onFlip: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ entry, isFlipped, onFlip }) => {
  return (
    <div 
      className="perspective-1000 w-full max-w-lg h-96 cursor-pointer group"
      onClick={onFlip}
    >
      <div 
        className={`
          relative w-full h-full text-center transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl flex flex-col items-center justify-center p-8 border border-gray-100">
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            {entry.kanji ? (
              <>
                {/* Kanji: auto scale theo màn hình */}
                <span className="font-bold text-gray-900 jp-font tracking-wider text-[clamp(2.5rem,10vw,4.5rem)]">
                  {entry.kanji}
                </span>
                {/* Hiragana: nhỏ hơn, cũng responsive */}
                <span className="text-gray-500 jp-font text-[clamp(1.4rem,5vw,2.4rem)]">
                  ({entry.hiragana})
                </span>
              </>
            ) : (
              // Trường hợp chỉ có hiragana
              <span className="font-bold text-gray-900 jp-font text-[clamp(2.2rem,9vw,4rem)]">
                {entry.hiragana}
              </span>
            )}
          </div>
          <div className="mt-auto text-gray-300 text-sm font-medium">
            Tap to flip
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 rounded-3xl flex flex-col items-center justify-center p-8 text-white">
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Nghĩa tiếng Việt: cho nhỏ lại trên mobile */}
            <span
                className="
                            font-semibold 
                            text-center 
                            px-4
                            text-[2rem] 
                            leading-relaxed
                            sm:text-3xl sm:leading-loose
                            md:text-[3.2rem] md:leading-[1.5]
  "
>
  {entry.meaning}
</span>
          </div>
          <div className="mt-auto text-indigo-300 text-sm font-medium">
            Lesson {entry.lesson}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
