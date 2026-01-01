'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Theme } from '@/lib/themes';
import { Font } from '@/lib/fonts';

const EMOJI_OPTIONS = [
    '😊', '🥰', '😍', '🤗', '💕', '💖', '✨', '🌟', '🎉', '🎊',
    '🌸', '🌺', '🌻', '🌼', '🍀', '🦋', '🌈', '☀️', '🌙', '⭐',
];

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: { author: string; emoji: string; content: string }) => void;
    theme: Theme;
    font: Font;
}

export default function MessageModal({
    isOpen,
    onClose,
    onSubmit,
    theme,
    font,
}: MessageModalProps) {
    const [author, setAuthor] = useState('');
    const [emoji, setEmoji] = useState('😊');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!author.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ author: author.trim(), emoji, content: content.trim() });
            setAuthor('');
            setEmoji('😊');
            setContent('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`
          relative w-full max-w-md rounded-3xl p-6
          ${theme.cardBg} ${theme.textColor}
          shadow-2xl
        `}
                style={{ fontFamily: font.fontFamily }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">💌 메시지 남기기</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Author Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">이름</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="이름을 입력하세요"
                            maxLength={20}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-gray-800"
                            required
                        />
                    </div>

                    {/* Emoji Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">이모지 선택</label>
                        <div className="flex flex-wrap gap-2">
                            {EMOJI_OPTIONS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`
                    w-10 h-10 text-xl rounded-lg transition-all
                    ${emoji === e
                                            ? 'bg-pink-200 scale-110 ring-2 ring-pink-400'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }
                  `}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Content */}
                    <div>
                        <label className="block text-sm font-medium mb-2">메시지</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="마음을 담은 메시지를 작성해주세요..."
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none bg-white text-gray-800"
                            required
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {content.length}/500
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !author.trim() || !content.trim()}
                        className={`
              w-full py-4 rounded-xl font-bold text-lg
              bg-gradient-to-r from-pink-500 to-rose-500
              text-white shadow-lg
              hover:from-pink-600 hover:to-rose-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
            `}
                    >
                        {isSubmitting ? '전송 중...' : '💕 메시지 남기기'}
                    </button>
                </form>
            </div>
        </div>
    );
}
