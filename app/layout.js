import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata = {
  title: "NexPrice - Smart Product Price Tracker",
  description: "Track prices across stores and get notified the moment your target price hits.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("theme");
                if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                  document.documentElement.classList.add("dark");
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
