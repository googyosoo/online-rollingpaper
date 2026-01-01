'use client';

import { themes, Theme } from '@/lib/themes';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
    currentTheme: Theme;
    onSelect: (themeId: string) => void;
}

export default function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur shadow hover:shadow-lg transition-all">
                <Palette className="w-5 h-5" />
                <span className="hidden sm:inline">{currentTheme.name}</span>
            </button>

            <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[180px]">
                <p className="text-xs text-gray-500 mb-2 px-2">테마 선택</p>
                <div className="space-y-1">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => onSelect(theme.id)}
                            className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-xl
                transition-all hover:bg-gray-100
                ${currentTheme.id === theme.id ? 'bg-pink-100' : ''}
              `}
                        >
                            <div
                                className={`w-6 h-6 rounded-full ${theme.background}`}
                            />
                            <span className="text-sm">{theme.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
