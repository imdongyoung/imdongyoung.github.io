import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-12 text-center">
      <div className="text-footnote font-semibold text-muted">404</div>
      <h1 className="mt-2 text-title1">페이지를 찾을 수 없습니다</h1>
      <Link href="/" className="link-draw mt-4 inline-block">← 홈으로</Link>
    </div>
  );
}
