"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { AppAdminUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  Shield,
  UserMinus,
  Trash2,
  Loader2,
  Copy,
} from "lucide-react";
import {
  getAppAdminUser,
  deleteAppAdminUser,
  disableAppAdminUser,
} from "../actions";
import { toast } from "sonner";
import moment from "moment";

export default function AppAdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);

  const [appAdminUser, setAppAdminUser] = useState<AppAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!jsonWebToken || !resolvedParams.id) return;

    const fetchAppAdminUser = async () => {
      setIsLoading(true);
      try {
        const result = await getAppAdminUser({
          appAdminUserId: resolvedParams.id,
          jsonWebToken,
        });

        if (result) {
          setAppAdminUser(result.appAdminUser);
        }
      } catch (error) {
        console.error("App admin user fetch error:", error);
        toast.error("앱 관리자 정보를 가져올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppAdminUser();
  }, [jsonWebToken, resolvedParams.id]);

  const handleDisableUser = async () => {
    if (!jsonWebToken || !appAdminUser) return;

    try {
      await disableAppAdminUser({
        appAdminUserId: appAdminUser._id,
        jsonWebToken,
      });

      toast.success("앱 관리자가 비활성화되었습니다.");
      setAppAdminUser({ ...appAdminUser, isEnabled: false });
    } catch (error) {
      console.error("Disable user error:", error);
      toast.error("사용자 비활성화에 실패했습니다.");
    }
  };

  const handleDeleteUser = async () => {
    if (!jsonWebToken || !appAdminUser) return;

    try {
      await deleteAppAdminUser({
        appAdminUserId: appAdminUser._id,
        jsonWebToken,
      });

      toast.success("앱 관리자가 삭제되었습니다.");
      router.push("/dashboard/app-admin");
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error("사용자 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appAdminUser) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <User className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              앱 관리자를 찾을 수 없습니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/app-admin/${appAdminUser._id}/edit`)
            }
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            수정
          </Button>

          {appAdminUser.isEnabled && !appAdminUser.deletedAt && (
            <Button
              variant="outline"
              onClick={handleDisableUser}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <UserMinus className="w-4 h-4" />
              비활성화
            </Button>
          )}

          {!appAdminUser.deletedAt && (
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </Button>
          )}
        </div>
      </div>

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">{appAdminUser.name}</h1>
          <p className="text-muted-foreground">앱 관리자 상세 정보</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                ID
              </Label>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{appAdminUser._id}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(appAdminUser._id);
                    toast.success("ID가 클립보드에 복사되었습니다.");
                  }}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  이름
                </Label>
                <p className="text-lg font-semibold">{appAdminUser.name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  계정 ID
                </Label>
                <p className="text-lg font-semibold">{appAdminUser.account}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  상태
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={appAdminUser.isEnabled ? "default" : "secondary"}
                  >
                    {appAdminUser.isEnabled ? "활성화" : "비활성화"}
                  </Badge>
                  {appAdminUser.deletedAt && (
                    <Badge variant="destructive">삭제됨</Badge>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  권한
                </Label>
                <div className="flex flex-wrap gap-1">
                  {appAdminUser.permissions &&
                  appAdminUser.permissions.length > 0 ? (
                    appAdminUser.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">권한 없음</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 날짜 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              날짜 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  생성일
                </Label>
                <p className="font-medium">
                  {moment(appAdminUser.createdAt).format(
                    "YYYY년 MM월 DD일 HH:mm"
                  )}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  수정일
                </Label>
                <p className="font-medium">
                  {moment(appAdminUser.updatedAt).format(
                    "YYYY년 MM월 DD일 HH:mm"
                  )}
                </p>
              </div>

              {appAdminUser.deletedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    삭제일
                  </Label>
                  <p className="font-medium text-red-600">
                    {moment(appAdminUser.deletedAt).format(
                      "YYYY년 MM월 DD일 HH:mm"
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
