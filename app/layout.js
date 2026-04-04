import { Toaster } from "@/components/ui/sonner";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "Price Tracker - Industrial Edition",
  description: "Track product prices with mechanical precision and instant alerts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased selection:bg-[var(--accent)] selection:text-white`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
