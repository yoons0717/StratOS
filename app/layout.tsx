import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StratOS — 오늘 하나, 실행하세요",
  description: "솔로 크리에이터를 위한 AI 실행 OS. 막힌 상황을 입력하면 지금 당장 할 수 있는 액션을 돌려줍니다.",
  openGraph: {
    title: "StratOS — 오늘 하나, 실행하세요",
    description: "솔로 크리에이터를 위한 AI 실행 OS. 막힌 상황을 입력하면 지금 당장 할 수 있는 액션을 돌려줍니다.",
    url: "https://stratos-os.vercel.app",
    siteName: "StratOS",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StratOS — 오늘 하나, 실행하세요",
    description: "솔로 크리에이터를 위한 AI 실행 OS.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
