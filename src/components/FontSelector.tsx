'use client';

import { fonts, Font } from '@/lib/fonts';
import { Type } from 'lucide-react';

interface FontSelectorProps {
    currentFont: Font;
    onSelect: (fontId: string) => void;
}

export default function FontSelector({ currentFont, onSelect }: FontSelectorProps) {
    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur shadow hover:shadow-lg transition-all">
                <Type className="w-5 h-5" />
                <span className="hidden sm:inline">{currentFont.name}</span>
            </button>

            <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[160px]">
                <p className="text-xs text-gray-500 mb-2 px-2">폰트 선택</p>
                <div className="space-y-1">
                    {fonts.map((font) => (
                        <button
                            key={font.id}
                            onClick={() => onSelect(font.id)}
                            className={`
                w-full text-left px-3 py-2 rounded-xl
                transition-all hover:bg-gray-100
                ${currentFont.id === font.id ? 'bg-pink-100' : ''}
              `}
                            style={{ fontFamily: font.fontFamily }}
                        >
                            {font.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
