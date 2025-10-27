"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUserManagementStore } from "@/store/userManagementStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Loader2,
  Eye,
  MoreHorizontal,
  Users,
  UserX,
  User2,
} from "lucide-react";
import { getUsers } from "./actions";
import { toast } from "sonner";
import moment from "moment";
import { STORAGE_URL } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function UsersPage() {
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);
  const {
    users,
    totalCount,
    loading,
    currentPage,
    itemsPerPage,
    searchNickname,
    includeDeleted,
    setUsers,
    setTotalCount,
    setLoading,
    setCurrentPage,
    setSearchNickname,
    setIncludeDeleted,
  } = useUserManagementStore();

  const [searchInput, setSearchInput] = useState(searchNickname);

  useEffect(() => {
    if (!jsonWebToken) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await getUsers({
          params: {
            __skip: (currentPage - 1) * itemsPerPage,
            __limit: itemsPerPage,
            __includeDeleted: includeDeleted,
            ...(searchNickname && { nickname: searchNickname }),
          },
          jsonWebToken,
        });

        if (result) {
          setUsers(result.users || []);
          setTotalCount(result.count || 0);
        }
      } catch (error) {
        console.error("사용자 목록 조회 오류:", error);
        toast.error("사용자 목록 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [
    jsonWebToken,
    currentPage,
    itemsPerPage,
    searchNickname,
    includeDeleted,
    setUsers,
    setTotalCount,
    setLoading,
    setIncludeDeleted,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setSearchNickname(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getPlatformBadge = (platform: string) => {
    const platformMap: {
      [key: string]: {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      };
    } = {
      GOOGLE: { label: "구글", variant: "secondary" },
      APPLE: { label: "애플", variant: "secondary" },
      KAKAO: { label: "카카오", variant: "secondary" },
      NAVER: { label: "네이버", variant: "secondary" },
    };

    const platformInfo = platformMap[platform] || {
      label: platform,
      variant: "outline",
    };
    return (
      <Badge variant={platformInfo.variant} className="text-xs">
        {platformInfo.label}
      </Badge>
    );
  };

  const getGenderBadge = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      MALE: "남성",
      FEMALE: "여성",
      OTHER: "기타",
    };
    return genderMap[gender] || gender;
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (!jsonWebToken) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              로그인이 필요합니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">사용자 관리</h1>
            <p className="text-muted-foreground">
              등록된 사용자들을 관리합니다
            </p>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">총 사용자 수</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <div className="flex flex-col lg:flex-row w-full items-end justify-end mt-2 gap-4">
            <div className="space-y-2">
              <div key={"includeDeleted"} className="flex items-center gap-2">
                <Label
                  htmlFor={"includeDeleted"}
                  className="text-sm font-normal"
                >
                  {"탈퇴한 사용자 포함"}
                </Label>
                <Switch
                  id={"includeDeleted"}
                  checked={includeDeleted}
                  onCheckedChange={(checked: boolean) =>
                    setIncludeDeleted(checked)
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 검색 */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="닉네임으로 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              검색
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                사용자가 없습니다
              </p>
              <p className="text-sm text-muted-foreground">
                검색 조건을 변경해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`border rounded-lg p-4 hover:bg-muted/30 transition-colors ${
                    user.deletedAt ? "opacity-60" : "cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!user.deletedAt) {
                      router.push(`/dashboard/users/${user._id}`);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          user.imageList?.[0]?.image64Path
                            ? `${STORAGE_URL}/${user.imageList[0].image64Path}`
                            : undefined
                        }
                        alt={user.profile.nickname}
                      />
                      <AvatarFallback>
                        <User2 className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">
                          {user.profile.nickname}
                        </h3>
                        {getPlatformBadge(user.platform)}
                        {user.restrictionInfo.isRestricted && (
                          <Badge variant="destructive" className="text-xs">
                            제한됨
                          </Badge>
                        )}
                        {user.banInfo.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            차단됨
                          </Badge>
                        )}
                        {user.deletedAt && (
                          <Badge variant="secondary" className="text-xs">
                            탈퇴
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {user.profile.name} (
                          {getGenderBadge(user.profile.gender)})
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          포인트: {user.point.currentPoint.toLocaleString()} P
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          해시: {user.memberHash}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          가입일:{" "}
                          {moment(user.createdAt).format("YYYY-MM-DD HH:mm")}
                        </p>
                        {user.deletedAt && (
                          <p className="text-xs text-muted-foreground truncate">
                            탈퇴일:{" "}
                            {moment(user.deletedAt).format("YYYY-MM-DD HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
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
