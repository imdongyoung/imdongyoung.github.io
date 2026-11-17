import type { Root as HastRoot, Element } from "hast";
import type { Root as MdastRoot } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Dropbox 공유 링크(…/scl/fi/… 또는 …/s/…)는 기본이 미리보기 페이지(dl=0)라서 이미지로 안 보입니다.
// raw=1로 바꾸면 로그인하지 않은 방문자에게도 이미지 파일이 바로 보입니다.
function fixDropbox(src: string) {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (url.hostname === "www.dropbox.com" || url.hostname === "dropbox.com") {
    url.searchParams.delete("dl");
    url.searchParams.set("raw", "1");
    return url.toString();
  }
  return src;
}

// 이미지 주소 정리: Dropbox 공유 링크 변환 + "/images/a.png" → "/repo/images/a.png" (GitHub Pages 하위 경로)
export function withBase(src: string) {
  const fixed = fixDropbox(src);
  return fixed.startsWith("/") && !fixed.startsWith("//") ? `${basePath}${fixed}` : fixed;
}

// 본문에서 첫 번째 이미지 주소를 찾습니다. 마크다운 ![]()와 <img src="">를 모두 봅니다.
export function findFirstImage(markdown: string): string | null {
  const tree = unified().use(remarkParse).parse(markdown) as MdastRoot;
  let found: string | null = null;
  visit(tree, (node) => {
    if (found) return false;
    if (node.type === "image") found = node.url;
    else if (node.type === "html") {
      const m = node.value.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
      if (m) found = m[1];
    }
  });
  return found;
}

// rehype 플러그인: 본문 <img>에 basePath를 붙이고 지연 로딩을 켭니다.
// ![설명](주소 "캡션")처럼 title이 있으면 <figure>와 <figcaption>으로 감쌉니다.
export function rehypeImages() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "img") return;
      const src = node.properties.src;
      if (typeof src === "string") node.properties.src = withBase(src);
      node.properties.loading = "lazy";
      node.properties.decoding = "async";

      const title = node.properties.title;
      if (typeof title !== "string" || !parent || index === undefined) return;
      delete node.properties.title;
      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: { className: ["post-figure"] },
        children: [node, { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: title }] }],
      };
      // 이미지만 있는 문단이면 문단째로 바꿔서 <p> 안에 <figure>가 들어가지 않게 합니다.
      const onlyChild =
        parent.type === "element" &&
        parent.tagName === "p" &&
        parent.children.every((c) => c === node || (c.type === "text" && !c.value.trim()));
      if (onlyChild) {
        parent.tagName = "div";
        parent.properties = {};
        parent.children = [figure];
      } else {
        parent.children[index] = figure;
      }
    });
  };
}
