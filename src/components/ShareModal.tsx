'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Link as LinkIcon } from 'lucide-react';
import { Theme } from '@/lib/themes';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    paperId: string;
    paperTitle: string;
    theme: Theme;
}

export default function ShareModal({
    isOpen,
    onClose,
    paperId,
    paperTitle,
    theme,
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${paperId}`
        : '';

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleKakaoShare = () => {
        // Kakao share placeholder - would need Kakao SDK
        window.open(
            `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`,
            '_blank'
        );
    };

    const handleTwitterShare = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(`💌 ${paperTitle} 롤링페이퍼에 메시지를 남겨주세요!`)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank'
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
        relative w-full max-w-md rounded-3xl p-6
        ${theme.cardBg} ${theme.textColor}
        shadow-2xl
      `}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">🔗 공유하기</h2>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white rounded-2xl shadow-inner">
                        <QRCodeSVG
                            value={shareUrl}
                            size={160}
                            level="H"
                            includeMargin
                        />
                    </div>
                </div>

                {/* URL Copy */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl">
                        <LinkIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
                        />
                        <button
                            onClick={handleCopy}
                            className={`
                px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-pink-500 text-white hover:bg-pink-600'
                                }
              `}
                        >
                            {copied ? (
                                <span className="flex items-center gap-1">
                                    <Check className="w-4 h-4" /> 복사됨
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Copy className="w-4 h-4" /> 복사
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleKakaoShare}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-400 text-yellow-900 font-medium hover:bg-yellow-500 transition-colors"
                    >
                        💬 카카오스토리
                    </button>
                    <button
                        onClick={handleTwitterShare}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-400 text-white font-medium hover:bg-sky-500 transition-colors"
                    >
                        🐦 트위터
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                    QR코드를 스캔하거나 링크를 공유해보세요!
                </p>
            </div>
        </div>
    );
}
