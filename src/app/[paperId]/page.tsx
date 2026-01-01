'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    getRollingPaper,
    getMessages,
    addMessage,
    addHeart,
    updateMessage,
    deleteMessage,
    updateRollingPaperSettings,
    Message,
    RollingPaper,
    ADMIN_EMAILS
} from '@/lib/firebase';
import { getTheme, Theme } from '@/lib/themes';
import { getFont, Font, googleFontsUrl } from '@/lib/fonts';
import { useAuth } from '@/contexts/AuthContext';
import MessageCard from '@/components/MessageCard';
import MessageModal from '@/components/MessageModal';
import ShareModal from '@/components/ShareModal';
import ThemeSelector from '@/components/ThemeSelector';
import FontSelector from '@/components/FontSelector';
import ViewToggle from '@/components/ViewToggle';
import FAB from '@/components/FAB';
import { Share2, Home, Lock, Search, X, LogIn } from 'lucide-react';

interface PageProps {
    params: Promise<{ paperId: string }>;
}

export default function PaperPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user, signInWithGoogle } = useAuth();
    const [paper, setPaper] = useState<RollingPaper | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [theme, setTheme] = useState<Theme>(getTheme('default'));
    const [font, setFont] = useState<Font>(getFont('default'));
    const [viewMode, setViewMode] = useState<'grid' | 'scatter'>('scatter');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [rotations, setRotations] = useState<number[]>([]);
    const [positions, setPositions] = useState<{ left: number; top: number }[]>([]);
    const [mounted, setMounted] = useState(false);

    // Client-side only flag
    useEffect(() => {
        setMounted(true);
    }, []);

    // Load paper data
    useEffect(() => {
        const loadPaper = async () => {
            try {
                const paperData = await getRollingPaper(resolvedParams.paperId);
                if (!paperData) {
                    alert('롤링페이퍼를 찾을 수 없습니다.');
                    router.push('/');
                    return;
                }

                setPaper(paperData);
                setTheme(getTheme(paperData.theme));
                setFont(getFont(paperData.font));

                if (paperData.password) {
                    setIsLocked(true);
                } else {
                    await loadMessages();
                }
            } catch (error) {
                console.error('Failed to load paper:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const loadMessages = async () => {
            const msgs = await getMessages(resolvedParams.paperId);
            setMessages(msgs);
            // Pre-calculate random positions to avoid hydration mismatch
            setRotations(msgs.map(() => Math.random() * 16 - 8));
            setPositions(msgs.map((_, index) => ({
                left: (index % 4) * 24 + Math.random() * 8,
                top: Math.floor(index / 4) * 200 + Math.random() * 40
            })));
        };

        loadPaper();
    }, [resolvedParams.paperId, router]);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paper?.password === passwordInput) {
            setIsLocked(false);
            const msgs = await getMessages(resolvedParams.paperId);
            setMessages(msgs);
            setRotations(msgs.map(() => Math.random() * 16 - 8));
            setPositions(msgs.map((_, index) => ({
                left: (index % 4) * 24 + Math.random() * 8,
                top: Math.floor(index / 4) * 200 + Math.random() * 40
            })));
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    const handleAddMessage = async (message: { author: string; emoji: string; content: string }) => {
        try {
            await addMessage(
                resolvedParams.paperId,
                message,
                user ? { uid: user.uid, email: user.email || '' } : undefined
            );
            const msgs = await getMessages(resolvedParams.paperId);
            setMessages(msgs);
            // new message position
            setRotations(prev => [...prev, Math.random() * 16 - 8]);
            setPositions(prev => [...prev, {
                left: (msgs.length % 4) * 24 + Math.random() * 8,
                top: Math.floor(msgs.length / 4) * 200 + Math.random() * 40
            }]);
        } catch (error) {
            console.error('Failed to add message:', error);
            alert('메시지 추가에 실패했습니다.');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('정말로 삭제하시겠습니까?')) return;
        try {
            await deleteMessage(resolvedParams.paperId, messageId);
            setMessages(prev => prev.filter(m => m.id !== messageId));
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('삭제에 실패했습니다.');
        }
    };

    const handleUpdateMessage = async (messageId: string, content: string) => {
        try {
            await updateMessage(resolvedParams.paperId, messageId, { content });
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content } : m));
        } catch (error) {
            console.error('Failed to update message:', error);
            alert('수정에 실패했습니다.');
        }
    };

    const handleHeart = async (messageId: string) => {
        try {
            await addHeart(resolvedParams.paperId, messageId);
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, hearts: m.hearts + 1 } : m
            ));
        } catch (error) {
            console.error('Failed to add heart:', error);
        }
    };

    const handleThemeChange = async (themeId: string) => {
        const newTheme = getTheme(themeId);
        setTheme(newTheme);
        try {
            await updateRollingPaperSettings(resolvedParams.paperId, { theme: themeId });
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    const handleFontChange = async (fontId: string) => {
        const newFont = getFont(fontId);
        setFont(newFont);
        try {
            await updateRollingPaperSettings(resolvedParams.paperId, { font: fontId });
        } catch (error) {
            console.error('Failed to update font:', error);
        }
    };

    const filteredMessages = messages.filter(m =>
        !searchQuery ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                <div className="text-2xl text-gray-600 animate-pulse">💌 불러오는 중...</div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 p-4">
                <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-xl">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-pink-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">비밀번호가 설정된 롤링페이퍼입니다</h2>
                    </div>

                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
                    />

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold"
                    >
                        열기
                    </button>
                </form>
            </div>
        );
    }

    return (
        <>
            {/* Google Fonts */}
            <link href={googleFontsUrl} rel="stylesheet" />

            <div className={`min-h-screen ${theme.background}`} style={{ fontFamily: font.fontFamily }}>
                {/* Header */}
                <header className="sticky top-0 z-30 p-4 backdrop-blur-sm bg-white/30">
                    <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
                        {/* Left: Home + Title */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 rounded-xl bg-white/80 shadow hover:shadow-lg transition-all"
                            >
                                <Home className="w-5 h-5" />
                            </button>
                            <h1 className={`text-xl font-bold ${theme.textColor}`}>
                                {paper?.title || '롤링페이퍼'}
                            </h1>
                        </div>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search */}
                            <div className="relative">
                                {isSearchOpen ? (
                                    <div className="flex items-center gap-2 bg-white rounded-xl shadow px-3 py-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="검색..."
                                            className="w-32 sm:w-48 outline-none text-sm"
                                            autoFocus
                                        />
                                        <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}>
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsSearchOpen(true)}
                                        className="p-2 rounded-xl bg-white/80 shadow hover:shadow-lg transition-all"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <ViewToggle mode={viewMode} onChange={setViewMode} />
                            <ThemeSelector currentTheme={theme} onSelect={handleThemeChange} />
                            <FontSelector currentFont={font} onSelect={handleFontChange} />

                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow hover:shadow-lg transition-all"
                            >
                                <Share2 className="w-5 h-5" />
                                <span className="hidden sm:inline">공유</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <main className="p-4 pb-24">
                    <div className={`
            max-w-6xl mx-auto
            ${viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                            : 'relative min-h-[600px]'
                        }
          `}>
                        {filteredMessages.length === 0 ? (
                            <div className="col-span-full text-center py-20">
                                <div className="text-6xl mb-4">💌</div>
                                <p className={`text-xl ${theme.textColor} opacity-70`}>
                                    {searchQuery ? '검색 결과가 없습니다' : '아직 메시지가 없습니다'}
                                </p>
                                <p className={`${theme.textColor} opacity-50 mt-2`}>
                                    오른쪽 아래 버튼을 눌러 첫 메시지를 남겨보세요!
                                </p>
                            </div>
                        ) : (
                            filteredMessages.map((message, index) => {
                                // Only use random positions after mount to avoid hydration mismatch
                                const scatterStyle = mounted && viewMode === 'scatter' && positions[index] ? {
                                    position: 'absolute' as const,
                                    left: `${positions[index].left}%`,
                                    top: `${positions[index].top}px`,
                                } : undefined;

                                return (
                                    <div
                                        key={message.id}
                                        style={scatterStyle}
                                        className={!mounted && viewMode === 'scatter' ? 'mb-4' : undefined}
                                    >
                                        <MessageCard
                                            message={message}
                                            theme={theme}
                                            font={font}
                                            viewMode={viewMode}
                                            rotation={mounted ? (rotations[index] || 0) : 0}
                                            isOwner={
                                                (user && message.authorUid === user.uid) ||
                                                (user?.email && ADMIN_EMAILS.includes(user.email)) ||
                                                false
                                            }
                                            onHeart={handleHeart}
                                            onDelete={handleDeleteMessage}
                                            onUpdate={handleUpdateMessage}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>

                {/* FAB - 로그인한 사용자만 */}
                {user ? (
                    <FAB onClick={() => setIsMessageModalOpen(true)} />
                ) : (
                    <button
                        onClick={signInWithGoogle}
                        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        <LogIn className="w-5 h-5" />
                        로그인하고 메시지 남기기
                    </button>
                )}

                {/* Modals */}
                <MessageModal
                    isOpen={isMessageModalOpen}
                    onClose={() => setIsMessageModalOpen(false)}
                    onSubmit={handleAddMessage}
                    theme={theme}
                    font={font}
                />

                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    paperId={resolvedParams.paperId}
                    paperTitle={paper?.title || '롤링페이퍼'}
                    theme={theme}
                />
            </div>
        </>
    );
}
