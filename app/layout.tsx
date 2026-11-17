import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { themeInitScript } from "@/components/ThemeToggle";
import { getAllPosts, getCategories } from "@/lib/posts";
import { site } from "@/lib/site";
import "./globals.css";
// 밍기적체 보충 파일: 기본 파일에 없는 한글이 페이지에 있을 때만 받습니다 (scripts/subset-font.mjs가 생성)
import "./fonts/mingijuk/rest.css";

// 제목용 손글씨: 밍기적체 Medium (상밍기적) — 굵기 1종. 본문은 읽기 편한 Pretendard
const mingijuk = localFont({
  src: "./fonts/mingijuk/Mingijuk.woff2",
  weight: "400",
  variable: "--font-mingijuk",
  display: "swap",
  // 대체 폰트는 globals.css의 --font-hand에서 정합니다. 여기에 넣으면 "Mingijuk Rest"(보충 파일)보다
  // 시스템 폰트가 먼저 쓰여서 기본 파일에 없는 글자가 손글씨로 나오지 않습니다.
  fallback: [],
});
// 코드: JetBrains Mono (빌드할 때 받아서 사이트와 함께 배포됩니다)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "imdongyoung의 기록", template: "%s · imdongyoung의 기록" },
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategories();
  const total = getAllPosts().length;
  return (
    <html
      lang="ko"
      className={`${mingijuk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
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
        <main className="mx-auto w-full max-w-[848px] px-3 pt-6 sm:pt-7 pb-20 sm:px-8 lg:mr-auto lg:ml-[max(296px,calc(50%-424px))] lg:px-12 lg:pt-12">
          {children}
        </main>
      </body>
    </html>
  );
}
