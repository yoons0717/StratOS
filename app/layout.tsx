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
  title: "StratOS — One action. Execute today.",
  description: "AI execution OS for solo creators. Input your situation, get one action you can do right now.",
  openGraph: {
    title: "StratOS — One action. Execute today.",
    description: "AI execution OS for solo creators. Input your situation, get one action you can do right now.",
    url: "https://stratos-os.vercel.app",
    siteName: "StratOS",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StratOS — One action. Execute today.",
    description: "AI execution OS for solo creators.",
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
