'use client';

import { Message } from '@/lib/firebase';
import { Theme } from '@/lib/themes';
import { Font } from '@/lib/fonts';
import { Heart } from 'lucide-react';

interface MessageCardProps {
    message: Message;
    theme: Theme;
    font: Font;
    viewMode: 'grid' | 'scatter';
    rotation?: number;
    onHeart: (messageId: string) => void;
}

export default function MessageCard({
    message,
    theme,
    font,
    viewMode,
    rotation = 0,
    onHeart,
}: MessageCardProps) {
    const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
        if (!timestamp?.seconds) return '';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div
            className={`
        ${theme.cardBg} ${theme.textColor}
        rounded-2xl p-5 shadow-lg hover:shadow-xl
        transition-all duration-300 hover:scale-105
        ${viewMode === 'scatter' ? 'absolute' : ''}
      `}
            style={{
                fontFamily: font.fontFamily,
                transform: viewMode === 'scatter' ? `rotate(${rotation}deg)` : 'none',
                minWidth: '200px',
                maxWidth: '280px',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{message.emoji}</span>
                <span className="font-bold text-lg">{message.author}</span>
            </div>

            {/* Content */}
            <p className="text-base leading-relaxed mb-4 whitespace-pre-wrap">
                {message.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm opacity-70">
                <span>{formatDate(message.createdAt as { seconds: number; nanoseconds: number })}</span>
                <button
                    onClick={() => onHeart(message.id)}
                    className={`
            flex items-center gap-1 px-2 py-1 rounded-full
            hover:bg-pink-100 transition-colors
            ${theme.accentColor}
          `}
                >
                    <Heart className="w-4 h-4" fill={message.hearts > 0 ? 'currentColor' : 'none'} />
                    {message.hearts > 0 && <span>{message.hearts}</span>}
                </button>
            </div>
        </div>
    );
}
