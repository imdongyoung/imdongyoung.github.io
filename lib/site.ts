import type { IconName } from "@/components/Icons";

// 블로그 전체 설정: 여기 값만 바꾸면 사이드바 프로필·연락처가 바뀝니다.
// 연락처 icon에는 github · mail · linkedin · people 중 하나를 씁니다.
export const site = {
  // 배포 주소. 공유 미리보기(og:image 등)의 절대 주소를 만들 때 씁니다.
  url: "https://imdongyoung.github.io",
  title: "Dev Notes",
  description: "기록을 습관처럼 하자",
  author: {
    name: "imdongyoung",
    role: "Backend Developer",
    bio: "끊임없이 학습하는 개발자입니다.",
    // 외부 URL 또는 public/ 아래 경로("/images/me.png"). 비워 두면 이니셜 아바타가 표시됩니다.
    avatar: "https://github.com/imdongyoung.png",
  },
  contacts: [
    { label: "GitHub", href: "https://github.com/imdongyoung", icon: "github" },
    { label: "Email", href: "mailto:imdong207@gmail.com", icon: "mail" },
    {
      label: "Resume",
      href: "https://app.notion.com/p/41aeba235e5080dd8347e2789f76c110?source=copy_link",
      icon: "people",
    },
  ] satisfies { label: string; href: string; icon: IconName }[],
};

export type ContactIcon = IconName;
