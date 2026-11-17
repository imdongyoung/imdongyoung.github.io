import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { findFirstImage, withBase } from "./images";
import { renderMarkdown, type TocItem } from "./markdown";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD (화면에 보이는 날짜)
  dateTime: string; // YYYY-MM-DDTHH:mm (정렬용. 시간을 안 적으면 00:00)
  order: number; // 같은 날짜·시간일 때 우선순위. 클수록 위 (기본 0)
  category: string;
  categorySlug: string;
  description: string;
  tags: string[];
  thumbnail: string | null; // front matter thumbnail 또는 본문 첫 이미지 (basePath 포함)
};

export type Post = PostMeta & { html: string; toc: TocItem[] };

// 카테고리·태그 이름 → URL 조각.
// 영문·숫자·한글만 남기고 나머지(/, 공백, 점, 괄호 등)는 하이픈으로 바꿉니다.
// 예: "CI/CD" → "ci-cd", "Spring Boot" → "spring-boot", "Node.js" → "node-js"
// ("/"가 남으면 주소가 /categories/ci/cd/ 처럼 폴더로 나뉘어 404가 납니다)
export function toCategorySlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "") || "etc";
}

function readFile(slug: string) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8");
  return matter(raw);
}

function thumbnailOf(data: Record<string, unknown>, content: string) {
  if (data.thumbnail === false) return null; // thumbnail: false 로 끌 수 있음
  const src = typeof data.thumbnail === "string" ? data.thumbnail : findFirstImage(content);
  return src ? withBase(src) : null;
}

// front matter의 date → { 날짜, 정렬용 날짜·시간 }
// "2026-11-17", "2026-11-17 14:30", "2026-11-17T14:30:00" 모두 됩니다. (시간은 적은 그대로 비교)
function parseDate(raw: unknown) {
  // YAML이 날짜로 읽은 값(Date)은 적은 시각 그대로 UTC로 들어옵니다
  const text = raw instanceof Date ? raw.toISOString() : String(raw ?? "").trim();
  const m = text.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!m) return { date: text, dateTime: text };
  const [, day, hh = "0", mm = "00"] = m;
  return { date: day, dateTime: `${day}T${hh.padStart(2, "0")}:${mm}` };
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): PostMeta {
  const category = String(data.category ?? "미분류");
  const { date, dateTime } = parseDate(data.date);
  const order = Number(data.order ?? 0);
  return {
    slug,
    title: String(data.title ?? slug),
    date,
    dateTime,
    order: Number.isFinite(order) ? order : 0,
    category,
    categorySlug: toCategorySlug(category),
    description: String(data.description ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    thumbnail: thumbnailOf(data, content),
  };
}

function slugs() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

// 글 순서: ① 날짜·시간이 늦은 글 → ② order가 큰 글 → ③ 제목 가나다순
// (목록, 최신 글, 이전/다음 글이 모두 이 순서를 따릅니다)
function comparePosts(a: PostMeta, b: PostMeta) {
  if (a.dateTime !== b.dateTime) return a.dateTime < b.dateTime ? 1 : -1;
  if (a.order !== b.order) return b.order - a.order;
  return a.title.localeCompare(b.title, "ko");
}

export function getAllPosts(): PostMeta[] {
  return slugs()
    .map((slug) => {
      const { data, content } = readFile(slug);
      if (data.draft) return null;
      return toMeta(slug, data, content);
    })
    .filter((p): p is PostMeta => p !== null)
    .sort(comparePosts);
}

// 정적 내보내기(output: export)는 동적 경로마다 페이지가 최소 하나 필요합니다.
// 글·카테고리·태그가 하나도 없을 때는 이 자리표시 값으로 404 페이지 하나만 만듭니다.
export const EMPTY_PARAM = "_";
export function orPlaceholder<K extends string>(key: K, values: string[]) {
  return (values.length > 0 ? values : [EMPTY_PARAM]).map((v) => ({ [key]: v }) as Record<K, string>);
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!slugs().includes(slug)) return null;
  const { data, content } = readFile(slug);
  return { ...toMeta(slug, data, content), ...(await renderMarkdown(content)) };
}

export function getCategories() {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of getAllPosts()) {
    const c = map.get(p.categorySlug) ?? { name: p.category, slug: p.categorySlug, count: 0 };
    c.count++;
    map.set(p.categorySlug, c);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// 태그별 글 수 (많은 순)
export function getTags() {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of getAllPosts()) {
    for (const t of p.tags) {
      const slug = toCategorySlug(t);
      const e = map.get(slug) ?? { name: t, slug, count: 0 };
      e.count++;
      map.set(slug, e);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// 월별 글 수 (최신 달부터)
export function getArchive() {
  const map = new Map<string, number>();
  for (const p of getAllPosts()) {
    const ym = p.date.slice(0, 7);
    if (ym) map.set(ym, (map.get(ym) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([ym, count]) => ({ ym, label: `${ym.slice(0, 4)}년 ${Number(ym.slice(5, 7))}월`, count }));
}

export function getAdjacent(slug: string) {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  return { newer: all[i - 1] ?? null, older: all[i + 1] ?? null };
}
