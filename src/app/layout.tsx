import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = { title: "SkillSnap", description: "AI Career Roadmap Generator" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
