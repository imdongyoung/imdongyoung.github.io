// 페이지 머리: HIG의 큰 제목(Large Title) — 손글씨 제목 + 설명
export default function PageHeader({ kicker, title, lede }: { kicker: string; title: React.ReactNode; lede?: string }) {
  return (
    <header className="mb-8 sm:mb-10">
      <div className="text-footnote font-semibold text-muted">{kicker}</div>
      <h1 className="mt-1 text-title1 sm:text-large">{title}</h1>
      {lede && <p className="mt-2 max-w-[62ch] text-body text-ink-2">{lede}</p>}
    </header>
  );
}
