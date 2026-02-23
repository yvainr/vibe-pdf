import type { Metadata } from "next";
import { Ballet } from "next/font/google";
import "./globals.css";

const ballet = Ballet({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ballet",
});

export const metadata: Metadata = {
  title: "Vibe PDF",
  description: "A minimalistic, AI-native PDF reader for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ballet.variable}>{children}</body>
    </html>
  );
}
