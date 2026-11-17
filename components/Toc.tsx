"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";
import { RailCard } from "./RailLayout";

// 글 목차: 지금 읽는 소제목을 강조하고, 누르면 그 위치로 이동합니다.
export default function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (headings.length === 0) return;
    // 화면 위쪽 30% 지점을 지난 마지막 소제목을 '지금 읽는 곳'으로 봅니다.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current = headings[0].id;
      for (const h of headings) if (h.getBoundingClientRect().top <= line) current = h.id;
      // 페이지 끝까지 내리면 마지막 소제목이 기준선에 닿지 못해도 마지막 소제목을 강조
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = headings[headings.length - 1].id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <RailCard title="이 글의 목차">
      <ol className="grid">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? "location" : undefined}
                className={`block rounded-[10px] py-2 pr-2 text-[18px] leading-6 no-underline transition-colors duration-150 ease-(--ease-ui) hover:bg-paper-2 ${
                  it.depth === 3 ? "pl-6" : "pl-2"
                } ${on ? "bg-accent/12 text-accent hover:bg-accent/16" : "text-ink-2"}`}
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ol>
    </RailCard>
  );
}
