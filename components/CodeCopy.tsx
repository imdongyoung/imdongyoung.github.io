"use client";

import { useEffect } from "react";

// 본문 코드 블록마다 '복사' 버튼을 붙입니다.
export default function CodeCopy() {
  useEffect(() => {
    const figures = document.querySelectorAll<HTMLElement>("figure[data-rehype-pretty-code-figure]");
    const buttons: HTMLButtonElement[] = [];
    figures.forEach((fig) => {
      const pre = fig.querySelector("pre");
      if (!pre || fig.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "복사";
      const title = fig.querySelector("[data-rehype-pretty-code-title]");
      if (title) btn.style.top = "4px";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText);
          btn.textContent = "복사됨";
        } catch {
          btn.textContent = "실패";
        }
        setTimeout(() => (btn.textContent = "복사"), 1500);
      });
      fig.appendChild(btn);
      buttons.push(btn);
    });
    return () => buttons.forEach((b) => b.remove());
  }, []);
  return null;
}
