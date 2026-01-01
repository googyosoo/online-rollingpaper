import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "롤링페이퍼 💌 | 마음을 전하는 온라인 롤링페이퍼",
  description: "소중한 사람에게 마음을 담은 메시지를 전해보세요. 무료 온라인 롤링페이퍼 서비스",
  keywords: ["롤링페이퍼", "온라인롤링페이퍼", "생일축하", "졸업축하", "메시지"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
