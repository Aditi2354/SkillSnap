"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, LogIn, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const path = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const authed = status === "authenticated";

  useEffect(() => setMounted(true), []);

  const items = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/roadmap", label: "Roadmaps" },
    { href: "/dashboard/chat", label: "Chat" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            SkillSnap
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 md:flex">
          <ul className="flex items-center gap-1 text-[0.95rem]">
            {items.map((i) => {
              const active = path === i.href;
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    className={[
                      "px-3 py-1.5 rounded-full transition-colors",
                      active
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
                        : "text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10",
                    ].join(" ")}
                  >
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Theme toggle */}
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10 shadow-sm hover:shadow transition"
          >
            {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth */}
          {authed ? (
            <div className="ml-2 flex items-center gap-3">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="h-9 w-9 rounded-full ring-2 ring-black/5 dark:ring-white/10"
                />
              )}
              <span className="max-w-[180px] truncate text-sm font-medium">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 transition"
            >
              <LogIn size={16} /> Sign in
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10"
          >
            {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden border-t border-black/5 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <ul className="flex flex-col gap-1">
              {items.map((i) => {
                const active = path === i.href;
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "block rounded-xl px-3 py-2",
                        active
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
                          : "text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10",
                      ].join(" ")}
                    >
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 flex items-center justify-between">
              {authed ? (
                <>
                  <div className="flex items-center gap-3">
                    {session?.user?.image && (
                      <img
                        src={session.user.image}
                        alt="avatar"
                        className="h-9 w-9 rounded-full ring-2 ring-black/5 dark:ring-white/10"
                      />
                    )}
                    <span className="max-w-[160px] truncate text-sm font-medium">
                      {session?.user?.name || session?.user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90 transition"
                >
                  <LogIn size={16} /> Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
