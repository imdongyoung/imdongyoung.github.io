// 오른쪽 보조 영역(레일): 화면이 1440px 이상일 때만 본문 오른쪽에 붙고, 스크롤해도 따라옵니다.
// 본문 폭과 가운데 정렬은 그대로 두고 본문 오른쪽 바깥에 배치합니다.
export default function RailLayout({ rail, label, children }: { rail?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {rail && (
        <aside aria-label={label} className="font-hand absolute top-0 bottom-0 left-full ml-6 hidden w-60 min-[1440px]:block">
          <div className="sticky top-12 grid gap-4">{rail}</div>
        </aside>
      )}
    </div>
  );
}

export function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card px-4 pt-4 pb-3">
      <h2 className="mb-1 px-2 text-[16px] leading-6 text-muted">{title}</h2>
      {children}
    </section>
  );
}
