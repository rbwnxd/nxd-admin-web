"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Users,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Coins,
  Shield,
  Ban,
  UserCheck,
  User2,
} from "lucide-react";
import { getUserDetail } from "../actions";
import { toast } from "sonner";
import moment from "moment";
import { STORAGE_URL } from "@/lib/api";

interface UserDetail {
  _id: string;
  account: string;
  email: string;
  emailVerifiedAt: string | null;
  platform: "GOOGLE" | "APPLE" | "KAKAO" | "NAVER";
  platformUserId: string;
  profile: {
    name: string;
    nickname: string;
    birth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    phoneNumber: string;
  };
  countryCode: string;
  languageCode: string;
  point: {
    currentPoint: number;
    totalUsedPoint: number;
    totalReceivedPoint: number;
  };
  termsAgreedAt: string;
  nicknameChangedAt: string | null;
  imageList: {
    name: string;
    imageOriginalPath: string;
    image64Path: string;
    image128Path: string;
    image256Path: string;
    image512Path: string;
    image1024Path: string;
    imageFilename: string;
  }[];
  restrictionInfo: {
    isRestricted: boolean;
    restrictedAt: string | null;
    restrictedReason: string | null;
    restrictionEndsAt: string | null;
  };
  banInfo: {
    isBanned: boolean;
    bannedReason: string | null;
    bannedAt: string | null;
  };
  memberHash: string;
  favoriteArtistIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jsonWebToken || !resolvedParams.id) return;

    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        const result = await getUserDetail({
          userId: resolvedParams.id,
          jsonWebToken,
        });

        if (result?.user) {
          setUser(result.user);
        } else {
          toast.error("사용자 정보를 찾을 수 없습니다.");
          router.replace("/dashboard/users");
        }
      } catch (error) {
        console.error("사용자 상세 조회 오류:", error);
        toast.error("사용자 정보 조회에 실패했습니다.");
        router.replace("/dashboard/users");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [jsonWebToken, resolvedParams.id, router]);

  const getPlatformLabel = (platform: string) => {
    const platformMap: { [key: string]: string } = {
      GOOGLE: "구글",
      APPLE: "애플",
      KAKAO: "카카오",
      NAVER: "네이버",
    };
    return platformMap[platform] || platform;
  };

  const getGenderLabel = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      MALE: "남성",
      FEMALE: "여성",
      OTHER: "기타",
    };
    return genderMap[gender] || gender;
  };

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

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              사용자를 찾을 수 없습니다
            </p>
            <Button onClick={() => router.back()}>돌아가기</Button>
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
      </div>

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">사용자 상세 정보</h1>
          <p className="text-muted-foreground">
            {user.profile.nickname}님의 상세 정보
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col w-full items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    user.imageList?.[0]?.image512Path
                      ? `${STORAGE_URL}/${user.imageList[0].image512Path}`
                      : undefined
                  }
                  alt={user.profile.nickname}
                />
                <AvatarFallback className="text-2xl">
                  <User2 className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      id
                    </Label>
                    <p className="font-medium mt-1 font-mono text-sm break-all">
                      {user._id}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      닉네임
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-medium">{user.profile.nickname}</p>
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
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      이름
                    </Label>
                    <p className="font-medium mt-1">{user.profile.name}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      이메일
                      {user.emailVerifiedAt && (
                        <Badge variant="outline" className="text-xs">
                          인증됨
                        </Badge>
                      )}
                    </Label>
                    <div className="flex items-center gap-2 mt-1 flex-shrink">
                      <p className="font-medium break-all">{user.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      전화번호
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-medium">{user.profile.phoneNumber}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      성별
                    </Label>
                    <p className="font-medium mt-1">
                      {getGenderLabel(user.profile.gender)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      생년월일
                    </Label>
                    <p className="font-medium mt-1">
                      {moment(user.profile.birth).format("YYYY-MM-DD")}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      가입 플랫폼
                    </Label>
                    <p className="font-medium mt-1">
                      {getPlatformLabel(user.platform)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      회원 해시
                    </Label>
                    <p className="font-medium mt-1 font-mono text-sm break-all">
                      {user.memberHash}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 포인트 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              포인트 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg space-y-2">
                <p className="text-2xl font-bold ">
                  {user.point.currentPoint.toLocaleString()}P
                </p>
                <p className="text-sm text-muted-foreground">현재 포인트</p>
              </div>

              <div className="text-center p-4 border rounded-lg space-y-2">
                <p className="text-2xl font-bold ">
                  {user.point.totalReceivedPoint.toLocaleString()}P
                </p>
                <p className="text-sm text-muted-foreground">총 획득 포인트</p>
              </div>

              <div className="text-center p-4 border rounded-lg space-y-2">
                <p className="text-2xl font-bold ">
                  {user.point.totalUsedPoint.toLocaleString()}P
                </p>
                <p className="text-sm text-muted-foreground">총 사용 포인트</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 제재 정보 */}
        {(user.restrictionInfo.isRestricted || user.banInfo.isBanned) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Shield className="w-5 h-5" />
                제재 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.restrictionInfo.isRestricted && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <h4 className="font-medium text-red-800">이용 제한</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>제한 사유:</strong>{" "}
                      {user.restrictionInfo.restrictedReason || "사유 없음"}
                    </p>
                    {user.restrictionInfo.restrictedAt && (
                      <p>
                        <strong>제한 시작:</strong>{" "}
                        {moment(user.restrictionInfo.restrictedAt).format(
                          "YYYY-MM-DD HH:mm"
                        )}
                      </p>
                    )}
                    {user.restrictionInfo.restrictionEndsAt && (
                      <p>
                        <strong>제한 종료:</strong>{" "}
                        {moment(user.restrictionInfo.restrictionEndsAt).format(
                          "YYYY-MM-DD HH:mm"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {user.banInfo.isBanned && (
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Ban className="w-4 h-4 text-red-700" />
                    <h4 className="font-medium text-red-900">계정 차단</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>차단 사유:</strong>{" "}
                      {user.banInfo.bannedReason || "사유 없음"}
                    </p>
                    {user.banInfo.bannedAt && (
                      <p>
                        <strong>차단 일시:</strong>{" "}
                        {moment(user.banInfo.bannedAt).format(
                          "YYYY-MM-DD HH:mm"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 활동 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              활동 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  가입일
                </Label>
                <p className="font-medium mt-1">
                  {moment(user.createdAt).format("YYYY년 MM월 DD일 HH:mm")}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  최근 수정일
                </Label>
                <p className="font-medium mt-1">
                  {moment(user.updatedAt).format("YYYY년 MM월 DD일 HH:mm")}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  약관 동의일
                </Label>
                <p className="font-medium mt-1">
                  {moment(user.termsAgreedAt).format("YYYY년 MM월 DD일 HH:mm")}
                </p>
              </div>

              {user.nicknameChangedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    닉네임 변경일
                  </Label>
                  <p className="font-medium mt-1">
                    {moment(user.nicknameChangedAt).format(
                      "YYYY년 MM월 DD일 HH:mm"
                    )}
                  </p>
                </div>
              )}

              {user.emailVerifiedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    이메일 인증일
                  </Label>
                  <p className="font-medium mt-1">
                    {moment(user.emailVerifiedAt).format(
                      "YYYY년 MM월 DD일 HH:mm"
                    )}
                  </p>
                </div>
              )}

              {user.deletedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    탈퇴일
                  </Label>
                  <p className="font-medium text-red-600 mt-1">
                    {moment(user.deletedAt).format("YYYY년 MM월 DD일 HH:mm")}
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
