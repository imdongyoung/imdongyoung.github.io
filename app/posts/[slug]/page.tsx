import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CodeCopy from "@/components/CodeCopy";
import RailLayout from "@/components/RailLayout";
import Toc from "@/components/Toc";
import { site } from "@/lib/site";
import { formatDate } from "@/components/PostList";
import { getAdjacent, getAllPosts, getPost, orPlaceholder, toCategorySlug } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder("slug", getAllPosts().map((p) => p.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };
  // 공유 미리보기: 글의 첫 이미지(없으면 프로필 사진)
  const image = post.thumbnail ?? site.author.avatar;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/posts/${post.slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
      url: `/posts/${post.slug}/`,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: post.thumbnail ? "summary_large_image" : "summary", title: post.title, description: post.description, images: [image] },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const { newer, older } = getAdjacent(slug);

  return (
    // 노트 한 장: 왼쪽 빨간 여백선, 본문은 괘선 위에. 넓은 화면에서는 오른쪽에 목차
    <RailLayout label="이 글의 목차" rail={post.toc.length > 0 ? <Toc items={post.toc} /> : undefined}>
    <article className="paper margin-line pt-8 pr-4 pb-8 pl-7 [--margin-x:16px] sm:pt-12 sm:pr-12 sm:pb-10 sm:pl-[76px] sm:[--margin-x:48px]">
      {/* 글 머리: 메타 → 큰 제목 → 설명 → 태그, 아래 구분선 */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-footnote text-muted tabular-nums">
          <Link href={`/categories/${post.categorySlug}`} className="tap-44 rounded-full bg-accent/10 px-2.5 py-0.5 font-semibold text-accent no-underline transition-colors duration-150 hover:bg-accent/20">
            {post.category}
          </Link>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h1 className="mt-3 text-title1 sm:text-large">{post.title}</h1>
        {post.description && <p className="mt-2 max-w-[40em] text-body text-ink-2">{post.description}</p>}
        {post.tags.length > 0 && (
          <div className="mt-1 -ml-2 flex flex-wrap gap-x-1 text-footnote">
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/tags/${toCategorySlug(t)}`}
                className="inline-flex min-h-11 items-center rounded-full px-2 text-muted no-underline transition-colors duration-150 hover:bg-paper-2 hover:text-accent"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
        <div aria-hidden="true" className="mt-8 h-px bg-line" />
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      <CodeCopy />

      <nav aria-label="이전·다음 글" className="mt-8 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
        {older ? (
          <Link href={`/posts/${older.slug}`} className="card lift group block px-5 py-4 no-underline">
            <span className="block text-footnote text-muted">← 이전 글</span>
            <span className="mt-1 block text-callout font-semibold text-ink group-hover:text-accent">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link href={`/posts/${newer.slug}`} className="card lift group block px-5 py-4 text-right no-underline">
            <span className="block text-footnote text-muted">다음 글 →</span>
            <span className="mt-1 block text-callout font-semibold text-ink group-hover:text-accent">{newer.title}</span>
          </Link>
        )}
      </nav>
    </article>
    </RailLayout>
  );
}
