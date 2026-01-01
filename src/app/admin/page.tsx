'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllRollingPapers, getLoginLogs, deleteRollingPaper, RollingPaper, LoginLog, ADMIN_EMAILS } from '@/lib/firebase';
import { Home, Trash2, Users, FileText, LogOut, RefreshCw } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const { user, loading, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<'papers' | 'logs'>('papers');
    const [papers, setPapers] = useState<RollingPaper[]>([]);
    const [logs, setLogs] = useState<LoginLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
            return;
        }

        if (!loading && user && !isAdmin) {
            alert('관리자 권한이 없습니다.');
            router.push('/');
            return;
        }

        if (user && isAdmin) {
            loadData();
        }
    }, [user, loading, isAdmin, router]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [papersData, logsData] = await Promise.all([
                getAllRollingPapers(),
                getLoginLogs()
            ]);
            setPapers(papersData);
            setLogs(logsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (paperId: string, title: string) => {
        if (!confirm(`정말로 "${title}" 롤링페이퍼를 삭제하시겠습니까?\n모든 메시지가 함께 삭제됩니다.`)) {
            return;
        }

        setIsDeleting(paperId);
        try {
            await deleteRollingPaper(paperId);
            setPapers(prev => prev.filter(p => p.id !== paperId));
            alert('삭제되었습니다.');
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('삭제에 실패했습니다.');
        } finally {
            setIsDeleting(null);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        // Firestore Timestamp to Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ko-KR');
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                <div className="text-2xl text-gray-600 animate-pulse">⚙️ 불러오는 중...</div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100">
            {/* Header */}
            <header className="sticky top-0 z-30 p-4 backdrop-blur-sm bg-white/80 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 rounded-xl bg-white shadow hover:shadow-lg transition-all"
                        >
                            <Home className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-purple-800">🔐 관리자 대시보드</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadData}
                            className="p-2 rounded-xl bg-white shadow hover:shadow-lg transition-all"
                            title="새로고침"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="hidden sm:inline">{user.email}</span>
                            <button onClick={signOut} className="text-gray-500 hover:text-gray-700">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 pt-6">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('papers')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'papers'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        롤링페이퍼 ({papers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'logs'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        로그인 기록 ({logs.length})
                    </button>
                </div>

                {/* Papers Tab */}
                {activeTab === 'papers' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-purple-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">제목</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">생성자</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">메시지 수</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">생성일</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-purple-800">삭제</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {papers.map((paper) => (
                                        <tr key={paper.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <a
                                                    href={`/${paper.id}`}
                                                    target="_blank"
                                                    className="text-purple-600 hover:underline font-mono text-sm"
                                                >
                                                    {paper.id.slice(0, 12)}...
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{paper.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">{paper.creatorEmail || '-'}</td>
                                            <td className="px-6 py-4">{paper.messageCount || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(paper.createdAt)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(paper.id, paper.title)}
                                                    disabled={isDeleting === paper.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {papers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                롤링페이퍼가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Logs Tab */}
                {activeTab === 'logs' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-purple-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">이메일</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">이름</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-800">접속 시간</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-mono">{log.email}</td>
                                            <td className="px-6 py-4 font-medium">{log.displayName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(log.loginAt)}</td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                                로그인 기록이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
