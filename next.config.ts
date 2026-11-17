import type { NextConfig } from "next";

// GitHub Pages 프로젝트 저장소(username.github.io/repo)라면 basePath가 "/repo"여야 합니다.
// GitHub Actions에서 NEXT_PUBLIC_BASE_PATH를 자동으로 넣어 줍니다. 로컬에서는 비워 둡니다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
