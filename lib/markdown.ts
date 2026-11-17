import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options } from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import type { VFile } from "vfile";
import { rehypeImages } from "./images";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

// 목차: rehype-slug가 붙인 id로 h2·h3를 모읍니다 (# 링크가 붙기 전에 실행)
function rehypeToc() {
  return (tree: Root, file: VFile) => {
    const toc: TocItem[] = [];
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = node.properties.id;
      if (typeof id !== "string") return;
      toc.push({ id, text: toString(node).trim(), depth: node.tagName === "h2" ? 2 : 3 });
    });
    (file.data as Record<string, unknown>).toc = toc;
  };
}

const prettyCode: Options = {
  // 디자인처럼 코드 블록은 라이트/다크 모두 어두운 배경을 씁니다.
  theme: "one-dark-pro",
  keepBackground: false,
  defaultLang: { block: "plaintext", inline: "plaintext" },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeImages)
  .use(rehypeSlug)
  .use(rehypeToc)
  .use(rehypeAutolinkHeadings, {
    behavior: "append",
    properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
    content: { type: "text", value: "#" },
  })
  .use(rehypePrettyCode, prettyCode)
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(md: string) {
  const file = await processor.process(md);
  return { html: String(file), toc: ((file.data as Record<string, unknown>).toc as TocItem[] | undefined) ?? [] };
}
