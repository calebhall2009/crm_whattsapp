"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkUser() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        setChecking(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setChecking(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/companies/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          // User exists and has a company — if on onboarding, send to dashboard
          if (pathname === "/onboarding") {
            router.push("/dashboard");
          }
        } else {
          // Any non-200 (401, 403, 404, 500) means user is not yet onboarded
          // (new Clerk user with no DB record, or guard wrapping the error)
          if (pathname !== "/onboarding") {
            router.push("/onboarding");
          }
        }
      } catch (err) {
        console.error("Error checking user onboarding state:", err);
      } finally {
        setChecking(false);
      }
    }

    checkUser();
  }, [isLoaded, isSignedIn, pathname, router, getToken]);

  if (!isLoaded || checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-paper-50 font-mono text-charcoal-700">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <span className="text-xl">◆</span>
          <span className="font-bold tracking-tight text-lg uppercase">Cargando Sistema...</span>
        </div>
        <div className="w-48 h-1 bg-charcoal-100 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-amber-400 rounded-full animate-progress" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
