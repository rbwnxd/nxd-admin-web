"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { AppAdminUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  Users,
  Plus,
  Edit,
  UserMinus,
  Trash2,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import {
  getAppAdminUsers,
  deleteAppAdminUser,
  disableAppAdminUser,
} from "./actions";
import { toast } from "sonner";
import moment from "moment";

export default function AppAdminPage() {
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);

  const [appAdminUsers, setAppAdminUsers] = useState<AppAdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!jsonWebToken) return;

    const fetchAppAdminUsers = async () => {
      setIsLoading(true);
      try {
        const result = await getAppAdminUsers({
          params: {
            __skip: (currentPage - 1) * itemsPerPage,
            __limit: itemsPerPage,
          },
          jsonWebToken,
        });

        if (result) {
          setAppAdminUsers(result.appAdminUsers || []);
          setTotalCount(result.count || 0);
        }
      } catch (error) {
        console.error("App admin users fetch error:", error);
        toast.error("앱 관리자 목록을 가져올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppAdminUsers();
  }, [jsonWebToken, currentPage, itemsPerPage]);

  const handleDisableUser = async (userId: string) => {
    if (!jsonWebToken) return;

    try {
      await disableAppAdminUser({
        appAdminUserId: userId,
        jsonWebToken,
      });

      toast.success("앱 관리자가 비활성화되었습니다.");
      // 목록 새로고침
      setAppAdminUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isEnabled: false } : user
        )
      );
    } catch (error) {
      console.error("Disable user error:", error);
      toast.error("사용자 비활성화에 실패했습니다.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!jsonWebToken) return;

    try {
      await deleteAppAdminUser({
        appAdminUserId: userId,
        jsonWebToken,
      });

      toast.success("앱 관리자가 삭제되었습니다.");
      // 목록 새로고침
      setAppAdminUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, deletedAt: new Date().toISOString() }
            : user
        )
      );
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error("사용자 삭제에 실패했습니다.");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="container mx-auto">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
      </div>

      <div className="flex md:flex-row flex-col md:items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">앱 관리자 관리</h1>
            <p className="text-muted-foreground">
              앱 관리자 계정을 생성하고 관리합니다
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/dashboard/app-admin/create")}
          className="flex items-center gap-2 md:mt-0 mt-4"
        >
          <Plus className="w-4 h-4" />새 앱 관리자 생성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>앱 관리자 목록 ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p>로딩 중...</p>
              </div>
            </div>
          ) : appAdminUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Users className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  등록된 앱 관리자가 없습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  새 앱 관리자를 생성해보세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {appAdminUsers.map((user) => (
                <div
                  key={user._id}
                  className={`border rounded-lg p-4 hover:bg-muted/30 transition-colors ${
                    !user.deletedAt ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() =>
                    !user.deletedAt &&
                    router.push(`/dashboard/app-admin/${user._id}`)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <Badge
                          variant={user.isEnabled ? "default" : "secondary"}
                        >
                          {user.isEnabled ? "활성화" : "비활성화"}
                        </Badge>
                        {user.deletedAt && (
                          <Badge variant="destructive">삭제됨</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        ID: {user._id}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        계정: {user.account}
                      </p>

                      <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-xs text-muted-foreground">
                        <span>
                          생성일:{" "}
                          {moment(user.createdAt).format("YYYY-MM-DD HH:mm")}
                        </span>
                        <span>
                          수정일:{" "}
                          {moment(user.updatedAt).format("YYYY-MM-DD HH:mm")}
                        </span>
                        {user.deletedAt && (
                          <span>
                            삭제일:{" "}
                            {moment(user.deletedAt).format("YYYY-MM-DD HH:mm")}
                          </span>
                        )}
                      </div>
                    </div>

                    {!user.deletedAt && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">메뉴 열기</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/dashboard/app-admin/${user._id}/edit`
                              );
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>

                          {user.isEnabled && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisableUser(user._id);
                              }}
                              className="text-orange-600"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              비활성화
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user._id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
