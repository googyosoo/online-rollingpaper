'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRollingPaper, createRollingPaperWithCustomId } from '@/lib/firebase';
import { Sparkles, PartyPopper, ArrowRight, Lock, Settings } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'home' | 'create' | 'join' | 'admin'>('home');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [paperId, setPaperId] = useState('');
  const [customId, setCustomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const newPaperId = await createRollingPaper(title.trim(), password || undefined);
      router.push(`/${newPaperId}`);
    } catch (error) {
      console.error('Failed to create rolling paper:', error);
      alert('롤링페이퍼 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customId.trim()) return;

    // Validate custom ID (only alphanumeric and hyphens)
    const idRegex = /^[a-zA-Z0-9-_]+$/;
    if (!idRegex.test(customId)) {
      alert('ID는 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await createRollingPaperWithCustomId(customId.trim(), title.trim(), password || undefined);
      router.push(`/${customId.trim()}`);
    } catch (error) {
      console.error('Failed to create rolling paper:', error);
      if (error instanceof Error && error.message.includes('이미 존재')) {
        alert('이미 사용 중인 ID입니다. 다른 ID를 입력해주세요.');
      } else {
        alert('롤링페이퍼 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperId.trim()) return;
    router.push(`/${paperId.trim()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl animate-bounce opacity-50">🎈</div>
        <div className="absolute top-40 right-20 text-5xl animate-pulse opacity-50">🎉</div>
        <div className="absolute bottom-32 left-1/4 text-4xl animate-bounce opacity-50">✨</div>
        <div className="absolute bottom-20 right-1/3 text-5xl animate-pulse opacity-50">💕</div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Logo & Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-xl mb-6">
            <span className="text-5xl">💌</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            롤링페이퍼
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            소중한 사람에게 마음을 담은 메시지를 전해보세요 ✨
          </p>
        </div>

        {/* Home Mode */}
        {mode === 'home' && (
          <div className="w-full max-w-sm space-y-4 animate-slide-up">
            <button
              onClick={() => setMode('create')}
              className="w-full py-5 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              새 롤링페이퍼 만들기
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-5 px-6 bg-white text-gray-700 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <PartyPopper className="w-6 h-6" />
              기존 롤링페이퍼 접속
            </button>
            <button
              onClick={() => setMode('admin')}
              className="w-full py-3 px-6 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Settings className="w-4 h-4" />
              관리자 모드
            </button>
          </div>
        )}

        {/* Create Mode */}
        {mode === 'create' && (
          <form onSubmit={handleCreate} className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-xl animate-slide-up">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              새 롤링페이퍼 만들기
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  롤링페이퍼 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 민수에게 💕"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  비밀번호 (선택)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="설정하면 비밀번호 입력 후 열람 가능"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? '생성 중...' : (
                  <>
                    만들기 <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMode('home')}
              className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 돌아가기
            </button>
          </form>
        )}

        {/* Join Mode */}
        {mode === 'join' && (
          <form onSubmit={handleJoin} className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-xl animate-slide-up">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              롤링페이퍼 접속
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  롤링페이퍼 ID
                </label>
                <input
                  type="text"
                  value={paperId}
                  onChange={(e) => setPaperId(e.target.value)}
                  placeholder="공유받은 ID를 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!paperId.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                접속하기 <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMode('home')}
              className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 돌아가기
            </button>
          </form>
        )}

        {/* Admin Mode */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminCreate} className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-xl animate-slide-up border-2 border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-center text-gray-800">
                관리자 모드
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🆔 원하는 ID 지정
                </label>
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="예: birthday-2024, class-3-1"
                  className="w-full px-4 py-3 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  영문, 숫자, 하이픈(-), 언더스코어(_) 사용 가능
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  롤링페이퍼 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 민수에게 💕"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  비밀번호 (선택)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="설정하면 비밀번호 입력 후 열람 가능"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !title.trim() || !customId.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? '생성 중...' : (
                  <>
                    ID로 생성하기 <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setMode('home'); setCustomId(''); }}
              className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 돌아가기
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="mt-12 text-sm text-gray-500">
          마음을 전하는 온라인 롤링페이퍼 💕
        </p>
      </div>
    </main>
  );
}
