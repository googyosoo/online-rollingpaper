export interface Font {
    id: string;
    name: string;
    className: string;
    fontFamily: string;
}

export const fonts: Font[] = [
    {
        id: 'default',
        name: '기본',
        className: 'font-sans',
        fontFamily: 'system-ui, sans-serif',
    },
    {
        id: 'nanum-gothic',
        name: '나눔고딕',
        className: 'font-nanum-gothic',
        fontFamily: '"Nanum Gothic", sans-serif',
    },
    {
        id: 'nanum-myeongjo',
        name: '나눔명조',
        className: 'font-nanum-myeongjo',
        fontFamily: '"Nanum Myeongjo", serif',
    },
    {
        id: 'nanum-pen',
        name: '나눔손글씨',
        className: 'font-nanum-pen',
        fontFamily: '"Nanum Pen Script", cursive',
    },
    {
        id: 'poor-story',
        name: '푸어스토리',
        className: 'font-poor-story',
        fontFamily: '"Poor Story", cursive',
    },
    {
        id: 'jua',
        name: '주아',
        className: 'font-jua',
        fontFamily: '"Jua", sans-serif',
    },
];

export function getFont(id: string): Font {
    return fonts.find(f => f.id === id) || fonts[0];
}

// Google Fonts import URL
export const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Gothic:wght@400;700&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&family=Poor+Story&display=swap';
