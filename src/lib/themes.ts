export interface Theme {
    id: string;
    name: string;
    background: string;
    cardBg: string;
    textColor: string;
    accentColor: string;
    gradient?: string;
}

export const themes: Theme[] = [
    {
        id: 'default',
        name: '기본',
        background: 'bg-gradient-to-br from-amber-50 to-orange-100',
        cardBg: 'bg-white',
        textColor: 'text-gray-800',
        accentColor: 'text-orange-500',
    },
    {
        id: 'christmas',
        name: '크리스마스',
        background: 'bg-gradient-to-br from-red-900 via-green-900 to-red-900',
        cardBg: 'bg-red-50',
        textColor: 'text-green-900',
        accentColor: 'text-red-600',
    },
    {
        id: 'pink',
        name: '핑크',
        background: 'bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300',
        cardBg: 'bg-white/90',
        textColor: 'text-pink-900',
        accentColor: 'text-rose-500',
    },
    {
        id: 'ocean',
        name: '바다',
        background: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
        cardBg: 'bg-white/95',
        textColor: 'text-blue-900',
        accentColor: 'text-cyan-500',
    },
    {
        id: 'aurora',
        name: '오로라',
        background: 'bg-gradient-to-br from-purple-900 via-pink-700 to-teal-500',
        cardBg: 'bg-white/90',
        textColor: 'text-purple-900',
        accentColor: 'text-teal-500',
    },
    {
        id: 'space',
        name: '우주',
        background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
        cardBg: 'bg-slate-800/90 backdrop-blur',
        textColor: 'text-white',
        accentColor: 'text-purple-400',
    },
    {
        id: 'city',
        name: '도시',
        background: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
        cardBg: 'bg-amber-50',
        textColor: 'text-gray-900',
        accentColor: 'text-amber-600',
    },
    {
        id: 'newyear',
        name: '신년',
        background: 'bg-gradient-to-br from-yellow-400 via-red-500 to-yellow-500',
        cardBg: 'bg-white',
        textColor: 'text-red-900',
        accentColor: 'text-yellow-600',
    },
];

export function getTheme(id: string): Theme {
    return themes.find(t => t.id === id) || themes[0];
}
