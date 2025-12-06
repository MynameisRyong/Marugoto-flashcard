import React, { useState, useEffect } from 'react';
import { BookDefinition } from '../types';
import { BookOpen, Star } from 'lucide-react';

interface BookSelectorProps {
  books: BookDefinition[];
  onSelectBook: (bookId: string) => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({ books, onSelectBook }) => {
  // Initialize pinned IDs from localStorage
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pinnedBookIds');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse pinned books", e);
      return [];
    }
  });

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card selection when clicking pin
    e.preventDefault();
    
    setPinnedIds(prev => {
      const newPinned = prev.includes(id)
        ? prev.filter(pId => pId !== id)
        : [...prev, id];
      localStorage.setItem('pinnedBookIds', JSON.stringify(newPinned));
      return newPinned;
    });
  };

  // Sort books: Pinned first, then original order
  const sortedBooks = [...books].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned === bPinned) return 0;
    return aPinned ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Select a Book</h1>
        <p className="text-gray-600 text-lg">Choose your textbook to start practicing vocabulary.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {sortedBooks.map((book) => {
          const isPinned = pinnedIds.includes(book.id);
          
          return (
            <button
              key={book.id}
              onClick={() => onSelectBook(book.id)}
              className={`
                group relative flex flex-col items-start p-6 h-64 w-full rounded-3xl
                transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl shadow-sm
                border border-transparent hover:border-gray-200
                ${book.accentColor} text-left
              `}
            >
              {/* Pin Button */}
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => togglePin(e, book.id)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full hover:bg-white/50 transition-colors cursor-pointer"
                title={isPinned ? "Unpin book" : "Pin book to top"}
              >
                <Star 
                  size={24} 
                  className={`transition-colors ${isPinned ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                />
              </div>

              {/* Book Icon - Moved down to avoid collision with Pin button */}
              <div className={`
                absolute top-16 right-6 p-2 rounded-full bg-white bg-opacity-60 
                text-gray-500 shadow-sm pointer-events-none
              `}>
                <BookOpen size={20} />
              </div>

              <div className={`
                inline-block px-3 py-1 rounded-full text-xs font-bold mb-4
                bg-white bg-opacity-80 ${book.accentTextColor}
              `}>
                {book.vocabulary.length} Words
              </div>

              <h2 className={`text-2xl font-bold mb-3 text-gray-800 group-hover:${book.accentTextColor} transition-colors`}>
                {book.title}
              </h2>
              
              <p className="text-gray-600 leading-relaxed line-clamp-3">
                {book.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookSelector;