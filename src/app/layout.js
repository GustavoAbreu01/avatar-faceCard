import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { GradientBackground } from "@/components/animate-ui/backgrounds/gradient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Avatar - FaceCard",
  description: "Gerador de avatares ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GradientBackground className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-(--color_1) via-(--color_2) to- bg-[length:400%_400%]" />
        <Header />
        {children}
      </body>
    </html>
  );
}
