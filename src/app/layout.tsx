import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gongju-event-app.vercel.app"),
  title: "공주를 플레이하자!",
  description: "공주 여행 미션에 참여하고 퀴즈와 룰렛 이벤트까지 즐겨보세요.",
  openGraph: {
    title: "공주를 플레이하자!",
    description: "공주 여행 미션에 참여하고 퀴즈와 룰렛 이벤트까지 즐겨보세요.",
    url: "https://gongju-event-app.vercel.app",
    siteName: "공주팝업행사 웹앱",
    images: [
      {
        url: "/images/kakao-og.png",
        width: 1200,
        height: 630,
        alt: "공주를 플레이하자",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
