"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Image,
  Users,
  FileText,
  User2,
  MoreHorizontal,
  Sun,
  Moon,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "../ui/sidebar";
import { useTheme } from "next-themes";

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

export function CustomSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { setTheme, theme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Sidebar collapsible="icon" className={className}>
      {/* 헤더 */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-900 text-sidebar-primary-foreground">
                  <span className="text-center font-bold text-lg">N</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NXD Admin</span>
                  <span className="truncate text-xs">관리자 대시보드</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 사용자 정보 */}
      {user && (
        <SidebarGroup>
          <SidebarGroupLabel>사용자 정보</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User2 className="h-4 w-4" />
                  <span>{user.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* 메뉴 아이템 */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 하단 버튼들 */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {/* <Settings className="h-4 w-4" /> */}
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 dark:hidden" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 hidden dark:block" />
              <span className="flex items-center justify-between w-full">
                <span>테마 변경</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
