'use client';

import { useState } from 'react';
import { Message } from '@/lib/firebase';
import { Theme } from '@/lib/themes';
import { Font } from '@/lib/fonts';
import { Heart, Trash2, Edit2, X, Check } from 'lucide-react';

interface MessageCardProps {
    message: Message;
    theme: Theme;
    font: Font;
    viewMode: 'grid' | 'scatter';
    rotation?: number;
    isOwner?: boolean;
    onHeart: (messageId: string) => void;
    onDelete?: (messageId: string) => void;
    onUpdate?: (messageId: string, content: string) => void;
}

export default function MessageCard({
    message,
    theme,
    font,
    viewMode,
    rotation = 0,
    isOwner = false,
    onHeart,
    onDelete,
    onUpdate,
}: MessageCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const formatDate = (timestamp: any) => {
        if (!timestamp?.seconds && !timestamp?.toDate) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
        });
    };

    const handleUpdate = () => {
        if (onUpdate && editContent.trim() !== message.content) {
            onUpdate(message.id, editContent.trim());
        }
        setIsEditing(false);
    };

    return (
        <div
            className={`
        ${theme.cardBg} ${theme.textColor}
        rounded-2xl p-5 shadow-lg group
        ${viewMode === 'scatter' ? 'absolute hover:z-10' : ''}
        transition-all duration-300 hover:scale-105 hover:shadow-xl
      `}
            style={{
                fontFamily: font.fontFamily,
                transform: viewMode === 'scatter' ? `rotate(${rotation}deg)` : 'none',
                minWidth: '200px',
                maxWidth: '280px',
            }}
        >
            {/* Owner Actions */}
            {isOwner && !isEditing && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-lg p-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-blue-600 transition-colors"
                        title="수정"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(message.id)}
                            className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-red-500 transition-colors"
                            title="삭제"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{message.emoji}</span>
                <span className="font-bold text-lg">{message.author}</span>
            </div>

            {/* Content */}
            {isEditing ? (
                <div className="mb-4">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white/80"
                        rows={3}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="p-1 rounded-full hover:bg-green-100 text-green-600"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-base leading-relaxed mb-4 whitespace-pre-wrap break-words">
                    {message.content}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm opacity-70">
                <span>{formatDate(message.createdAt)}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onHeart(message.id);
                    }}
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
