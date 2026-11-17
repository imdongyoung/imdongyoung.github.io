// 블로그 전체 설정: 여기 값만 바꾸면 사이드바 프로필·연락처가 바뀝니다.
export const site = {
  title: "Dev Notes",
  description: "공부한 내용과 개발 기록을 정리하는 블로그",
  author: {
    name: "imdongyoung",
    role: "Backend Developer",
    bio: "Java · Spring으로 서버를 만들고, 배운 것을 글로 정리합니다.",
    // 외부 URL 또는 public/ 아래 경로("/images/me.png"). 비워 두면 이니셜 아바타가 표시됩니다.
    avatar: "https://github.com/imdongyoung.png",
  },
  contacts: [
    { label: "GitHub", href: "https://github.com/your-id", icon: "github" },
    { label: "Email", href: "mailto:you@example.com", icon: "mail" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-id", icon: "linkedin" },
  ] as const,
};

export type ContactIcon = (typeof site.contacts)[number]["icon"];
