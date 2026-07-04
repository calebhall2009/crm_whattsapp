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

        if (res.status === 401) {
          const body = await res.json().catch(() => ({}));
          // If user doesn't exist in the database, redirect to onboarding
          if (body.message?.includes("User not found") || body.message?.includes("not found")) {
            if (pathname !== "/onboarding") {
              router.push("/onboarding");
            }
          }
        } else if (res.status === 200) {
          // If user exists and is on onboarding, redirect back to dashboard
          if (pathname === "/onboarding") {
            router.push("/dashboard");
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
