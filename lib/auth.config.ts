import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = ["/dashboard", "/hafalan", "/murojaah", "/surah"];

// Edge-safe base config (no Prisma adapter, no bcrypt) — used directly by middleware,
// and merged into the full Node-only config in lib/auth.ts for route handlers/actions.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix)
      );
      return isProtected ? isLoggedIn : true;
    },
  },
} satisfies NextAuthConfig;
