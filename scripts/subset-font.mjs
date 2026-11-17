// 밍기적체를 블로그에서 실제로 쓰는 글자만 남겨 작게 만듭니다.
// npm run build 직전에 자동으로 실행되고(prebuild), npm run dev 중에는
// 글이 바뀔 때마다 다시 만들어집니다(scripts/dev.mjs).
//
// 원본: fonts-src/Mingijuk-full.woff2 (한글 11,172자 전체)
// 결과 (모두 빌드할 때 새로 만들어지며 git에는 올리지 않습니다)
//   app/fonts/mingijuk/Mingijuk.woff2       기본: 글·화면에 쓰인 글자 + 영문·숫자·기호 (미리 불러옴)
//   app/fonts/mingijuk/Mingijuk-rest.woff2  보충: 나머지 한글 (원본에 그려진 글자만)
//   app/fonts/mingijuk/rest.css             보충 파일의 @font-face. unicode-range 덕분에
//                                           기본 파일에 없는 글자가 페이지에 있을 때만 브라우저가 받습니다.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import subsetFont from "subset-font";

const root = process.cwd();
const SRC = path.join(root, "fonts-src", "Mingijuk-full.woff2");
// 원본 폰트는 한글 11,172자 모두에 자리는 있지만 실제로 그려진 글자는 약 2,479자뿐입니다.
// 빈 글자를 넣으면 화면에 아무것도 안 보이므로, 그려진 글자만 씁니다.
// 빠진 글자(예: 궯)는 다음 폰트(Pretendard)로 보입니다.
const DRAWN = new Set();
for (const [a, b] of JSON.parse(fs.readFileSync(path.join(root, "fonts-src", "Mingijuk-drawn.json"), "utf8")).ranges)
  for (let c = a; c <= b; c++) DRAWN.add(c);
const OUT_DIR = path.join(root, "app", "fonts", "mingijuk");
const OUT = path.join(OUT_DIR, "Mingijuk.woff2");
const REST = path.join(OUT_DIR, "Mingijuk-rest.woff2");
const REST_CSS = path.join(OUT_DIR, "rest.css");

// 보충 파일이 맡을 범위: 한글 음절 전체, 한글 자모, 호환 자모
const REST_SCOPE = [
  [0xac00, 0xd7a3],
  [0x1100, 0x11ff],
  [0x3131, 0x318e],
];

// 코드포인트 목록 → CSS unicode-range 문자열 (연속 구간은 묶음)
function toUnicodeRange(codes) {
  const sorted = [...codes].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    const hex = (n) => n.toString(16).toUpperCase();
    parts.push(i === j ? `U+${hex(sorted[i])}` : `U+${hex(sorted[i])}-${hex(sorted[j])}`);
    i = j + 1;
  }
  return parts.join(", ");
}

// 글자를 모을 파일: 글 원본, 화면 코드, 블로그 설정
const SCAN = [
  { dir: "content/posts", ext: [".md", ".mdx"] },
  { dir: "app", ext: [".tsx", ".ts"] },
  { dir: "components", ext: [".tsx", ".ts"] },
  { dir: "lib", ext: [".ts", ".tsx"] },
];

function walk(dir, exts, out = []) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, exts, out);
    else if (exts.includes(path.extname(entry.name))) out.push(path.join(root, rel));
  }
  return out;
}

let lastText = "";

export const WATCH_DIRS = SCAN.map((s) => s.dir);

export async function buildSubset() {
  const chars = new Set();
  for (const { dir, ext } of SCAN) {
    for (const file of walk(dir, ext)) for (const ch of fs.readFileSync(file, "utf8")) chars.add(ch);
  }

  // 항상 넣어 둘 글자: 영문·숫자·기본 기호, 라틴-1, 한글 자모, 자주 쓰는 문장 부호
  const ranges = [
    [0x20, 0x7e],
    [0xa0, 0xff],
    [0x3131, 0x318e],
    [0x2010, 0x2027],
    [0x2190, 0x2199],
  ];
  for (const [a, b] of ranges) for (let c = a; c <= b; c++) chars.add(String.fromCodePoint(c));
  for (const ch of "·•…“”‘’「」『』《》〈〉①②③④⑤○●■□★☆✓✔") chars.add(ch);

  for (const ch of [...chars]) if (!DRAWN.has(ch.codePointAt(0))) chars.delete(ch); // 그려진 글자만
  const text = [...chars].sort().join(""); // 정렬해서 같은 글자 구성이면 같은 문자열
  // 글자 구성이 그대로면 다시 만들지 않습니다 (개발 중 저장할 때마다 실행되므로)
  if (text === lastText && fs.existsSync(OUT)) return;
  lastText = text;
  const source = fs.readFileSync(SRC);
  const subset = await subsetFont(source, text, { targetFormat: "woff2" });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, subset);

  // 보충 파일: 기본 파일에 없는 한글 중 그려진 글자 전부
  const restCodes = [];
  for (const [a, b] of REST_SCOPE)
    for (let c = a; c <= b; c++) if (DRAWN.has(c) && !chars.has(String.fromCodePoint(c))) restCodes.push(c);
  const restText = restCodes.map((c) => String.fromCodePoint(c)).join("");
  const rest = await subsetFont(source, restText, { targetFormat: "woff2" });
  fs.writeFileSync(REST, rest);
  fs.writeFileSync(
    REST_CSS,
    `/* scripts/subset-font.mjs가 만든 파일입니다. 직접 고치지 마세요. */
@font-face {
  font-family: "Mingijuk Rest";
  src: url("./Mingijuk-rest.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: ${toUnicodeRange(restCodes)};
}
`,
  );

  const hangul = [...chars].filter((c) => c >= "가" && c <= "힣").length;
  console.log(
    `[subset-font] 기본 ${(subset.length / 1024).toFixed(0)}KB (한글 ${hangul}자) · 보충 ${(rest.length / 1024).toFixed(0)}KB (나머지 한글 ${restCodes.filter((c) => c >= 0xac00).length}자, 필요할 때만)`,
  );
}

// 직접 실행했을 때 (node scripts/subset-font.mjs)
if (import.meta.url === pathToFileURL(process.argv[1]).href) await buildSubset();
