"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { fetchUserMeClientCached } from "@/lib/userMeClientCache";

type AppRole = "passenger" | "driver" | "admin";

function dashboardForRole(role: AppRole) {
  if (role === "passenger") return "/passenger/bookings";
  if (role === "driver") return "/driver";
  return "/admin";
}

function roleFromBackend(roles: string[]): AppRole {
  if (roles.includes("ADMIN")) return "admin";
  if (roles.includes("DRIVER")) return "driver";
  return "passenger";
}

export function RequireDemoRole({
  role,
  requireProfileComplete = false,
  requireDriverOnboardingComplete = false,
}: {
  role: AppRole;
  requireProfileComplete?: boolean;
  requireDriverOnboardingComplete?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetchUserMeClientCached();
        if (cancelled) return;
        if (!res) {
          const next = pathname || "/";
          router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
          return;
        }
        const myRole = roleFromBackend(res.roles);
        if (myRole !== role) {
          router.replace(dashboardForRole(myRole));
        }
      } catch {
        if (cancelled) return;
        const next = pathname || "/";
        router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, requireDriverOnboardingComplete, requireProfileComplete, role, router]);

  return null;
}
