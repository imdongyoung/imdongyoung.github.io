"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

const GISCUS_ORIGIN = "https://giscus.app";

const currentTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

// 글 아래 댓글 창(giscus). 댓글은 GitHub Discussions에 저장됩니다.
export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const { repo, repoId, category, categoryId } = site.giscus;

  useEffect(() => {
    const el = ref.current;
    if (!el || !categoryId) return;

    const s = document.createElement("script");
    s.src = `${GISCUS_ORIGIN}/client.js`;
    const attrs: Record<string, string> = {
      "data-repo": repo,
      "data-repo-id": repoId,
      "data-category": category,
      "data-category-id": categoryId,
      "data-mapping": "pathname",
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": currentTheme(),
      "data-lang": "ko",
      "data-loading": "lazy",
    };
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    s.crossOrigin = "anonymous";
    s.async = true;
    el.appendChild(s);

    // 블로그 테마 토글(data-theme)이 바뀌면 댓글 창 테마도 맞춥니다
    const obs = new MutationObserver(() => {
      el.querySelector<HTMLIFrameElement>("iframe.giscus-frame")?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: currentTheme() } } },
        GISCUS_ORIGIN,
      );
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      obs.disconnect();
      el.replaceChildren();
    };
  }, [repo, repoId, category, categoryId]);

  if (!categoryId) return null;

  return (
    <section aria-label="댓글" className="mt-8 border-t border-line pt-8">
      <div ref={ref} className="giscus" />
    </section>
  );
}
