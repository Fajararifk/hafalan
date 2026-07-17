import { BookOpenText, LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { NavLinks } from "@/components/layout/NavLinks";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:border-emerald-900/30 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-600/30">
              <BookOpenText className="h-[18px] w-[18px]" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-neutral-900 sm:inline dark:text-neutral-50">
              Hafalan Al-Quran
            </span>
          </div>

          <NavLinks />

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-500 md:inline">{session?.user?.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Keluar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="animate-fade-in mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
