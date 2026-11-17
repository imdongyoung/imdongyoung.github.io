// 빌드 전에 글의 이미지 주소를 검사합니다 (npm run build의 prebuild에서 실행).
// Dropbox 미리보기 주소(previews.dropbox.com)는 로그인한 본인 브라우저에서만 열리는 임시 주소라
// 다른 사람(모바일 포함)에게는 이미지가 보이지 않습니다. 빌드를 막지는 않고 경고만 합니다.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "posts");
const found = [];
for (const name of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
  if (!/\.mdx?$/.test(name)) continue;
  const text = fs.readFileSync(path.join(dir, name), "utf8");
  const count = (text.match(/previews\.dropbox\.com/g) ?? []).length;
  if (count) found.push(`  - content/posts/${name} (${count}개)`);
}

if (found.length) {
  console.warn(
    [
      "",
      "[이미지 경고] Dropbox 미리보기 주소(previews.dropbox.com)가 있습니다.",
      "  이 주소는 Dropbox에 로그인한 본인만 볼 수 있어, 방문자에게는 이미지가 보이지 않습니다.",
      "  Dropbox에서 파일의 '링크 복사'로 받은 공유 링크(www.dropbox.com/scl/fi/...)로 바꾸거나,",
      "  이미지를 public/images/ 에 넣고 /images/... 로 적어 주세요.",
      ...found,
      "",
    ].join("\n"),
  );
}
