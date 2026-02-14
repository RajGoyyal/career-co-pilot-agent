import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Toaster } from "@/components/ui/sonner";
import { CareerProvider } from "@/lib/career-context";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Navigator - Your AI Career Co-Pilot",
  description: "An agentic AI system that actively manages your professional growth with personalized skill gap analysis and adaptive learning roadmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CareerProvider>
          {children}
        </CareerProvider>
        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
