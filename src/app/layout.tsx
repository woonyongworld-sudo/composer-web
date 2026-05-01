import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "작곡 도우미",
  description: "코드 진행에서 시작하는 쉬운 작곡 — 4명의 음악 전문위원이 도와드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
