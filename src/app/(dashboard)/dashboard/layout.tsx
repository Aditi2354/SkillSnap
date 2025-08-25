import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <Navbar />
      <div className="mx-auto max-w-6xl w-full p-6">{children}</div>
    </div>
  );
}