import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function formatDate(d: string) {
  return d.replaceAll("-", ".");
}

// 글 목록 카드 (Apple HIG: 둥근 모서리 · 넉넉한 여백 · 크기와 색으로 만든 위계)
// 카드 글씨는 모두 손글씨(밍기적체). 손글씨는 작아 보여서 한 단계씩 크게 씁니다.
// 높이는 모든 카드가 같고(모바일 200px · 넓은 화면 248px), 내용은 위에서부터 메타 → 제목 → 설명(2줄) 순서, 태그는 아래에 붙습니다.
export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return <p className="card p-10 text-center text-muted">아직 글이 없습니다.</p>;
  }
  return (
    // grid-cols-1(= minmax(0, 1fr)) + min-w-0: 긴 제목이 한 줄 말줄임이어도 칸이 목록 폭보다 넓어지지 않게
    <ul className="grid grid-cols-1 gap-4 sm:gap-5">
      {posts.map((p) => (
        <li key={p.slug} className="min-w-0">
          <article className="card lift group font-hand relative flex h-[200px] overflow-hidden sm:h-[248px]">
            <div className="flex min-w-0 flex-1 flex-col p-4 sm:px-7 sm:py-6">
              <div className="flex items-center gap-2 overflow-hidden text-[14px] leading-5 whitespace-nowrap text-muted tabular-nums sm:text-[16px] sm:leading-6">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-accent">{p.category}</span>
                <time dateTime={p.date}>{formatDate(p.date)}</time>
              </div>
              <h2 className="mt-2 text-[21px] leading-7 sm:mt-3 sm:text-[27px] sm:leading-8">
                {/* 제목은 2줄까지. 링크를 블록으로 두어 잘린 글자가 미리보기 이미지 아래로 넘어가지 않게 */}
                <Link href={`/posts/${p.slug}`} className="line-clamp-2 text-ink no-underline after:absolute after:inset-0 group-hover:text-accent">
                  {p.title}
                </Link>
              </h2>
              {p.description && <p className="mt-1 line-clamp-2 text-[15px] leading-[22px] text-ink-2 sm:mt-1.5 sm:text-[18px] sm:leading-[26px]">{p.description}</p>}
              {p.tags.length > 0 && (
                <div className="mt-auto flex gap-3 overflow-hidden pt-2 text-[14px] leading-5 whitespace-nowrap text-muted sm:pt-3 sm:text-[16px] sm:leading-6">
                  {/* 카드 전체가 하나의 링크라 태그는 글자로만 표시 (태그 이동은 오른쪽 태그 목록·글 상단에서) */}
                  {p.tags.map((t) => (
                    <span key={t} className="flex-none">#{t}</span>
                  ))}
                </div>
              )}
            </div>
            {p.thumbnail && (
              // 카드 오른쪽 끝까지, 카드 높이만큼 꽉 채우는 미리보기
              <div className="relative w-[32%] max-w-[128px] flex-none overflow-hidden bg-paper-2 sm:w-[34%] sm:max-w-[280px]">
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
