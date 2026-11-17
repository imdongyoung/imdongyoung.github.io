// 페이지 머리: 큰 제목 + "글 n개" + 설명. 모두 손글씨(밍기적체)
// 손글씨는 같은 크기에서 작아 보여서 한 단계씩 크게 씁니다.
export default function PageHeader({ kicker, title, lede }: { kicker: string; title: React.ReactNode; lede?: string }) {
  return (
    <header className="mb-8 sm:mb-10">
      <div className="font-hand text-[18px] leading-6 text-muted">{kicker}</div>
      <h1 className="mt-1 text-title1 sm:text-large">{title}</h1>
      {lede && <p className="font-hand mt-2 max-w-[62ch] text-[22px] leading-8 text-ink-2">{lede}</p>}
    </header>
  );
}
