import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { themeInitScript } from "@/components/ThemeToggle";
import { getAllPosts, getCategories } from "@/lib/posts";
import { site } from "@/lib/site";
import "./globals.css";

// 제목용 손글씨: 밍기적체 Medium (상밍기적) — 굵기 1종. 본문은 읽기 편한 Pretendard
const mingijuk = localFont({
  src: "./fonts/mingijuk/Mingijuk.woff2",
  weight: "400",
  variable: "--font-mingijuk",
  display: "swap",
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
});
// 코드: JetBrains Mono (빌드할 때 받아서 사이트와 함께 배포됩니다)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: site.title, template: `%s · ${site.title}` },
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategories();
  const total = getAllPosts().length;
  return (
    <html lang="ko" className={`${mingijuk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* 본문: Pretendard (한글은 쓰인 글자만 내려받는 dynamic subset) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <Sidebar categories={categories} total={total} />
        {/* 본문은 화면 전체 기준 가운데. 화면이 좁아 사이드바(296px)와 겹칠 때만 사이드바 오른쪽으로 밀립니다. */}
        <main className="mx-auto w-full max-w-[848px] px-4 pt-7 pb-20 sm:px-8 lg:mr-auto lg:ml-[max(296px,calc(50%-424px))] lg:px-12 lg:pt-12">
          {children}
        </main>
      </body>
    </html>
  );
}
