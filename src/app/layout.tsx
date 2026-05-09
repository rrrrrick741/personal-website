import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreathingBackground from "@/components/BreathingBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rick — 个人主页",
  description: "专注追踪 · 每日待办 · 学习记录 · 新闻速览",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col relative">
        <BreathingBackground />
        <Navbar />
        <main className="flex-1 relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
