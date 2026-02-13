import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Using Inter for body, Outfit for headings
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "SchoolBreak - Card Management",
  description: "Gestione tessere e promozioni",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={cn(inter.variable, outfit.variable, "antialiased bg-background text-foreground min-h-screen flex flex-col")}>
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
