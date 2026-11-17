import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListRail from "@/components/ListRail";
import PageHeader from "@/components/PageHeader";
import PostList from "@/components/PostList";
import RailLayout from "@/components/RailLayout";
import { getAllPosts, getCategories, orPlaceholder } from "@/lib/posts";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder("category", getCategories().map((c) => c.slug));
}

function find(param: string) {
  const slug = decodeURIComponent(param);
  return getCategories().find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = find((await params).category);
  return { title: c?.name ?? "카테고리" };
}

export default async function CategoryPage({ params }: Props) {
  const c = find((await params).category);
  if (!c) notFound();
  const posts = getAllPosts().filter((p) => p.categorySlug === c.slug);
  return (
    <RailLayout label="태그와 보관함" rail={<ListRail />}>
      <PageHeader kicker={`카테고리 · 글 ${c.count}개`} title={c.name} />
      <PostList posts={posts} />
    </RailLayout>
  );
}
