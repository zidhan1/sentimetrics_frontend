import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "./providers/BrandProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Sentimetrics",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen relative">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 min-h-screen">
            <BrandProvider>
              {children}
            </BrandProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
