'use client';

import { LayoutGrid, Shuffle } from 'lucide-react';

interface ViewToggleProps {
    mode: 'grid' | 'scatter';
    onChange: (mode: 'grid' | 'scatter') => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
    return (
        <div className="flex items-center bg-white/80 backdrop-blur rounded-xl shadow overflow-hidden">
            <button
                onClick={() => onChange('scatter')}
                className={`
          flex items-center gap-2 px-4 py-2 transition-all
          ${mode === 'scatter'
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
        `}
            >
                <Shuffle className="w-5 h-5" />
                <span className="hidden sm:inline">모아보기</span>
            </button>
            <button
                onClick={() => onChange('grid')}
                className={`
          flex items-center gap-2 px-4 py-2 transition-all
          ${mode === 'grid'
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
        `}
            >
                <LayoutGrid className="w-5 h-5" />
                <span className="hidden sm:inline">펼쳐보기</span>
            </button>
        </div>
    );
}
