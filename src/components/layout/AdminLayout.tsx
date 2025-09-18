"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { CustomSidebar } from "./CustomSidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, checkAuth, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoginPage && hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, isLoginPage, hasHydrated]);

  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated && hasHydrated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router, isLoginPage, hasHydrated]);

  // 로그인 페이지면 children만 렌더링
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider>
        <CustomSidebar className="" />

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
