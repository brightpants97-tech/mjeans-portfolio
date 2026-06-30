import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Myeongjin — Video Editor",
  description: "유튜브 콘텐츠를 편집합니다. 장지수, 장지수2 채널과 함께 작업했습니다.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.20/index.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.20/700.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.20/800.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
