import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
// 한국어 문장에서 **굵게**가 깨지는 문제 해결: 닫는 ** 바로 앞이 ) ' " 같은 문장 부호이고
// 바로 뒤가 한글(예: **프록시(Proxy)**란)이면 표준 마크다운은 굵게로 인식하지 못합니다.
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
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

// 표를 <div class="table-scroll">로 감쌉니다. 넓은 표는 이 상자 안에서 옆으로 밀어서 보고,
// 표 자체는 상자 폭을 꽉 채웁니다. (표에 display:block을 주면 폭을 다 채우지 못해서 이렇게 분리)
function rehypeTableWrap() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return;
      if (parent.type === "element" && (parent.properties.className as string[] | undefined)?.includes("table-scroll")) return;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };
    });
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
  .use(remarkCjkFriendly)
  .use(remarkCjkFriendlyGfmStrikethrough)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeImages)
  .use(rehypeSlug)
  .use(rehypeToc)
  .use(rehypeTableWrap)
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
