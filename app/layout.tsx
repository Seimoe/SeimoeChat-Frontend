import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import {cookies} from 'next/headers';
import useUserStore from '@/stores/userStore';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seimoe Chat",
  description: "与希茉聊天",
};

async function initializeAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (token) {
    useUserStore.getState().login({token: token.value});
  }
}

export default async function RootLayout({
  children,
                                         }: {
  children: React.ReactNode
}) {
  await initializeAuth();

  return (
    <html lang="zh">
    <head>
      <meta name="apple-mobile-web-app-title" content="希茉聊天"/>
    </head>
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
      {children}
      </body>
    </html>
  );
}
