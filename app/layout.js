import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getServerSession } from "next-auth";
import SessionProvider from "@/lib/SessionProvider";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KNUST, FECE Auto Timetable Portal",
  description: "KNUST, Faculty of Electrical and Computer Engineering Automated Timetable Portal",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
        <Footer />
      </body>
    </html>
  );
}
