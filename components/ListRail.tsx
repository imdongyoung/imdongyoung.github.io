import Link from "next/link";
import { getArchive, getTags } from "@/lib/posts";
import { RailCard } from "./RailLayout";

// 글 목록 오른쪽: 태그 모음과 월별 보관함
export default function ListRail({ activeTag }: { activeTag?: string }) {
  const tags = getTags();
  const archive = getArchive();
  return (
    <>
      {tags.length > 0 && (
        <RailCard title="태그">
          <ul className="flex flex-wrap gap-1 px-1 pb-1">
            {tags.map((t) => {
              const on = t.slug === activeTag;
              return (
                <li key={t.slug}>
                  <Link
                    href={`/tags/${t.slug}`}
                    aria-current={on ? "page" : undefined}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[18px] no-underline transition-colors duration-150 ease-(--ease-ui) ${
                      on ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-paper-2"
                    }`}
                  >
                    #{t.name}
                    <span className={on ? "text-on-accent/80" : "text-muted"}>{t.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RailCard>
      )}
      {archive.length > 0 && (
        <RailCard title="보관함">
          <ul className="grid">
            {archive.map((a) => (
              <li key={a.ym} className="flex items-center justify-between px-2 py-1.5 text-[18px] leading-6 text-ink-2">
                <span>{a.label}</span>
                <span className="text-muted tabular-nums">{a.count}</span>
              </li>
            ))}
          </ul>
        </RailCard>
      )}
    </>
  );
}
