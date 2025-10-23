"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { CustomSidebar } from "./CustomSidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Toaster } from "../ui/sonner";
import { UpdateBanner } from "../update-banner";

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
    <SidebarProvider>
      <CustomSidebar className="" />
      <main className="flex h-screen w-full flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">NXD Admin</h1>
        </header>
        <UpdateBanner variant="banner" />
        <div className="flex-1 overflow-auto p-6">
          <div className="container mx-auto">{children}</div>
        </div>
        <Toaster position="top-center" />
      </main>
    </SidebarProvider>
  );
}
