"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { ContactGlyph } from "./Icons";
import ThemeToggle from "./ThemeToggle";

type Category = { name: string; slug: string; count: number };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-1 px-3 text-[16px] leading-6 text-muted">{children}</h2>;
}

// 프로필: 노트 첫 장에 붙인 큰 사진 + 그 아래 이름
function Profile() {
  const { name, role, bio, avatar } = site.author;
  return (
    <div className="flex flex-col items-center px-3 text-center">
      <Link href="/" aria-label={`${name} 홈`} className="rounded-full">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar.startsWith("/") ? `${basePath}${avatar}` : avatar}
            alt={name}
            className="size-36 rounded-full border-4 border-paper object-cover shadow-[0_0_0_1px_var(--line-strong)]"
          />
        ) : (
          // 사진이 없을 때: 이름 첫 글자
          <span className="grid size-36 place-items-center rounded-full bg-(image:--avatar) text-[56px] text-white">
            {name.slice(0, 1)}
          </span>
        )}
      </Link>
      <p className="mt-4 text-[32px] leading-10 text-ink">{name}</p>
      <p className="mt-1 text-[18px] leading-7 text-muted">{role}</p>
      <p className="mt-3 text-[17px] leading-7 text-ink-2">{bio}</p>
    </div>
  );
}

// 사이드바 글씨는 모두 손글씨(밍기적체). 44px 높이 행, 선택된 항목만 둥근 사각형으로 채움 (화면에서 유일한 채움 강조색)
const rowClass = (active = false) =>
  `flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[20px] leading-7 no-underline transition-colors duration-150 ease-(--ease-ui) ${
    active ? "bg-accent text-on-accent" : "text-ink hover:bg-paper-2"
  }`;

function Categories({ categories, total }: { categories: Category[]; total: number }) {
  const pathname = (usePathname() ?? "/").replace(/\/$/, "") || "/";
  const items = [{ name: "전체 글", href: "/", count: total }].concat(
    categories.map((c) => ({ name: c.name, href: `/categories/${c.slug}`, count: c.count })),
  );
  return (
    <nav aria-label="카테고리">
      <SectionTitle>카테고리</SectionTitle>
      <ol className="grid gap-0.5">
        {items.map((it) => {
          const active = pathname === it.href || decodeURI(pathname) === it.href;
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={active ? "page" : undefined} className={rowClass(active)}>
                <span className="min-w-0 flex-1 truncate">{it.name}</span>
                <span className={`text-[17px] tabular-nums ${active ? "text-on-accent/80" : "text-muted"}`}>{it.count}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Contacts() {
  return (
    <div>
      <SectionTitle>연락처</SectionTitle>
      <ul className="grid gap-0.5">
        {site.contacts.map((c) => {
          const external = c.href.startsWith("http");
          return (
            <li key={c.label}>
              <a href={c.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={rowClass()}>
                <span className="text-accent">
                  <ContactGlyph name={c.icon} />
                </span>
                {c.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sidebar({ categories, total }: { categories: Category[]; total: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 페이지 이동 시 모바일 서랍 닫기
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* 모바일 상단 바 */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-1.5 backdrop-blur-xl lg:hidden">
        <Link href="/" className="font-hand text-[24px] leading-8 text-ink no-underline">
          {site.title}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="sidebar"
          aria-label="메뉴 열기"
          className="icon-btn -mr-2 text-accent"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        id="sidebar"
        className={`font-hand fixed inset-y-0 left-0 z-60 flex w-[min(300px,86vw)] flex-col overflow-y-auto overscroll-contain punched border-r border-line bg-paper pt-10 pr-10 pb-5 pl-3 transition-transform duration-300 ease-(--ease-ui) motion-reduce:transition-none lg:z-30 lg:w-[296px] lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0 shadow-[0_0_48px_rgb(0_0_0/.2)]" : "-translate-x-[105%]"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="메뉴 닫기"
          className="icon-btn absolute top-2 right-10 lg:hidden"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <Profile />
        <div className="mx-3 my-5 border-t border-line" />
        <Categories categories={categories} total={total} />
        <div className="mx-3 my-5 border-t border-line" />
        <Contacts />

        <div className="mt-auto flex items-center justify-between pt-8 pl-3">
          <span className="text-[16px] text-muted">© {new Date().getFullYear()} {site.author.name}</span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
