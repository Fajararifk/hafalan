"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BookOpenText, Loader2, ArrowRight } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-500/20 blur-3xl"
      />

      <div className="animate-scale-in relative w-full max-w-sm space-y-6 rounded-2xl border border-neutral-200/70 bg-white/80 p-8 shadow-xl shadow-emerald-950/5 backdrop-blur-sm dark:border-emerald-900/40 dark:bg-neutral-900/70">
        <div className="animate-slide-up flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/30">
            <BookOpenText className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Selamat datang kembali
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Masuk untuk melanjutkan hafalanmu</p>
        </div>

        <form action={formAction} className="animate-slide-up stagger-1 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-neutral-300 bg-white/60 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-neutral-300 bg-white/60 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          {error && (
            <p className="animate-fade-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2.5 text-sm font-medium text-white shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg hover:shadow-emerald-600/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:hover:brightness-100"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="animate-slide-up stagger-2 text-center text-sm text-neutral-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
