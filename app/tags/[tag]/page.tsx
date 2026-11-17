import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListRail from "@/components/ListRail";
import PageHeader from "@/components/PageHeader";
import PostList from "@/components/PostList";
import RailLayout from "@/components/RailLayout";
import { getAllPosts, getTags, orPlaceholder, toCategorySlug } from "@/lib/posts";

type Props = { params: Promise<{ tag: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder("tag", getTags().map((t) => t.slug));
}

function find(param: string) {
  const slug = decodeURIComponent(param);
  return getTags().find((t) => t.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = find((await params).tag);
  return { title: t ? `#${t.name}` : "태그" };
}

export default async function TagPage({ params }: Props) {
  const t = find((await params).tag);
  if (!t) notFound();
  const posts = getAllPosts().filter((p) => p.tags.some((x) => toCategorySlug(x) === t.slug));
  return (
    <RailLayout label="태그와 보관함" rail={<ListRail activeTag={t.slug} />}>
      <PageHeader kicker={`태그 · 글 ${t.count}개`} title={`#${t.name}`} />
      <PostList posts={posts} />
    </RailLayout>
  );
}
