import ListRail from "@/components/ListRail";
import PageHeader from "@/components/PageHeader";
import PostList from "@/components/PostList";
import RailLayout from "@/components/RailLayout";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts();
  return (
    <RailLayout label="태그와 보관함" rail={<ListRail />}>
      <PageHeader kicker={`글 ${posts.length}개`} title={site.title} lede={site.description} />
      <PostList posts={posts} />
    </RailLayout>
  );
}
