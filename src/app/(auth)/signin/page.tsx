"use client";

import { signIn } from "next-auth/react";
import  {FcGoogle } from "react-icons/fc"; // Google logo icon

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">
          Sign in to <span className="text-brand">SkillSnap</span>
        </h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="#" className="underline hover:text-brand">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-brand">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* 👇 Footer Section */}
      <footer className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SkillSnap. All rights reserved. <br />
        Created by <span className="font-semibold">@Aditi Kesharwani</span>
      </footer>
    </div>
  );
}
