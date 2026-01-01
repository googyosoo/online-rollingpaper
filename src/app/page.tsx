'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRollingPaper, createRollingPaperWithCustomId, getMyRollingPapers, deleteRollingPaper, RollingPaper, ADMIN_EMAILS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight, Lock, Settings, LogOut, Trash2, Plus, LayoutGrid, FileText } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  // Dashboard state
  const [myPapers, setMyPapers] = useState<RollingPaper[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isAdminCreating, setIsAdminCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [customId, setCustomId] = useState('');

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  // Load user's papers
  useEffect(() => {
    if (!loading) {
      if (user) {
        loadMyPapers();
      }
      setIsPageLoading(false);
    }
  }, [user, loading]);

  const loadMyPapers = async () => {
    if (!user) return;
    try {
      const papers = await getMyRollingPapers(user.uid);
      setMyPapers(papers);
    } catch (error) {
      console.error('Failed to load papers:', error);
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);

    // Environment Variable Check
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setErrorMsg('설정 오류: Firebase API Key가 없습니다. Vercel 환경변수를 확인해주세요.');
      return;
    }

    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Login failed:', error);
      let msg = error?.message || '알 수 없는 오류가 발생했습니다.';

      // Initial user-friendly translation
      if (msg.includes('auth/unauthorized-domain')) {
        msg = `도메인 승인 필요: Firebase Console > Authentication > Settings > Authorized domains에\n'${window.location.hostname}'을 추가해주세요.\n(Error: ${msg})`;
      } else if (msg.includes('auth/popup-closed-by-user')) {
        msg = '로그인 창이 닫혔습니다. 다시 시도해주세요.';
      } else if (msg.includes('auth/invalid-api-key')) {
        msg = 'API Key 오류: Vercel 환경변수가 올바르지 않습니다.';
      }

      setErrorMsg(msg);
      // alert only if needed, but on-screen is better for copy-paste
      // alert(`로그인 실패:\n${msg}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsLoading(true);
    try {
      const newPaperId = await createRollingPaper(
        title.trim(),
        password || undefined,
        { uid: user.uid, email: user.email || '' }
      );
      router.push(`/${newPaperId}`);
    } catch (error) {
      console.error('Failed to create:', error);
      alert('생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customId.trim() || !user) return;

    // Validate ID
    const idRegex = /^[a-zA-Z0-9-_]+$/;
    if (!idRegex.test(customId)) {
      alert('ID는 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await createRollingPaperWithCustomId(
        customId.trim(),
        title.trim(),
        password || undefined,
        { uid: user.uid, email: user.email || '' }
      );
      router.push(`/${customId.trim()}`);
    } catch (error) {
      console.error('Failed to create:', error);
      if (error instanceof Error && error.message.includes('이미 존재')) {
        alert('이미 사용 중인 ID입니다.');
      } else {
        alert('생성에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaper = async (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm('정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;

    try {
      await deleteRollingPaper(paperId);
      setMyPapers(prev => prev.filter(p => p.id !== paperId));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
        <div className="text-2xl text-gray-600 animate-pulse">💌 로딩 중...</div>
      </div>
    );
  }

  // Not logged in -> Landing Page
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        {/* Decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 text-6xl animate-bounce opacity-50 delay-1000">🎈</div>
          <div className="absolute top-40 right-20 text-5xl animate-pulse opacity-50 delay-500">🎉</div>
          <div className="absolute bottom-32 left-1/4 text-4xl animate-bounce opacity-50 delay-700">✨</div>
        </div>

        <div className="relative z-10 text-center space-y-8 animate-fade-in max-w-lg w-full">
          <div>
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-transform">
              <span className="text-6xl">💌</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
              온라인<br />롤링페이퍼
            </h1>
            <p className="text-xl text-gray-600">
              소중한 사람에게 마음을 전하세요 💕
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-5 px-8 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M24 12.276c0-1.166-.1-2.276-.289-3.344H12v6.177h6.738c-.292 1.543-1.155 2.85-2.454 3.722v3.082h3.978c2.327-2.14 3.667-5.293 3.667-8.914l-.001-.723z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.958-1.074 7.942-2.906l-3.979-3.082c-1.078.723-2.455 1.15-3.963 1.15-3.064 0-5.658-2.072-6.586-4.862H1.365v3.049C3.376 21.36 7.42 24 12 24z" />
              <path fill="#FBBC05" d="M5.414 14.302c-.227-.678-.358-1.402-.358-2.148 0-.746.131-1.47.358-2.148V6.957H1.365C.493 8.694 0 10.669 0 12.854c0 2.185.493 4.16 1.365 5.897l4.049-3.449z" />
              <path fill="#4285F4" d="M12 4.778c1.763 0 3.348.606 4.6 1.8l3.435-3.44C17.953 1.173 15.235 0 12 0 7.42 0 3.376 2.64 1.365 6.957l4.049 3.449c.928-2.79 3.522-4.862 6.586-4.862z" />
            </svg>
            <span className="group-hover:text-blue-600 transition-colors">Google 계정으로 시작하기</span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {errorMsg && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-left animate-shake">
              <h3 className="text-red-800 font-bold mb-1 flex items-center gap-2">
                ⚠️ 로그인 오류
              </h3>
              <p className="text-red-600 text-sm whitespace-pre-wrap font-mono">
                {errorMsg}
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💌</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              온라인 롤링페이퍼
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                관리자 모드
              </button>
            )}
            <div className="flex items-center gap-3 pl-4 border-l">
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-900">{user.displayName}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              반가워요, {user.displayName}님! 👋
            </h2>
            <p className="text-gray-500 mt-1">오늘도 마음을 전해보세요</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsCreating(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-5 h-5" />
              새 롤링페이퍼 만들기
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsAdminCreating(true)}
                className="px-4 py-3 bg-white text-purple-600 border border-purple-200 rounded-xl font-bold hover:bg-purple-50 transition-all"
                title="커스텀 ID 생성 (관리자)"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPapers.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4 text-3xl">
                📝
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">아직 만든 롤링페이퍼가 없어요</h3>
              <p className="text-gray-500 mb-6">첫 번째 롤링페이퍼를 만들어보세요!</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                시작하기
              </button>
            </div>
          ) : (
            myPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => router.push(`/${paper.id}`)}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-50 to-purple-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform" />

                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">💌</span>
                    <button
                      onClick={(e) => handleDeletePaper(e, paper.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-pink-600 transition-colors">
                    {paper.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {paper.messageCount || 0}개의 메시지
                    </span>
                  </div>

                  {paper.password && (
                    <div className="absolute bottom-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create Modal */}
      {(isCreating || isAdminCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-scale-up relative">
            <button
              onClick={() => { setIsCreating(false); setIsAdminCreating(false); setTitle(''); setPassword(''); setCustomId(''); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5 rotate-180" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {isAdminCreating ? '커스텀 ID 생성 (관리자)' : '새 롤링페이퍼 만들기'}
            </h2>

            <form onSubmit={isAdminCreating ? handleAdminCreate : handleCreate} className="space-y-4">
              {isAdminCreating && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID 설정
                  </label>
                  <input
                    type="text"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder="예: birthday-2024"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent font-mono"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 민수에게 💕"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  required
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 (선택)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="입력 시 잠금 설정됨"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !title.trim() || (isAdminCreating && !customId.trim())}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${isAdminCreating
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500'
                  }`}
              >
                {isLoading ? '생성 중...' : (
                  <>
                    만들기 <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
