import Link from "next/link";
import { toCategorySlug, type PostMeta } from "@/lib/posts";

export function formatDate(d: string) {
  return d.replaceAll("-", ".");
}

// 글 목록 카드 (Apple HIG: 둥근 모서리 · 넉넉한 여백 · 크기와 색으로 만든 위계)
// 카드 글씨는 모두 손글씨(밍기적체). 손글씨는 작아 보여서 한 단계씩 크게 씁니다.
// 높이는 모든 카드가 같고, 내용은 위에서부터 메타 → 제목 → 설명(2줄) 순서, 태그는 아래에 붙습니다.
export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return <p className="card p-10 text-center text-muted">아직 글이 없습니다.</p>;
  }
  return (
    // grid-cols-1(= minmax(0, 1fr)) + min-w-0: 긴 제목이 한 줄 말줄임이어도 칸이 목록 폭보다 넓어지지 않게
    <ul className="grid grid-cols-1 gap-4 sm:gap-5">
      {posts.map((p) => (
        <li key={p.slug} className="min-w-0">
          <article className="card lift group font-hand relative flex h-[228px] overflow-hidden">
            <div className="flex min-w-0 flex-1 flex-col p-5 sm:px-7 sm:py-6">
              <div className="flex items-center gap-2 overflow-hidden text-[16px] leading-6 whitespace-nowrap text-muted tabular-nums">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-accent">{p.category}</span>
                <time dateTime={p.date}>{formatDate(p.date)}</time>
              </div>
              <h2 className="mt-3 truncate text-[27px] leading-8">
                <Link href={`/posts/${p.slug}`} className="text-ink no-underline after:absolute after:inset-0 group-hover:text-accent">
                  {p.title}
                </Link>
              </h2>
              {p.description && <p className="mt-1.5 line-clamp-2 text-[18px] leading-[26px] text-ink-2">{p.description}</p>}
              {p.tags.length > 0 && (
                <div className="mt-auto flex gap-3 overflow-hidden pt-3 text-[16px] leading-6 whitespace-nowrap text-muted">
                  {p.tags.map((t) => (
                    // 태그는 카드 전체 링크 위에 올라와 따로 눌립니다
                    <Link key={t} href={`/tags/${toCategorySlug(t)}`} className="relative z-10 flex-none no-underline hover:text-accent">
                      #{t}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {p.thumbnail && (
              // 카드 오른쪽 끝까지, 카드 높이만큼 꽉 채우는 미리보기
              <div className="relative w-[30%] max-w-[120px] flex-none overflow-hidden bg-paper-2 sm:w-[34%] sm:max-w-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt="" loading="lazy" decoding="async" className="zoom absolute inset-0 size-full object-cover" />
              </div>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
