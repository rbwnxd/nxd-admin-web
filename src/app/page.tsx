"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  useEffect(() => {
    if (!isLoading && hasHydrated) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router, hasHydrated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span>리다이렉트 중...</span>
      </div>
    </div>
  );
}
