import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "浙江省人民医院 · 神经内科 头晕头痛专病门诊预诊问卷",
  description: "浙江省人民医院神经内科头晕头痛专病门诊预诊评估",
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: "浙江省人民医院 · 神经内科 头晕头痛专病门诊预诊问卷",
    description: "用约 3 分钟完成门诊前症状评估",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "浙江省人民医院神经内科 · 头晕头痛专病门诊预诊问卷",
    description: "用约 3 分钟完成门诊前症状评估",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
