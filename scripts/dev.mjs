// npm run dev: 폰트를 한 번 만들고 next dev를 띄운 뒤,
// 글이나 화면 코드가 바뀌면 손글씨 폰트를 다시 만듭니다 (새 글자가 생겼을 때만).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildSubset, WATCH_DIRS } from "./subset-font.mjs";

await buildSubset();

const next = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { stdio: "inherit" });
next.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => next.kill(sig));

let timer;
let running = Promise.resolve();
const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    running = running.then(() => buildSubset()).catch((e) => console.error("[subset-font]", e.message));
  }, 300);
};

for (const dir of WATCH_DIRS) {
  const abs = path.join(process.cwd(), dir);
  if (!fs.existsSync(abs)) continue;
  fs.watch(abs, { recursive: true }, (_event, file) => {
    // 폰트 파일 자체가 바뀐 것은 무시 (무한 반복 방지)
    if (file && !String(file).includes("fonts")) schedule();
  });
}
