"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  Users,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const menuItems = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "포토카드 관리",
    href: "/dashboard/photocards",
    icon: Image,
  },
  {
    title: "사용자 관리",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "콘텐츠 관리",
    href: "/dashboard/contents",
    icon: FileText,
  },
  {
    title: "설정",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-background border-r ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h2 className="text-lg font-semibold">NXD Admin</h2>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* 사용자 정보 */}
      {!isCollapsed && user && (
        <div className="p-4">
          <div className="text-sm">
            <p className="font-medium">{user.username}</p>
            {user.email && (
              <p className="text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* 메뉴 아이템 */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* 하단 버튼들 */}
      <div className="p-2">
        <div className="flex flex-col gap-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">테마</span>
              <ThemeToggle />
            </div>
          )}

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`${isCollapsed ? "h-8 w-8 p-0" : "justify-start"}`}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">로그아웃</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
