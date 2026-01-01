'use client';

import { Plus } from 'lucide-react';

interface FABProps {
    onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
    return (
        <button
            onClick={onClick}
            className="
        fixed bottom-8 right-8 z-40
        w-16 h-16 rounded-full
        bg-gradient-to-r from-pink-500 to-rose-500
        text-white shadow-2xl
        flex items-center justify-center
        hover:from-pink-600 hover:to-rose-600
        hover:scale-110
        active:scale-95
        transition-all duration-300
        animate-pulse hover:animate-none
      "
            aria-label="메시지 추가"
        >
            <Plus className="w-8 h-8" />
        </button>
    );
}
