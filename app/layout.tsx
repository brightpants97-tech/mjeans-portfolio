import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mjeans.co.kr"),
  title: "Myeongjin — Video Editor",
  description: "유튜브 콘텐츠를 편집합니다. 장지수, 장지수2 채널과 함께 작업했습니다.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Myeongjin — Video Editor",
    description: "유튜브 콘텐츠를 편집합니다. 장지수, 장지수2 채널과 함께 작업했습니다.",
    url: "https://mjeans.co.kr",
    siteName: "Myeongjin Portfolio",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Myeongjin — Video Editor",
    description: "유튜브 콘텐츠를 편집합니다. 장지수, 장지수2 채널과 함께 작업했습니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
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
