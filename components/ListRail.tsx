import Link from "next/link";
import { getAllPosts, getArchive, getTags } from "@/lib/posts";
import { formatDate } from "./PostList";
import { RailCard } from "./RailLayout";

// 글 목록 오른쪽: 태그 모음, 월별 보관함, 최신 글 3개
export default function ListRail({ activeTag }: { activeTag?: string }) {
  const tags = getTags();
  const archive = getArchive();
  const latest = getAllPosts().slice(0, 3); // 날짜 최신순으로 이미 정렬되어 있음
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
      {latest.length > 0 && (
        <RailCard title="최신 글">
          <ol className="grid gap-0.5">
            {latest.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/posts/${p.slug}`}
                  // 높이 고정(제목 2줄 + 날짜): 제목 길이·이미지 유무와 상관없이 모든 항목이 같은 높이
                  className="group flex h-[84px] items-center gap-3 overflow-hidden rounded-[10px] px-2 no-underline transition-colors duration-150 ease-(--ease-ui) hover:bg-paper-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[18px] leading-6 text-ink group-hover:text-accent">{p.title}</span>
                    <time dateTime={p.date} className="mt-0.5 block text-[15px] leading-5 text-muted tabular-nums">
                      {formatDate(p.date)}
                    </time>
                  </span>
                  {/* 글에 이미지가 있으면 오른쪽에 작은 미리보기 (목록 카드와 같은 첫 이미지) */}
                  {p.thumbnail && (
                    <span className="relative size-14 flex-none overflow-hidden rounded-[8px] border border-line bg-paper-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumbnail} alt="" loading="lazy" decoding="async" className="zoom absolute inset-0 size-full object-cover" />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </RailCard>
      )}
    </>
  );
}
