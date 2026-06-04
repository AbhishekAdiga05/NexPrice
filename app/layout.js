import { Toaster } from "@/components/ui/sonner";
import { Inter, JetBrains_Mono } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
import NavBar from "@/components/NavBar";
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
  title: "NexPrice - Smart Product Price Tracker",
  description: "Track product prices with mechanical precision and instant alerts",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased selection:bg-[var(--accent)] selection:text-white`}>
        <NavBar user={user} />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
