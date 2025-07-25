// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Kanit } from 'next/font/google';

import NextAuthSessionProvider from "./providers/SessionProvider"; // path ตามจริง

const kanit = Kanit({
  subsets: ['thai', 'latin'], // รองรับภาษาไทย
  weight: ['400', '500', '700'], // เลือกน้ำหนักที่ต้องใช้
  variable: '--font-kanit', // สำหรับใช้กับ Tailwind (optional)
});



// const geistSans = Geist({
//   variable: "--font-kanit",
//   subsets: ['thai', 'latin'],
// });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={kanit.className}>
      <body
       
      >
        <NextAuthSessionProvider>
          <main className="min-h-screen flex flex-col m-auto" style={{ maxWidth: '600px'}}>
            <div className="flex-1 md:p-8">{children}</div>
          </main>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
