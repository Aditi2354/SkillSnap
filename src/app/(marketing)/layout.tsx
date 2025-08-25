import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}